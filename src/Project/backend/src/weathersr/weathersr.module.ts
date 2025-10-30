// Module
import { Module } from '@nestjs/common';
// Config(.ENV)
import { ConfigModule } from '@nestjs/config';
// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';

// Base
import { WeatherSrController } from './weathersr.controller';
import { WeatherSrService } from './weathersr.service';

// Entities
import { SrEquip } from './entities/sr_equip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SrEquip], 'weathersr')],
  controllers: [WeatherSrController],
  providers: [WeatherSrService],
})
export class WeatherSrModule {}
