import {
  Controller,
  Post,
  Body,
  Response,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: any, @Response() res): Promise<any> {
    try {
      const { code, domain } = body;
      if (!code || !domain) {
        throw new BadRequestException('요청 오류');
      }

      const kakao = await this.authService.kakaoLogin({ code, domain });
      console.log('카카오 사용자 정보:', kakao);

      res.send({
        message: 'success',
        user: kakao,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
