import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';;
import { NmsDevice } from './entities/nms_device.entity';

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
      entities: [NmsDevice],
      synchronize: true, // 기존 DB이므로 false로 설정
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([NmsDevice]),
  ],
  controllers: [ AppController],
  providers: [AppService],
})
export class AppModule {}
