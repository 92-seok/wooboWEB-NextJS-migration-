// Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Base
import { WeatherSrController } from './weathersr.controller';
import { WeatherSrService } from './weathersr.service';

// Entities
import { SrEquip } from './entities/sr_equip.entity';
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TcmCouDngrAdm], 'weathersr'),
    TypeOrmModule.forFeature([SrEquip], 'weathersr'),
  ],
  providers: [WeatherSrService],
  controllers: [WeatherSrController],
  exports: [WeatherSrService],
})
export class WeatherSrModule {}
