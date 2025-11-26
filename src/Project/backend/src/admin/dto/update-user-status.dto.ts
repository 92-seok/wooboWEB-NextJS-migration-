import { IsBoolean } from 'class-validator';

// 사용자 활성화/비활성화 DTO
export class UpdateUserStatusDto {
  @IsBoolean({ message: 'IsActive는 boolean 타입이어야 합니다.' })
  isActive: boolean;
}