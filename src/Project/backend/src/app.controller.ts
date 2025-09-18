import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { NmsDevice } from './entities/nms_device.entity';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async Query(): Promise<any> {}

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
    } catch (error) {}
  }

  @Get('devices')
  async getDevices(@Query('BDONG_CD') bdong_cd: string): Promise<any> {
    let where: string;

    if (bdong_cd === undefined) where = '1=1';
    else where = `BDONG_CD like '${bdong_cd}%'`;

    try {
      const devices = await this.appService.getMonitorDevices(where);
      return {
        success: true,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: devices.length,
        data: devices,
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
