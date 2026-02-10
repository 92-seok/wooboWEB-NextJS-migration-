import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

// Libraries
import dayjs from 'dayjs';

// Entities
import { TcmCouDngrAdm } from './entities/tcm_cou_dngr_adm.entity';
import { SrEquip } from './entities/sr_equip.entity';

@Injectable()
export class WeatherSrService {
  constructor(
    @InjectRepository(TcmCouDngrAdm, 'weathersr')
    private tcmCouDngrAdmRepository: Repository<TcmCouDngrAdm>,
    @InjectRepository(SrEquip, 'weathersr')
    private SrEquipRepository: Repository<SrEquip>,
    //@InjectDataSource('weathersr')
    //private dataSource: DataSource,
    //@InjectModel(SrEquip)
  ) {}

  // 지역 조회: weathersr(sr_equip) 테이블에 실제 데이터가 있는 지역만 반환
  async getAreaList(): Promise<TcmCouDngrAdm[]> {
    try {
      const admCodesWithDevices = (
        await this.SrEquipRepository.createQueryBuilder('sr')
          .select('DISTINCT SUBSTRING(sr.BDONG_CD, 1, 5)', 'admcode')
          .getRawMany()
      )
        .map((r) => (r.admcode?.trim?.() || r.admcode || '').trim())
        .filter((code) => code.length > 0);

      if (admCodesWithDevices.length === 0) {
        return [];
      }

      return await this.tcmCouDngrAdmRepository
        .createQueryBuilder('t')
        .where('t.USE_YN = :useYn', { useYn: 'Y' })
        .andWhere('t.ADMCODE IN (:...admCodes)', { admCodes: admCodesWithDevices })
        .orderBy('t.RM', 'ASC')
        .getMany();
    } catch (error) {
      throw new Error(`지역 조회 중 오류 발생: ${error.message}`);
    }
  }

  // 모든 NMS 디바이스 조회
  async getDevices(): Promise<SrEquip[]> {
    try {
      return await this.SrEquipRepository.findBy({});
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }

  // 장비 모니터링 상태 조회
  async getMonitorDevices(where: string): Promise<SrEquip[]> {
    try {
      return await this.SrEquipRepository.createQueryBuilder()
        .where(where)
        .orderBy('BDONG_CD', 'ASC')
        .getMany();
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }
}
