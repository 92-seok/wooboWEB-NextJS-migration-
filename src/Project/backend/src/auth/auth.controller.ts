import { Body, Controller, Get, Post, Request, UseGuards, NotFoundException } from '@nestjs/common';
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

  // * 토큰 검증 엔드포인트 *
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@GetCurrentUserId() userId: number) {
    // DB에서 최신 정보 조회하기
    const user = await this.authService.getCurrentUser(userId);

    return {
      success: true,
      user,
    };
  }

  // 현재 로그인된 사용자 정보 조회
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetCurrentUserId() userId: number) {
    // JwtAuthGuard에서 검증된 사용자 ID로 최신 정보 조회
    const user = await this.authService.getCurrentUser(userId);

    return {
      success: true,
      user,
    }
  };
}
