import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Train {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string;

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
}