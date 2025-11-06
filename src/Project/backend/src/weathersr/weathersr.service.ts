import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

// Libraries
import dayjs from 'dayjs';

// Entities
import { SrEquip } from './entities/sr_equip.entity';
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';

@Injectable()
export class WeatherSrService {
  constructor(
    @InjectRepository(SrEquip, 'weathersr')
    private SrEquipRepository: Repository<SrEquip>,
    @InjectRepository(TcmCouDngrAdm, 'weathersr')
    private tcmCouDngrAdmRepository: Repository<TcmCouDngrAdm>,
    //@InjectDataSource('weathersr')
    //private dataSource: DataSource,
    //@InjectModel(SrEquip)
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

  // 장비 모니터링 상태 조회
  async getMonitorDevices(where: string): Promise<SrEquip[]> {
    try {
      return await this.SrEquipRepository.createQueryBuilder()
        .andWhere(where)
        .orderBy('observatoryCode', 'ASC')
        .getMany();
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }
}
