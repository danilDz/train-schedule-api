import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ticket')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty()
  bookingId: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Human-readable ticket number, e.g. TKT-2026-000001' })
  ticketNumber: string;

  @Column({ type: 'timestamp' })
  @ApiProperty()
  issuedAt: Date;

  @OneToOne('Booking', 'ticket', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: any;

  @CreateDateColumn()
  createdAt: Date;
}
