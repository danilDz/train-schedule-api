import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entity/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketsRepo: Repository<Ticket>,
  ) {}

  async findByBookingId(bookingId: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { bookingId },
      relations: ['booking', 'booking.seat', 'booking.seat.carriage', 'booking.train'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.booking.userId !== userId)
      throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async findById(id: string, userId: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id },
      relations: ['booking', 'booking.seat', 'booking.seat.carriage', 'booking.train'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.booking.userId !== userId)
      throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
