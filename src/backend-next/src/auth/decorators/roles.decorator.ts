import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

// 라우트에 필요한 권한을 설정하는 데코레이터
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
