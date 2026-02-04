import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NmsUser } from '../auth/entities/nms_user.entity';
import { NmsUserAuthority } from '../auth/entities/nms_user_authority.entity';
import { NmsBrdSend } from '../weathersi/entities/nms_brdsend.entity';
import { NmsDisSend } from '../weathersi/entities/nms_dissend.entity';
import { NmsGateControl } from '../weathersi/entities/nms_gatecontrol.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NmsUser,
      NmsUserAuthority,
    ]),
    // weathserSI DB
    TypeOrmModule.forFeature([
      NmsUser,
      NmsBrdSend,
      NmsDisSend,
      NmsGateControl,
    ], 'weathersi'),
    AuthModule, // JwtAuthGuard, RolesGuard 사용을 위해 임포트한다
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }