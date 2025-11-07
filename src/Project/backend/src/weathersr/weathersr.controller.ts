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
    return { success: true, message: request.url + ' 아직 미구현입니다.' };
  }

  @Post()
  async Post(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    // TODO : 구현 예정
    res.status(HttpStatus.ACCEPTED);
    return { success: true, message: request.url + ' 아직 미구현입니다.' };
  }

  @Get('areaList')
  async getAreaList() {
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

  @Get('devices')
  async getDevices(@Query('BDONG_CD') bdong_cd: string): Promise<any> {
    let where: string;
    if (bdong_cd === undefined) where = '1=1';
    else where = `observatoryCode like '${bdong_cd.substring(0, 4)}%'`;

    try {
      const devices = await this.service.getMonitorDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: devices.length,
        data: devices.map((item) => ({
          IDX: `${item.observatoryCode}`,
          SIDO_CD: item.observatoryCode.slice(0, 4),
          BDONG_CD: item.observatoryCode,
          NM_DIST_OBSV: item.observatoryName,
          LOGGER_TIME: item.LOGGER_TIME,
          LOGGER_GL: item.LOGGER_GL,
          observationDateTime: item.observationDateTime,
          ResultCode: item.ResultCode,
          waterLevelStatusCode: item.waterLevelStatusCode,
          velocityStatusCode: item.velocityStatusCode,
          dischargeStatusCode: item.dischargeStatusCode,
          upsStatusCode: item.upsStatusCode,
          RTSP_URL: item.RTSP_URL,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        count: 0,
        data: null,
      };
    }
  }
}
