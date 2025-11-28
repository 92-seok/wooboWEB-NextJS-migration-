import { IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

// 사용자 권한 DTO
export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'role은 guest, operator, user 또는 admin이어야 합니다.' })
  role: UserRole;
}