// Module
import { Module } from '@nestjs/common';
// Config(.ENV)
import { ConfigModule } from '@nestjs/config';
// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { WeatherSiModule } from './weathersi/weathersi.module';
import { WeatherSrModule } from 'weathersr/weathersr.module';

import { AuthModule } from './auth/auth.module';
import { NmsUser } from 'domain/nms_user.entity';
import { NmsUserAuthority } from 'domain/nms_user_authority';

// Base
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NmsUser, NmsUserAuthority]),
    AuthModule,

    WeatherSiModule,
    WeatherSrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
