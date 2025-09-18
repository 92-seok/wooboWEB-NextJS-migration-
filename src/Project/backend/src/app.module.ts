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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [NmsDevice, TcmCouDngrAdm],
      synchronize: true, // 기존 DB이므로 false로 설정
      logging: false,
    }),
    TypeOrmModule.forFeature([NmsDevice, TcmCouDngrAdm]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
