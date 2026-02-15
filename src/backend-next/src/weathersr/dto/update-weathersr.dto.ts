import { PartialType } from '@nestjs/mapped-types';
import { CreateWeathersrDto } from './create-weathersr.dto';

export class UpdateWeathersrDto extends PartialType(CreateWeathersrDto) {}
