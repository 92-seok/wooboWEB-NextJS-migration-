import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WeathersrService } from './weathersr.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('weathersr')
export class WeathersrController {
  constructor(private readonly weathersrService: WeathersrService) {}

  @Get('areaList')
  async getAreaList() {
    return this.weathersrService.getAreaList();
  }

  @Get('devices')
  async getDevices(@Query('BDONG_CD') bdondCd?: string) {
    return this.weathersrService.getDevices(bdondCd);
  }
}
