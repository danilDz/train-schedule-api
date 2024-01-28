import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainsController } from './trains.controller';
import { TrainsService } from './trains.service';
import { Train } from './entity/train.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Train])],
  controllers: [TrainsController],
  providers: [TrainsService]
})
export class TrainsModule {}
