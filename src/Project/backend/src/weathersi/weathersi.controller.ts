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
import { WeatherSiService } from './weathersi.service';

@Controller('weathersi')
export class WeatherSiController {
  constructor(private readonly service: WeatherSiService) {}

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

  @Get('admMng/getAdm')
  async getAdm(@Query('admCode') admCode: string) {
    let data;

    try {
      data = await this.service.getAreaList();
    } catch {}

    return {
      header: {
        resultMsg: 'NORMAL_SERVICE',
        resultCode: '00',
        errorMsg: null,
      },
      body: data,
    };
  }

  @Get('admMng/setAdm')
  async setAdm(@Query('admCode') admCode: string) {
    return {
      header: {
        resultMsg: 'NORMAL_SERVICE',
        resultCode: '00',
        errorMsg: null,
      },
      body: null,
    };
  }

  // 모든 NMS 디바이스 조회
  @Get('areaList')
  async getAreaList(@Query('ADMCODE') admcode: string) {
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
    else where = `BDONG_CD like '${bdong_cd.substring(0, 4)}%'`;

    try {
      const devices = await this.service.getMonitorDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: devices.length,
        data: devices.map((item) => ({
          IDX: `${item.BDONG_CD}_${item.CD_DIST_OBSV}`,
          SIDO_CD: item.BDONG_CD.slice(0, 4),
          BDONG_CD: item.BDONG_CD,
          CD_DIST_OBSV: item.CD_DIST_OBSV,
          GB_OBSV: item.GB_OBSV,
          NM_DIST_OBSV: item.NM_DIST_OBSV.replace('', '')
            .replace('_강우', '')
            .replace('_수위', '')
            .replace('_변위', '')
            .replace('_함수비', '')
            .replace('_적설', '')
            .replace('_경사', '')
            .replace('_침수', '')
            .replace('_예경보', '')
            .replace('_전광판', '')
            .replace('_차단기', ''),
          ErrorChk: item.ErrorChk,
          LastDate: item.LastDate,
          LastStatus: item.LastStatus,
          DTL_ADRES: item.DTL_ADRES,
          LAT: item.LAT,
          LON: item.LON,
          PHONE: item.ConnPhone,
          IP: item.ConnIP,
          PORT: item.ConnPort,
          DATA: item.DATA,
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

  @Get('control')
  async getControl(@Query('BDONG_CD') bdong_cd: string): Promise<any> {
    let where: string;

    if (bdong_cd === undefined) where = '1=1';
    else where = `BDONG_CD like '${bdong_cd.substring(0, 4)}%'`;

    try {
      const controlDevices = await this.service.getControlDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: controlDevices.length,
        data: controlDevices.map((item) => ({
          BDONG_CD: item.BDONG_CD,
          CD_DIST_OBSV: item.CD_DIST_OBSV,
          GB_OBSV: item.GB_OBSV,
          NM_DIST_OBSV: item.NM_DIST_OBSV.replace('', '')
            .replace('_강우', '')
            .replace('_수위', '')
            .replace('_변위', '')
            .replace('_함수비', '')
            .replace('_적설', '')
            .replace('_경사', '')
            .replace('_침수', '')
            .replace('_예경보', '')
            .replace('_방송', '')
            .replace('_전광판', '')
            .replace('_차단기', ''),
          ErrorChk: item.ErrorChk,
          LastDate: item.LastDate,
          LastStatus: item.LastStatus,
          DTL_ADRES: item.DTL_ADRES,
          LAT: item.LAT,
          LON: item.LON,
          DATA: item.DATA,
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

  @Post('sendBrd')
  async postBrd(
    @Body() BODY: any,
    @Body('BDONG_CD') BDONG_CD: string,
    @Body('CD_DIST_OBSV') CD_DIST_OBSV: string,
    @Body('Message') Message: string,
    @Body('Auth') Auth: string,
  ): Promise<any> {
    console.log(`Body: ${BDONG_CD} ${CD_DIST_OBSV} ${Message} ${Auth}`);

    try {
      const controlDevices = await this.service.insertBrdSend(BODY);

      return {
        success: true,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    } catch {
      return {
        success: false,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    }
  }

  @Post('sendDis')
  async postDis(
    @Body() BODY: any,
    @Body('BDONG_CD') BDONG_CD: string,
    @Body('CD_DIST_OBSV') CD_DIST_OBSV: string,
    @Body('Message') Message: string,
    @Body('Auth') Auth: string,
  ): Promise<any> {
    console.log(`Body: ${BDONG_CD} ${CD_DIST_OBSV} ${Message} ${Auth}`);

    try {
      const controlDevices = await this.service.insertDisSend(BODY);

      return {
        success: true,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    } catch {
      return {
        success: false,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    }
  }

  @Post('sendGate')
  async postGate(
    @Body() BODY: any,
    @Body('BDONG_CD') BDONG_CD: string,
    @Body('CD_DIST_OBSV') CD_DIST_OBSV: string,
    @Body('Gate') Gate: string,
    @Body('Auth') Auth: string,
  ): Promise<any> {
    console.log(`Body: ${BDONG_CD} ${CD_DIST_OBSV} ${Gate} ${Auth}`);

    try {
      const controlDevices = await this.service.insertGateControl(BODY);

      return {
        success: true,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    } catch {
      return {
        success: false,
        BDONG_CD: BDONG_CD,
        CD_DIST_OBSV: CD_DIST_OBSV,
      };
    }
  }
}
