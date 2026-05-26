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

@Entity('train_carriage')
@Unique(['trainId', 'carriageNumber'])
export class TrainCarriage {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  trainId: string;

  @Column()
  @ApiProperty({ example: 1 })
  carriageNumber: number;

  @Column({ type: 'varchar', default: CarriageType.ECONOMY })
  @ApiProperty({ enum: CarriageType })
  type: CarriageType;

  @Column()
  @ApiProperty({ example: 54 })
  totalSeats: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne('Train', 'carriages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainId' })
  train: any;

  @OneToMany('Seat', 'carriage', { cascade: true })
  seats: any[];
}
