import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { post } from 'axios';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async Query(): Promise<any> {
    // TODO : 구현 예정
    return { success: true, message: '아직 미구현입니다.' };
  }

  @Get('download')
  async getDownload(@Res() res) {
    res.setHeader(
      'Content-disposition',
      "attachment; filename='com.woobo.online.apk'",
    );
    return await res.download('files/com.woobo.online.apk');
  }

  /*
  @Put('/memo/:id')
  putMemo(
    @Param('id') idx: string,
    @Body('content') content: string,
  ): string[] {
    console.log(idx, content);
    return this.appService.putMemo(idx, content);
  }
    */
}
