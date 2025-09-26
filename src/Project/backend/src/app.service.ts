import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NmsDevice } from './entities/nms_device.entity';
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NmsDevice)
    private nmsDeviceRepository: Repository<NmsDevice>,
    @InjectRepository(TcmCouDngrAdm)
    private tcmCouDngrAdmRepository: Repository<TcmCouDngrAdm>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // 지역 조회
  async getAreaList(): Promise<TcmCouDngrAdm[]> {
    try {
      return await this.tcmCouDngrAdmRepository.findBy({ USE_YN: 'Y' });
    } catch (error) {
      throw new Error(`지역 조회 중 오류 발생: ${error.message}`);
    }
  }

  // 모든 NMS 디바이스 조회
  async getDevices(): Promise<NmsDevice[]> {
    try {
      return await this.nmsDeviceRepository.findBy({});
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }
  // 장비 모니터링 상태 조회
  async getMonitorDevices(where: string): Promise<NmsDevice[]> {
    try {
      // console.log(
      //   this.nmsDeviceRepository
      //     .createQueryBuilder()
      //     .where(`GB_OBSV In('01', '02', '03', '04', '06', '08', '20', '21')`)
      //     .andWhere(where)
      //     .orderBy('CD_DIST_OBSV', 'ASC')
      //     .getSql(),
      // );

      return await this.nmsDeviceRepository
        .createQueryBuilder()
        .where(`GB_OBSV In('01', '02', '03', '04', '06', '08', '20', '21')`)
        .andWhere(where)
        .orderBy('CD_DIST_OBSV', 'ASC')
        .getMany();

      /*
      return await this.nmsDeviceRepository.findBy({
        GB_OBSV: In(['01', '02', '03', '04', '06', '08', '21']),
      });
      */
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }

  // 장비 컨트롤 상태 조회
  async getControlDevices(where: string): Promise<NmsDevice[]> {
    try {
      // console.log(
      //   this.nmsDeviceRepository
      //     .createQueryBuilder()
      //     .where(`GB_OBSV In('17', '18', '20')`)
      //     .andWhere(where)
      //     .orderBy('CD_DIST_OBSV', 'ASC')
      //     .getSql(),
      // );

      return await this.nmsDeviceRepository
        .createQueryBuilder()
        .where(`GB_OBSV In('17', '18', '20')`)
        .andWhere(where)
        .orderBy('CD_DIST_OBSV', 'ASC')
        .getMany();
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }

  async
}
