import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty()
  bookingId: string;

  @Column({ nullable: true, unique: true })
  @ApiPropertyOptional({ description: 'Stripe Checkout Session ID' })
  stripeSessionId: string | null;

  @Column({ nullable: true })
  @ApiPropertyOptional({ description: 'Stripe Payment Intent ID' })
  stripePaymentIntentId: string | null;

  @Column({ nullable: true, unique: true })
  @ApiPropertyOptional({ description: 'Stripe Event ID for idempotency' })
  stripeEventId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ example: 250.00 })
  amount: number;

  @Column({ default: 'usd' })
  @ApiProperty({ example: 'usd' })
  currency: string;

  @Column({ type: 'varchar', default: PaymentStatus.PENDING })
  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToOne('Booking', 'payment', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: any;
}
