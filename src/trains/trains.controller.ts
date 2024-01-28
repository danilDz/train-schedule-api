import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Controller('api/trains')
export class TrainsController {
  @Get()
  @UseGuards(AuthGuard)
  getHello() {
    return "hello";
  }
}
