import { IsString, MinLength } from 'class-validator';

// 관리자가 사용자 비밀번호 변경하는 DTO
export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(4, { message: '비밀번호는 최소 4자 이상어야아 합니다.' })
  newPassword: string;
}