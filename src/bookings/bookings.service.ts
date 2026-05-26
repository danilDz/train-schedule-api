import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, LessThan, Repository } from "typeorm";
import { Booking } from "./entity/booking.entity";
import { Seat } from "../seats/entity/seat.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { BookingStatus } from "../common/enums/booking-status.enum";
import { TrainStatus } from "../common/enums/train-status.enum";

const RESERVATION_MINUTES = 30;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingsRepo: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a PENDING_PAYMENT reservation for the given seat.
   * Uses a pessimistic write lock to prevent race conditions.
   */
  async reserve(userId: string, dto: CreateBookingDto): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      // ── 1. Lock seat row ────────────────────────────────────────────────
      // Note: PostgreSQL does not support FOR UPDATE with LEFT JOIN, so we
      // load the seat with a pessimistic lock first (no relations), then
      // fetch the carriage in a separate query.
      const seat = await manager.getRepository(Seat).findOne({
        where: { id: dto.seatId },
        lock: { mode: "pessimistic_write" },
      });

      if (!seat) throw new NotFoundException("Seat not found");
      if (!seat.isAvailable)
        throw new BadRequestException("Seat is administratively disabled");

      const carriage = await manager.query(
        `SELECT id, "trainId" FROM train_carriage WHERE id = $1`,
        [seat.carriageId],
      );
      if (!carriage.length) throw new NotFoundException("Carriage not found");
      seat.carriage = carriage[0];

      // ── 2. Load train to check status / departure ───────────────────────
      const train = await manager.query(
        `SELECT id, status, "departureDate", price FROM train WHERE id = $1`,
        [seat.carriage.trainId],
      );
      if (!train.length) throw new NotFoundException("Train not found");

      const trainRow = train[0];
      if (trainRow.status === TrainStatus.CANCELLED)
        throw new BadRequestException(
          "Cannot book a seat on a cancelled train",
        );

      if (new Date(trainRow.departureDate) <= new Date())
        throw new BadRequestException("This train has already departed");

      // ── 3. Check no active booking for this seat ───────────────────────
      const existing = await manager.getRepository(Booking).findOne({
        where: [
          { seatId: dto.seatId, status: BookingStatus.CONFIRMED },
          { seatId: dto.seatId, status: BookingStatus.PENDING_PAYMENT },
        ],
        order: { createdAt: "DESC" },
      });

      if (existing) {
        if (existing.status === BookingStatus.CONFIRMED)
          throw new ConflictException("Seat is already booked");

        if (
          existing.status === BookingStatus.PENDING_PAYMENT &&
          existing.expiresAt > new Date()
        )
          throw new ConflictException(
            "Seat is temporarily reserved. Please try again in a few minutes.",
          );

        // Expired pending reservation — mark it expired so we can proceed
        await manager.getRepository(Booking).update(existing.id, {
          status: BookingStatus.EXPIRED,
        });
      }

      // ── 4. Check user doesn't already have a non-expired booking for this train ──
      const userAlreadyBooked = await manager.getRepository(Booking).findOne({
        where: [
          {
            userId,
            trainId: seat.carriage.trainId,
            status: BookingStatus.CONFIRMED,
          },
          {
            userId,
            trainId: seat.carriage.trainId,
            status: BookingStatus.PENDING_PAYMENT,
          },
        ],
      });

      if (userAlreadyBooked) {
        if (
          userAlreadyBooked.status === BookingStatus.PENDING_PAYMENT &&
          userAlreadyBooked.expiresAt <= new Date()
        ) {
          await manager.getRepository(Booking).update(userAlreadyBooked.id, {
            status: BookingStatus.EXPIRED,
          });
        } else {
          throw new ConflictException(
            "You already have an active booking for this train",
          );
        }
      }

      // ── 5. Create booking ───────────────────────────────────────────────
      const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
      const booking = manager.getRepository(Booking).create({
        userId,
        seatId: dto.seatId,
        trainId: seat.carriage.trainId,
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt,
        totalAmount: Number(trainRow.price),
        currency: "usd",
        stripeSessionId: null,
      });

      return manager.getRepository(Booking).save(booking);
    });
  }

  async findMyBookings(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Booking[]; total: number; page: number; limit: number }> {
    // Expire stale PENDING_PAYMENT bookings for this user before returning
    await this.expireStaleBookings(userId);

    const [data, total] = await this.bookingsRepo.findAndCount({
      where: { userId },
      relations: ['seat', 'seat.carriage', 'payment', 'ticket', 'train'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ["seat", "seat.carriage", "payment", "ticket", "train"],
    });
    if (!booking) throw new NotFoundException("Booking not found");
    return booking;
  }

  async findByIdForUser(id: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);
    if (booking.userId !== userId)
      throw new ForbiddenException("Access denied");
    return booking;
  }

  async cancel(id: string, userId: string): Promise<Booking> {
    const booking = await this.findByIdForUser(id, userId);

    if (booking.status === BookingStatus.CANCELLED)
      throw new BadRequestException("Booking is already cancelled");

    if (booking.status === BookingStatus.EXPIRED)
      throw new BadRequestException("Booking has expired");

    if (booking.status === BookingStatus.REFUNDED)
      throw new BadRequestException("Booking is already refunded");

    if (booking.status === BookingStatus.CONFIRMED) {
      // Confirmed bookings get REFUNDED status — actual Stripe refund handled separately
      booking.status = BookingStatus.REFUNDED;
    } else {
      booking.status = BookingStatus.CANCELLED;
    }

    return this.bookingsRepo.save(booking);
  }

  /** Confirms a booking after successful Stripe payment. Called from PaymentsService. */
  async confirmByStripeSession(
    stripeSessionId: string,
  ): Promise<Booking | null> {
    const booking = await this.bookingsRepo.findOne({
      where: { stripeSessionId },
    });
    if (!booking) return null;

    // Idempotent — if already confirmed, return as-is
    if (booking.status === BookingStatus.CONFIRMED) return booking;

    booking.status = BookingStatus.CONFIRMED;
    return this.bookingsRepo.save(booking);
  }

  async updateStripeSession(
    id: string,
    stripeSessionId: string,
  ): Promise<Booking> {
    const booking = await this.findById(id);
    booking.stripeSessionId = stripeSessionId;
    return this.bookingsRepo.save(booking);
  }

  private async expireStaleBookings(userId: string): Promise<void> {
    await this.bookingsRepo
      .createQueryBuilder()
      .update(Booking)
      .set({ status: BookingStatus.EXPIRED })
      .where("userId = :userId", { userId })
      .andWhere("status = :status", { status: BookingStatus.PENDING_PAYMENT })
      .andWhere('"expiresAt" < NOW()')
      .execute();
  }

  /** Called by scheduler to expire all stale bookings globally. */
  async expireAllStale(): Promise<number> {
    const result = await this.bookingsRepo.update(
      {
        status: BookingStatus.PENDING_PAYMENT,
        expiresAt: LessThan(new Date()),
      },
      { status: BookingStatus.EXPIRED },
    );
    return result.affected ?? 0;
  }
}
