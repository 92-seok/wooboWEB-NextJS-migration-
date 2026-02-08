import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

// 권한(Role) 체크하는 가드
// @Roles 데코레이터로 설정된 권한을 확인하고,
// 현재 사용자가 해당 권한을 가지고 있는지 검증.

// 사용법 : 
// 1. Controller에서 @UseGuards(JwtAuthGuard, RolesGuard) 사용
// 2. 메서드에 @Roles(UserRole.ADMIN) 추가
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // @Roles 데코레이터로 설정된 필요 권한들 가져오는 로직
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // @Roles가 설정되지 않았다면 권한 체크 없이 통과
    if (!requiredRoles) {
      return true;
    }

    // 요청에서 사용자 정보를 추출 (JWT Strategy에서 주입된것)
    const { user } = context.switchToHttp().getRequest();

    // 사용자의 role에 필요한 권한 중 하나라도 포함되는지 확인
    return requiredRoles.some((role) => user.role === role);
  }
}