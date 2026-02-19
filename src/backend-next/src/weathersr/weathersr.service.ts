import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WeathersrService {
  constructor(private prisma: PrismaService) {}

  async getAreaList() {
    // sr_equip에서 실제 데이터가 있는 지역코드만 추출
    const srEquips = await this.prisma.srEquip.findMany({
      select: {
        bdong_cd: true,
      },
    });

    // BDONG_CD 앞 5자리로 시도 코드 추출
    const admCodes: string[] = [
      ...new Set(
        srEquips
          .map((sr) => sr.bdong_cd?.substring(0, 5))
          .filter((code): code is string => code !== undefined && code.length > 0),
      ),
    ];

    if (admCodes.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Region 테이블에서 해당 지역 정보 조회
    const regions = await this.prisma.region.findMany({
      where: {
        is_active: true,
        code: {
          in: admCodes,
        },
      },
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

  async getDevices(bdongCd?: string) {
    const where: any = {};

    if (bdongCd && bdongCd !== '%') {
      where.bdong_cd = {
        startsWith: bdongCd,
      };
    }

    const devices = await this.prisma.srEquip.findMany({
      where,
      orderBy: { logger_time: 'desc' },
    });

    const data = devices.map((device) => this.mapSrEquipToLegacyFormat(device));

    return {
      success: true,
      data,
    };
  }

  private mapSrEquipToLegacyFormat(device: any) {
    return {
      observatoryCode: device.observatory_code,
      BDONG_CD: device.bdong_cd,
      observatoryName: device.observatory_name,
      SW_VERSION: device.sw_version,
      FW_VERSION: device.fw_version,
      LOGGER_UPTIME: device.logger_uptime,
      LOGGER_TIME: device.logger_time,
      LOGGER_GL: device.logger_gl,
      LOGGER_EL: device.logger_el,
      LOGGER_FL: device.logger_fl,
      serviceKey: device.service_key,
      observationDateTime: device.observation_date_time,
      waterLevel: device.water_level,
      averageVelocity: device.average_velocity,
      totalDischarge: device.total_discharge,
      ResultCode: device.result_code,
      ResultMsg: device.result_msg,
      statusDateTime: device.status_date_time,
      statusResultCode: device.status_result_code,
      statusResultMsg: device.status_result_msg,
      waterLevelStatusCode: device.water_level_status_code,
      velocityStatusCode: device.velocity_status_code,
      dischargeStatusCode: device.discharge_status_code,
      upsStatusCode: device.ups_status_code,
      RTSP_URL: device.rtsp_url,
      LAT: device.lat,
      LON: device.lon,
      DTL_ADRES: device.dtl_adres,
    };
  }
}
