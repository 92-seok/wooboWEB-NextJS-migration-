import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import dayjs from 'dayjs';
import { TcmCouDngrAdm } from './weathersi/entities/tcm_cou_dngr_adm.entity';
import { NmsDevice } from './weathersi/entities/nms_device.entity';
import { NmsBrdSend } from './weathersi/entities/nms_brdsend.entity';
import { NmsGateControl } from './weathersi/entities/nms_gatecontrol.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NmsDevice)
    private nmsDeviceRepository: Repository<NmsDevice>,
    @InjectRepository(TcmCouDngrAdm)
    private tcmCouDngrAdmRepository: Repository<TcmCouDngrAdm>,
    @InjectRepository(NmsBrdSend)
    private NmsBrdSendRepository: Repository<NmsBrdSend>,
    @InjectRepository(NmsGateControl)
    private NmsGateControlRepository: Repository<NmsGateControl>,
  ) { }

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
        .where(
          `GB_OBSV In('01', '02', '03', '04', '06', '08', '15', '17', '18', '19', '20', '21')`,
        )
        .andWhere(where)
        .orderBy('GB_OBSV', 'ASC')
        .addOrderBy('BDONG_CD', 'ASC')
        .addOrderBy('CD_DIST_OBSV', 'ASC')
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

  async insertBrdSend(body): Promise<any> {
    try {
      const obj = new NmsBrdSend();

      obj.BDONG_CD = body.BDONG_CD;
      obj.CD_DIST_OBSV = body.CD_DIST_OBSV;
      obj.RCMD = body.RCMD;
      obj.Parm1 = body.Parm1;
      obj.Parm2 = body.Parm2;
      obj.Parm3 = body.Parm3;
      obj.BStatus = body.BStatus;
      obj.RegDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      obj.Auth = body.Auth;

      return await this.NmsBrdSendRepository.insert(obj);
    } catch (error) {
      throw new Error(`지역 조회 중 오류 발생: ${error.message}`);
    }
  }

  async insertGateControl(body): Promise<any> {
    try {
      const obj = new NmsGateControl();

      obj.BDONG_CD = body.BDONG_CD;
      obj.CD_DIST_OBSV = body.CD_DIST_OBSV;
      obj.Gate = body.Gate;
      obj.GStatus = body.GStatus;
      obj.RegDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      // 제어 이력 아이디 가져오기
      obj.Auth = body.Auth;

      return await this.NmsGateControlRepository.insert(obj);
    } catch (error) {
      throw new Error(`지역 조회 중 오류 발생: ${error.message}`);
    }
  }
}
