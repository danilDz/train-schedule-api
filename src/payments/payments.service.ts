import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe = require('stripe');
import type { Stripe as StripeCore } from 'stripe/cjs/stripe.core';
import { Payment } from './entity/payment.entity';
import { Booking } from '../bookings/entity/booking.entity';
import { Ticket } from '../tickets/entity/ticket.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class PaymentsService {
  private stripe: StripeCore;

  constructor(
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingsRepo: Repository<Booking>,
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
    private readonly bookingsService: BookingsService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-04-22.dahlia' },
    );
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    const booking = await this.bookingsRepo.findOne({
      where: { id: dto.bookingId },
      relations: ['seat', 'seat.carriage', 'train'],
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId)
      throw new BadRequestException('Access denied');

    if (booking.status !== BookingStatus.PENDING_PAYMENT)
      throw new BadRequestException(
        `Cannot pay for a booking with status "${booking.status}"`,
      );

    if (booking.expiresAt <= new Date())
      throw new BadRequestException(
        'Booking reservation has expired. Please create a new booking.',
      );

    // Prevent duplicate checkout sessions — if one already exists, reuse it
    if (booking.stripeSessionId) {
      try {
        const existing = await this.stripe.checkout.sessions.retrieve(
          booking.stripeSessionId,
        );
        if (existing.status === 'open') {
          return { url: existing.url! };
        }
      } catch {
        // session expired or invalid — create new one
      }
    }

    const clientUrl =
      this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';

    const carriageType = booking.seat?.carriage?.type ?? 'ECONOMY';
    const trainNumber = booking.train?.trainNumber ?? booking.trainId;
    const seatNum = booking.seat?.seatNumber ?? '?';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: booking.currency,
            product_data: {
              name: `Train Ticket — ${booking.train?.departureCity ?? ''} → ${booking.train?.arrivalCity ?? ''}`,
              description: `Train ${trainNumber} · Carriage ${booking.seat?.carriage?.carriageNumber ?? '?'} · Seat ${seatNum} · Class: ${carriageType}`,
            },
            unit_amount: Math.round(Number(booking.totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
        userId,
      },
      success_url: `${clientUrl}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${clientUrl}/booking/cancel?booking_id=${booking.id}`,
      expires_at: Math.floor(booking.expiresAt.getTime() / 1000),
    });

    // Store session ID on booking
    await this.bookingsService.updateStripeSession(booking.id, session.id);

    return { url: session.url! };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): StripeCore.Event {
    const secret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }
  }

  async handleWebhookEvent(event: StripeCore.Event): Promise<void> {
    // ── Idempotency guard ───────────────────────────────────────────────────
    const existing = await this.paymentsRepo.findOne({
      where: { stripeEventId: event.id },
    });
    if (existing) return; // already processed

    switch (event.type) {
      case 'checkout.session.completed': {
        await this.handleCheckoutCompleted(
          event.data.object as StripeCore.Checkout.Session,
          event.id,
        );
        break;
      }
      case 'checkout.session.expired': {
        await this.handleCheckoutExpired(
          event.data.object as StripeCore.Checkout.Session,
        );
        break;
      }
      case 'charge.refunded': {
        await this.handleChargeRefunded(
          event.data.object as StripeCore.Charge,
          event.id,
        );
        break;
      }
      default:
        // Unhandled event types — ignore safely
        break;
    }
  }

  private async handleCheckoutCompleted(
    session: StripeCore.Checkout.Session,
    eventId: string,
  ): Promise<void> {
    const booking = await this.bookingsService.confirmByStripeSession(session.id);
    if (!booking) return;

    // Create Payment record
    const payment = this.paymentsRepo.create({
      bookingId: booking.id,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      stripeEventId: eventId,
      amount: Number(booking.totalAmount),
      currency: booking.currency,
      status: PaymentStatus.SUCCEEDED,
    });
    await this.paymentsRepo.save(payment);

    // Generate ticket
    await this.generateTicket(booking.id);
  }

  private async handleCheckoutExpired(
    session: StripeCore.Checkout.Session,
  ): Promise<void> {
    const booking = await this.bookingsRepo.findOne({
      where: { stripeSessionId: session.id },
    });
    if (!booking) return;
    if (booking.status === BookingStatus.PENDING_PAYMENT) {
      booking.status = BookingStatus.EXPIRED;
      await this.bookingsRepo.save(booking);
    }
  }

  private async handleChargeRefunded(
    charge: StripeCore.Charge,
    eventId: string,
  ): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!paymentIntentId) return;

    const payment = await this.paymentsRepo.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });
    if (!payment) return;

    payment.status = PaymentStatus.REFUNDED;
    payment.stripeEventId = eventId;
    await this.paymentsRepo.save(payment);

    // Mark booking as refunded
    await this.bookingsRepo.update(payment.bookingId, {
      status: BookingStatus.REFUNDED,
    });
  }

  private async generateTicket(bookingId: string): Promise<void> {
    const existing = await this.ticketsRepo.findOne({ where: { bookingId } });
    if (existing) return; // idempotent

    const count = await this.ticketsRepo.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const ticket = this.ticketsRepo.create({
      bookingId,
      ticketNumber,
      issuedAt: new Date(),
    });
    await this.ticketsRepo.save(ticket);
  }

  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    return this.paymentsRepo.findOne({ where: { bookingId } });
  }
}
