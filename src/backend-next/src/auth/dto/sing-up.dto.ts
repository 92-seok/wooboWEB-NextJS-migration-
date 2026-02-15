import { IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDto {
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @MinLength(2)
  username: string;
}
