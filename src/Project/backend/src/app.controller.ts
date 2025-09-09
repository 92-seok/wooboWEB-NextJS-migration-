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
  @Get('devices')
  async getAllDevices() {
    try {
      const devices = await this.appService.getAllDevices();
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
