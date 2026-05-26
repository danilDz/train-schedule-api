import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CarriageType } from '../../common/enums/carriage-type.enum';

@Entity('seat')
@Unique(['carriageId', 'seatNumber'])
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  carriageId: string;

  @Column()
  @ApiProperty({ example: 1 })
  seatNumber: number;

  @Column({ type: 'varchar', default: CarriageType.ECONOMY })
  @ApiProperty({ enum: CarriageType })
  class: CarriageType;

  @Column({ default: true })
  @ApiProperty({ description: 'Set to false to administratively disable a seat' })
  isAvailable: boolean;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne('TrainCarriage', 'seats', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carriageId' })
  carriage: any;

  @OneToMany('Booking', 'seat')
  bookings: any[];
}
