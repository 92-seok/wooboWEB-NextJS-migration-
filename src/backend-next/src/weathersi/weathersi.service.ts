import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceType } from '@prisma/client';

@Injectable()
export class WeathersiService {
  constructor(private prisma: PrismaService) {}

  // 지역 목록 조회
  async getAreaList() {
    const regions = await this.prisma.region.findMany({
      where: { is_active: true },
      select: {
        code: true,
        name: true,
        admin_name: true,
      },
      orderBy: { name: 'asc' },
    });

    const data = regions.map((region) => ({
      ADMCODE: region.code,
      RM: region.name,
      title: region.name,
      value: region.code,
    }));

    return {
      success: true,
      data,
    };
  }

  // 장비 목록 조회
  async getDevices(bdongCd?: string) {
    const where: any = { is_active: true };

    if (bdongCd && bdongCd !== '%') {
      where.region_code = bdongCd;
    }

    const devices = await this.prisma.device.findMany({
      where,
      include: {
        region: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const data = devices.map((device) => this.mapDeviceToLegacyFormat(device));

    return {
      success: true,
      data,
    };
  }

  // 오류 장비 목록
  async getErrorDevices(bdongCd?: string) {
    const where: any = {
      is_active: true,
      error_count: 0,
    };

    if (bdongCd && bdongCd !== '%') {
      where.region_code = bdongCd;
    }

    const devices = await this.prisma.device.findMany({
      where,
      include: {
        region: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const data = devices.map((device) => this.mapDeviceToLegacyFormat(device));

    return {
      success: true,
      data,
    };
  }

  // 제어 가능한 장비
  async getControlDevices(bdongCd?: string) {
    const where: any = {
      is_active: true,
      device_type: {
        in: [DeviceType.WARNING_SYSTEM, DeviceType.DISPLAY_BOARD, DeviceType.GATE_CONTROL],
      },
    };

    if (bdongCd && bdongCd !== '%') {
      where.region_code = bdongCd;
    }

    const devices = await this.prisma.device.findMany({
      where,
      include: {
        region: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const data = devices.map((device) => this.mapDeviceToLegacyFormat(device));

    return {
      success: true,
      data,
    };
  }

  // 예경보 방송 전송
  async sendBroadcast(data: any, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const device = await this.prisma.device.findFirst({
      where: {
        region_code: data.BDONG_CD,
        device_code: data.CD_DIST_OBSV,
      },
    });

    if (!device) {
      return {
        success: false,
        message: '장비를 찾을 수 없습니다.',
      };
    }

    await this.prisma.broadcastLog.create({
      data: {
        device_id: device.id,
        command: data.RCMD || 'B010',
        param1: data.Parm1,
        param2: data.Parm2,
        param3: data.Parm3,
        param4: data.Parm4,
        status: data.BStatus === 'start' ? 'START' : 'END',
        user: user?.username || 'unknown',
        registered_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: '방송이 전송되었습니다.',
    };
  }

  // 전광판 제어
  async sendDisplay(data: any, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const device = await this.prisma.device.findFirst({
      where: {
        region_code: data.BDONG_CD,
        device_code: data.CD_DIST_OBSV,
      },
    });

    if (!device) {
      return {
        success: false,
        message: '장비를 찾을 수 없습니다.',
      };
    }

    await this.prisma.displayLog.create({
      data: {
        device_id: device.id,
        command: data.RCMD || 'S170',
        param1: data.Parm1,
        param2: data.Parm2,
        param3: data.Parm3,
        status: data.BStatus === 'start' ? 'START' : 'END',
        user: user?.username || 'unknown',
        registered_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: '전광판 제어가 완료되었습니다.',
    };
  }

  // 차단기 제어
  async sendGate(data: any, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const device = await this.prisma.device.findFirst({
      where: {
        region_code: data.BDONG_CD,
        device_code: data.CD_DIST_OBSV,
      },
    });

    if (!device) {
      return {
        success: false,
        message: '장비를 찾을 수 없습니다.',
      };
    }

    await this.prisma.gateLog.create({
      data: {
        device_id: device.id,
        gate_action: data.Gate,
        status: data.GStatus === 'start' ? 'START' : 'END',
        user: user?.username || 'unknown',
        registered_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      message: '차단기 제어가 완료되었습니다.',
    };
  }

  // Device를 기존 API 형식으로 변환
  private mapDeviceToLegacyFormat(device: any) {
    const deviceTypeToCode = {
      RAIN_GAUGE: '01',
      WATER_LEVEL: '02',
      DISPLACEMENT: '03',
      SNOW_GAUGE: '06',
      WARNING_SYSTEM: '17',
      DISPLAY_BOARD: '18',
      GATE_CONTROL: '20',
      OTHER: '99',
    };

    return {
      IDX: device.id,
      BDONG_CD: device.region_code,
      CD_DIST_OBSV: device.device_code,
      NM_DIST_OBSV: device.device_name,
      GB_OBSV: deviceTypeToCode[device.device_type] || '99',
      DTL_ADRES: device.address,
      LAT: device.latitude,
      LON: device.longitude,
      DATA: device.data,
      UNIT: device.unit,
      ErrorChk: device.error_count,
      LOGGER_TIME: device.last_updated_at,
      RM: device.region?.name,
    };
  }
}
