import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Entity('booking')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Index()
  @Column()
  @ApiProperty()
  userId: string;

  @Index()
  @Column()
  @ApiProperty()
  seatId: string;

  @Index()
  @Column()
  @ApiProperty()
  trainId: string;

  @Column({ type: 'varchar', default: BookingStatus.PENDING_PAYMENT })
  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @Column({ type: 'timestamp' })
  @ApiProperty({ description: 'Reservation expires at (15 min from creation)' })
  expiresAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Stripe Checkout Session ID' })
  stripeSessionId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ example: 250.00 })
  totalAmount: number;

  @Column({ default: 'usd' })
  @ApiProperty({ example: 'usd' })
  currency: string;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne('User', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user: any;

  @ManyToOne('Seat', 'bookings', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seatId' })
  seat: any;

  @ManyToOne('Train', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'trainId' })
  train: any;

  @OneToOne('Payment', 'booking', { cascade: true })
  payment: any;

  @OneToOne('Ticket', 'booking', { cascade: true })
  ticket: any;
}
