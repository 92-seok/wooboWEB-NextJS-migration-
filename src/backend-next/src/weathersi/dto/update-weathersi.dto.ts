import { PartialType } from '@nestjs/mapped-types';
import { CreateWeathersiDto } from './create-weathersi.dto';

export class UpdateWeathersiDto extends PartialType(CreateWeathersiDto) {}
