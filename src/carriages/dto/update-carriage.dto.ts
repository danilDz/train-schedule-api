import { PartialType } from '@nestjs/swagger';
import { CreateCarriageDto } from './create-carriage.dto';

export class UpdateCarriageDto extends PartialType(CreateCarriageDto) {}
