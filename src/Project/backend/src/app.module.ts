import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Config(.ENV)
import { ConfigModule } from '@nestjs/config';

// TypeOrm
import { TypeOrmModule } from '@nestjs/typeorm';

// entity
import { NmsDevice } from './entities/nms_device.entity';
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';
import { NmsBrdSend } from './entities/nms_brdsend.entity';
import { NmsGateControl } from './entities/nms_gatecontrol.entity';
import { NmsUser } from 'domain/nms_user.entity';
import { NmsUserAuthority } from 'domain/nms_user_authority';
import { AuthModule } from './auth/auth.module';


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
      entities: [NmsDevice, TcmCouDngrAdm, NmsBrdSend, NmsGateControl, NmsUser, NmsUserAuthority],
      synchronize: true, // 기존 DB이므로 false로 설정
      logging: false,
    }),
    TypeOrmModule.forFeature([NmsDevice, TcmCouDngrAdm, NmsBrdSend, NmsGateControl, NmsUser, NmsUserAuthority]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
