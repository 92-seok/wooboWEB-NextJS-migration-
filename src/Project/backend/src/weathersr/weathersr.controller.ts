import {
  Controller,
  Get,
  Post,
  Query,
  HttpStatus,
  Req,
  Res,
  Body,
} from '@nestjs/common';
import type { Request, Response } from 'express';

// Service
import { WeatherSrService } from './weathersr.service';

@Controller('weathersr')
export class WeatherSrController {
  constructor(private readonly service: WeatherSrService) {}

  @Get()
  async Get(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    // TODO : 구현 예정
    res.status(HttpStatus.ACCEPTED);
    return { success: true, message: request.ip + '아직 미구현입니다.' };
  }

  @Post()
  async Post(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    // TODO : 구현 예정
    res.status(HttpStatus.ACCEPTED);
    return { success: true, message: request.ip + '아직 미구현입니다.' };
  }

  @Get('areaList')
  async getAreaList_sr() {
    try {
      const result = await this.service.getAreaList();
      return {
        success: true,
        message: '지역 목록을 성공적으로 조회했습니다.',
        count: result.length,
        data: result,
      };
    } catch (err) {
      return {
        success: false,
        message: '지역 목록을 조회 중 오류 발생.',
        count: 0,
        data: null,
      };
    }
  }
}
