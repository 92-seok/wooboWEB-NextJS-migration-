import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async Query(): Promise<any> {
    // TODO : 구현 예정
    return { success: false, message: '아직 미구현입니다.'}
  }

  // 모든 NMS 디바이스 조회
  @Get('areaList')
  async getAreaList() {
    try {
      const result = await this.appService.getAreaList();
      return {
        success: true,
        data: result,
        message: '지역 목록을 성공적으로 조회했습니다.',
        count: result.length,
      };
    } catch (err) {
      return {
        success: true,
        data: err,
        message: '지역 목록을 조회 중 오류 발생.',
        count: err.length,
      };
    }
  }

  @Get('devices')
  async getDevices(@Query('BDONG_CD') bdong_cd: string): Promise<any> {
    let where: string;

    if (bdong_cd === undefined) where = '1=1';
    else where = `BDONG_CD like '${bdong_cd.substring(0, 4)}%'`;

    try {
      const devices = await this.appService.getMonitorDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: devices.length,
        data: devices.map((item) => ({
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

  @Get('control')
  async getControl(@Query('BDONG_CD') bdong_cd: string): Promise<any> {
    let where: string;

    if (bdong_cd === undefined) where = '1=1';
    else where = `BDONG_CD like '${bdong_cd.substring(0, 4)}%'`;

    try {
      const controlDevices = await this.appService.getControlDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: controlDevices.length,
        data: controlDevices.map((item) => ({
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
