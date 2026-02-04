// 사용자 권한 레벨
// - USER: 일반 사용자
// - ADMIN : 관리자 (모든 권한)

export enum UserRole {
  GUEST = 'guest',
  OPERATOR = 'operator',
  USER = 'user',
  ADMIN = 'admin',
}