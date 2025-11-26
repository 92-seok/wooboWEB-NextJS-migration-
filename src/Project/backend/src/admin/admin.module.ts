import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NmsUser } from '../auth/entities/nms_user.entity';
import { NmsUserAuthority } from '../auth/entities/nms_user_authority.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NmsUser, NmsUserAuthority]),
    AuthModule, // JwtAuthGuard, RolesGuard 사용을 위해 임포트한다
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }