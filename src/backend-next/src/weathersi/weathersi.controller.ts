import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { WeathersiService } from './weathersi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUserId } from '../auth/decorators/get-current-user-id.decorator';

@Controller('weathersi')
@UseGuards(JwtAuthGuard)
export class WeathersiController {
  constructor(private readonly weathersiService: WeathersiService) {}

  // 지역 목록 조회
  @Get('areaList')
  async getAreaList() {
    return this.weathersiService.getAreaList();
  }

  // 장비 목록 조회
  @Get('devices')
  async getDevices(@Query('BDONG_CD') bdongCd?: string) {
    return this.weathersiService.getDevices(bdongCd);
  }

  // 오류 장비 목록
  @Get('errorDevices')
  async getErrorDevices(@Query('BDONG_CD') bdongCd?: string) {
    return this.weathersiService.getErrorDevices(bdongCd);
  }

  // 제어 가능한 장비 (예경보, 전광판, 차단기)
  @Get('control')
  async getControlDevices(@Query('BDONG_CD') bdongCd?: string) {
    return this.weathersiService.getControlDevices(bdongCd);
  }

  // 예경보 방송 전송
  @Post('sendBrd')
  async sendBroadcast(@Body() data: any, @GetCurrentUserId() userId: number) {
    return this.weathersiService.sendBroadcast(data, userId);
  }

  // 전광판 제어
  @Post('sendDisplay')
  async sendDisplay(@Body() data: any, @GetCurrentUserId() userId: number) {
    return this.weathersiService.sendDisplay(data, userId);
  }

  // 차단기 제어
  @Post('sendGate')
  async sendGate(@Body() data: any, @GetCurrentUserId() userId: number) {
    return this.weathersiService.sendGate(data, userId);
  }
}
