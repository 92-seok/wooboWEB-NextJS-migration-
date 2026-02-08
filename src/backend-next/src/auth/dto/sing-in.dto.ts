import { IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(1)
  username: string;

  @MinLength(6)
  password: string;
}
