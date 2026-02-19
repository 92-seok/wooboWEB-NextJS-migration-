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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';

// 관리자 전용 API - 모든 엔드포인트는 JWT 인증 + ADMIN 권한 필요
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // 전체 사용자 목록 조회하기 (페이징 + 필터링)
  // GET /admin/users?page=1&limit=10&role=user&search=우보
  @Get('users')
  async getAllUsers(@Query() query: UserListQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  // 특정 사용자 조회하기
  // GET /admin/users/:id
  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  // 사용자 권한 변경하기 (USER <-> ADMIN)
  // PATCH /admin/users/:id/role
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, updateUserRoleDto);
  }

  // 사용자 비밀번호 강제로 변경
  // PATCH /admin/users/:id/password
  @Patch('users/:id/password')
  async updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.adminService.updateUserPassword(id, updateUserPasswordDto);
  }

  // 사용자 활성화, 비활성화
  // PATCH /admin/users/:id/status
  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, updateUserStatusDto);
  }

  // 사용자 삭제하기
  // DELETE admin/users/:id
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  // 제어 이력 조회 API (Auth 필드에 username 저장됨)

  // 모든 장비 제어 이력 통합 조회하기
  // GET /admin/control-history?BDONG_CD=1234567890&CD_DIST_OBSV=ABC123&limit=100
  @Get('control-history')
  async getAllControlHistory(@Query() query: any) {
    return this.adminService.getAllControlHistory(query);
  }

  // 모든 장비 제어 이력 통합 조회하기
  // GET /admin/control-history/broadcast?BDONG_CD=1234567890&CD_DIST_OBSV=ABC123&limit=100
  @Get('control-history/broadcast')
  async getBroadcastHistory(@Query() query: any) {
    return this.adminService.getBroadcastHistory(query);
  }

  // 모든 장비 제어 이력 통합 조회하기
  // GET /admin/control-history/display?BDONG_CD=1234567890&CD_DIST_OBSV=ABC123&limit=100
  @Get('control-history/display')
  async getDisplayHistory(@Query() query: any) {
    return this.adminService.getDisplayHistory(query);
  }

  // 모든 장비 제어 이력 통합 조회하기
  // GET /admin/control-history/gate?BDONG_CD=1234567890&CD_DIST_OBSV=ABC123&limit=100
  @Get('control-history/gate')
  async getGateHistory(@Query() query: any) {
    return this.adminService.getGateHistory(query);
  }
}
