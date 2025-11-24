import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { SignUpDto } from './dto/sing-up.dto';
import { SignInDto } from './dto/sing-in.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
import { Req } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // * 회원가입 *
  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  // * 로그인 *
  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  // * 로그아웃 *
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@GetCurrentUserId() userId: number) {
    return this.authService.logout(userId);
  }

  // * 토큰 재발급하기 *
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req: any) {
    const user = req.user as { userId: number; refreshToken: string };
    return this.authService.refreshTokens(user.userId, user.refreshToken);
  }
}