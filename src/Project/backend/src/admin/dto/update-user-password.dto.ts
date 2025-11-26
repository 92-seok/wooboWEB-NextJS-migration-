import { IsString, MinLength } from 'class-validator';

// 관리자가 사용자 비밀번호 변경하는 DTO
export class UpdateUserPasswordDto {
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상어야아 합니다.' })
  newPassword: string;
}