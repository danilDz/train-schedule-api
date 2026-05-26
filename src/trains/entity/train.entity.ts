import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TrainStatus } from "../../common/enums/train-status.enum";

@Entity()
export class Train {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

  @Column({ nullable: true, unique: true })
  @ApiPropertyOptional({ example: "091Ш" })
  trainNumber: string | null;

  @Column()
  @ApiProperty()
  departureCity: string;

  @Column()
  @ApiProperty()
  arrivalCity: string;

  @Column("timestamp")
  @ApiProperty()
  departureDate: Date;

  @Column("timestamp")
  @ApiProperty()
  arrivalDate: Date;

  @Column()
  @ApiProperty()
  availableSeats: number;

  @Column()
  @ApiProperty()
  price: number;

  @Column({ type: "varchar", default: TrainStatus.ON_TIME })
  @ApiProperty({ enum: TrainStatus })
  status: TrainStatus;

  @Column({ default: 0 })
  @ApiProperty()
  delayMinutes: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany("TrainCarriage", "train")
  carriages: any[];

  @OneToMany("TrainStop", "train", { cascade: true })
  stops: any[];
}