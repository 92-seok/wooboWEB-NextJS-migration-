import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Response } from '@nestjs/common';
import { AuthService } from "./auth.service";


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ){}

  @Post('/login')
  async login(@Body() body: any, @Response() res): Promise<any> {
    try {
      // 카카오 엑세스 토큰으로 사용자 정보 조회
      const { code, domain } = body;
      if(!code || !domain) {
        throw new BadRequestException('카카오 정보가 없습니다.');
      }

      const kakao = await this.authService.kakaoLogin({ code, domain });
      if(!kakao.id) {
        throw new BadRequestException('카카오 정보가 없습니다.');
      }

      res.send({
        user: kakao,
        message: '로그인 성공',
      });
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }
}