import { Module } from '@nestjs/common';
import { WeathersiService } from './weathersi.service';
import { WeathersiController } from './weathersi.controller';
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [WeathersiController],
  providers: [WeathersiService],
})
export class WeathersiModule {}
