import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity()
export class Station {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty({ example: "Kyiv-Passenger" })
  name: string;

  @Column()
  @ApiProperty({ example: "Kyiv" })
  city: string;

  @Column({ unique: true })
  @ApiProperty({ example: "K" })
  code: string;

  @Column()
  @ApiProperty({ example: 10 })
  platformCount: number;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  @ApiPropertyOptional({ example: 50.4501 })
  latitude: number | null;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  @ApiPropertyOptional({ example: 30.5234 })
  longitude: number | null;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;

  @OneToMany("TrainStop", "station")
  stops: any[];
}
