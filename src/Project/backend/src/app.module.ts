// Module
import { Module } from '@nestjs/common';
// Config(.ENV)
import { ConfigModule } from '@nestjs/config';
// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  ormConfig_default,
  ormConfig_weathersi,
  ormConfig_weathersr,
} from '@config/typeorm.config';

import { WeatherSiModule } from './weathersi/weathersi.module';
import { WeatherSrModule } from 'weathersr/weathersr.module';

import { AuthModule } from './auth/auth.module';
import { NmsUser } from './auth/entities/nms_user.entity';
import { NmsUserAuthority } from './auth/entities/nms_user_authority';

// Base
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      name: 'weathersi',
      useFactory: ormConfig_weathersi,
    }),
    TypeOrmModule.forRootAsync({
      name: 'weathersr',
      useFactory: ormConfig_weathersr,
    }),
    WeatherSiModule,
    WeatherSrModule,
    AuthModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
