import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Train {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  departureCity: string;

  @Column()
  arrivalCity: string;

  @Column("timestamp")
  departureDate: Date;

  @Column("timestamp")
  arrivalDate: Date;

  @Column()
  availableSeats: number;

  @Column()
  price: number;
}