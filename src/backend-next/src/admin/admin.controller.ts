import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== 사용자 관리 ==========

  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      role,
      isActive: isActive ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id', ParseIntPipe) id: number, @Body() data: { role: string }) {
    return this.adminService.updateUserRole(id, data.role);
  }

  @Patch('users/:id/password')
  async updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { newPassword: string },
  ) {
    return this.adminService.updateUserPassword(id, data.newPassword);
  }

  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { isActive: boolean },
  ) {
    return this.adminService.updateUserStatus(id, data.isActive);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // ========== 제어 이력 관리 ==========

  @Get('control-history')
  async getAllControlHistory(
    @Query('BDONG_CD') bdongCd?: string,
    @Query('CD_DIST_OBSV') cdDistObsv?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getAllControlHistory({
      BDONG_CD: bdongCd,
      CD_DIST_OBSV: cdDistObsv,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
  }

  @Get('control-history/broadcast')
  async getBroadcastHistory(
    @Query('BDONG_CD') bdongCd?: string,
    @Query('CD_DIST_OBSV') cdDistObsv?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getBroadcastHistory({
      BDONG_CD: bdongCd,
      CD_DIST_OBSV: cdDistObsv,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
  }

  @Get('control-history/display')
  async getDisplayHistory(
    @Query('BDONG_CD') bdongCd?: string,
    @Query('CD_DIST_OBSV') cdDistObsv?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getDisplayHistory({
      BDONG_CD: bdongCd,
      CD_DIST_OBSV: cdDistObsv,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
  }

  @Get('control-history/gate')
  async getGateHistory(
    @Query('BDONG_CD') bdongCd?: string,
    @Query('CD_DIST_OBSV') cdDistObsv?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.getGateHistory({
      BDONG_CD: bdongCd,
      CD_DIST_OBSV: cdDistObsv,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
  }
}
