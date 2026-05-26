import { ApiProperty } from "@nestjs/swagger";

export class DashboardStatsDto {
  @ApiProperty({ example: 128, description: "Total number of trains" })
  totalTrains: number;

  @ApiProperty({ example: 43, description: "Total number of stations" })
  totalStations: number;

  @ApiProperty({ example: 7, description: "Number of delayed trains" })
  delayedTrains: number;

  @ApiProperty({ example: 2, description: "Number of cancelled trains" })
  cancelledTrains: number;

  @ApiProperty({ example: 85, description: "Number of non-cancelled trains" })
  activeRoutes: number;

  @ApiProperty({ example: 340, description: "Total number of bookings" })
  totalBookings: number;

  @ApiProperty({ example: 280, description: "Confirmed (paid) bookings" })
  successfulPayments: number;

  @ApiProperty({ example: 15, description: "Pending payment bookings" })
  pendingPayments: number;

  @ApiProperty({ example: 78.5, description: "Seat occupancy rate in percent" })
  occupancyRate: number;
}
