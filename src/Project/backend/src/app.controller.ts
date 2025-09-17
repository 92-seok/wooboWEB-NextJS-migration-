import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { NmsDevice } from './entities/nms_device.entity';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

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
  async getAllDevices() {
    try {
      //const devices = await this.appService.getAllDevices();
      const devices = await this.appService.getMonitorDevices();
      return {
        success: true,
        data: devices,
        message: 'NMS 디바이스 목록을 성공적으로 조회했습니다.',
        count: devices.length,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
        count: 0,
      };
    }
  }
}
