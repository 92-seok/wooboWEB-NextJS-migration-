import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';

// 사용자 목록 조회 쿼리 DTO (페이징, 필터링)
export class UserListQueryDto {
  // 페이지 번호
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  // 페이지당 항목 수 (기본값은 10)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  // 역할 필터링
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  // 아이디 제어 필터링
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  // 검색어 (이름 또는 아이디)
  @IsOptional()
  @IsString()
  search?: string;
}