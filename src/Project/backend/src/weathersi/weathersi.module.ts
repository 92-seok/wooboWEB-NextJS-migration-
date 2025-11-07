// Module
import { Module } from '@nestjs/common';
// Config(.ENV)
import { ConfigModule } from '@nestjs/config';
// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Base
import { WeatherSiController } from './weathersi.controller';
import { WeatherSiService } from './weathersi.service';

// Entities
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';
import { NmsDevice } from './entities/nms_device.entity';
import { NmsBrdSend } from './entities/nms_brdsend.entity';
import { NmsDisSend } from './entities/nms_dissend.entity';
import { NmsGateControl } from './entities/nms_gatecontrol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TcmCouDngrAdm, NmsDevice, NmsBrdSend, NmsDisSend, NmsGateControl],
      'weathersi',
    ),
  ],
  //exports: [TypeOrmModule],
  providers: [WeatherSiService],
  controllers: [WeatherSiController],
})
export class WeatherSiModule {}
