import { Module } from '@nestjs/common';
import { WeathersrService } from './weathersr.service';
import { WeathersrController } from './weathersr.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WeathersrController],
  providers: [WeathersrService],
})
export class WeathersrModule {}
