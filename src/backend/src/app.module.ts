import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config(.ENV)
import { ConfigModule } from '@nestjs/config';

// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';

// Module
import { AuthModule } from './auth/auth.module';
import { WeatherSiModule } from './weathersi/weathersi.module';
import { WeatherSrModule } from './weathersr/weathersr.module';
import { AdminModule } from './admin/admin.module';

// Entity
import { NmsUser } from './auth/entities/nms_user.entity';
import { NmsUserAuthority } from './auth/entities/nms_user_authority.entity';
import { NmsUserToken } from './auth/entities/nms_user_token.entity';
import { SrEquip } from './weathersr/entities/sr_equip.entity';
import { TcmCouDngrAdm as TcmCouDngrAdmSI } from './weathersi/entities/tcm_cou_dngr_adm.entity';
import { TcmCouDngrAdm as TcmCouDngrAdmSR } from './weathersr/entities/tcm_cou_dngr_adm.entity';
import { NmsDevice } from './weathersi/entities/nms_device.entity';
import { NmsBrdSend } from './weathersi/entities/nms_brdsend.entity';
import { NmsDisSend } from './weathersi/entities/nms_dissend.entity';
import { NmsGateControl } from './weathersi/entities/nms_gatecontrol.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development.local', '.env.development'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        NmsDevice,
        TcmCouDngrAdmSI,
        NmsBrdSend,
        NmsGateControl,
        NmsUser,
        NmsUserAuthority,
        NmsUserToken,
      ],
      synchronize: true,
      logging: false,
    }),
    // 통합관측 DB
    TypeOrmModule.forRoot({
      name: 'weathersi',
      type: 'mysql',
      host: process.env.DB_HOST_WEATHERSI,
      port: parseInt(process.env.DB_PORT_WEATHERSI || '3306'),
      username: process.env.DB_USERNAME_WEATHERSI,
      password: process.env.DB_PASSWORD_WEATHERSI,
      database: process.env.DB_DATABASE_WEATHERSI,
      entities: [NmsDevice, TcmCouDngrAdmSI, NmsBrdSend, NmsDisSend, NmsGateControl],
      synchronize: false,
      logging: false,
    }),
    // 소하천 DB
    TypeOrmModule.forRoot({
      name: 'weathersr',
      type: 'mysql',
      host: process.env.DB_HOST_WEATHERSR,
      port: parseInt(process.env.DB_PORT_WEATHERSR || '3306'),
      username: process.env.DB_USERNAME_WEATHERSR,
      password: process.env.DB_PASSWORD_WEATHERSR,
      database: process.env.DB_DATABASE_WEATHERSR,
      entities: [SrEquip, TcmCouDngrAdmSR],
      synchronize: false,
      logging: false,
    }),
    TypeOrmModule.forFeature([
      NmsDevice,
      TcmCouDngrAdmSR,
      NmsBrdSend,
      NmsGateControl,
      NmsUser,
      NmsUserAuthority,
      NmsUserToken,
    ]),
    AuthModule,
    WeatherSiModule,
    WeatherSrModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
