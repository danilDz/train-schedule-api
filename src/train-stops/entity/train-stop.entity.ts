import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity("train_stop")
@Unique(["trainId", "stopOrder"])
export class TrainStop {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  trainId: string;

  @Column()
  @ApiProperty()
  stationId: string;

  @Column({ type: "time", nullable: true })
  @ApiPropertyOptional({ example: "08:00:00", description: "Null for first stop" })
  arrivalTime: string | null;

  @Column({ type: "time", nullable: true })
  @ApiPropertyOptional({ example: "08:10:00", description: "Null for last stop" })
  departureTime: string | null;

  @Column()
  @ApiProperty({ example: 1 })
  stopOrder: number;

  @Column({ nullable: true })
  @ApiPropertyOptional({ example: "3" })
  platform: string | null;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne("Train", "stops", { onDelete: "CASCADE" })
  @JoinColumn({ name: "trainId" })
  train: any;

  @ManyToOne("Station", "stops", { onDelete: "RESTRICT" })
  @JoinColumn({ name: "stationId" })
  station: any;
}
