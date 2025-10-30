import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

// Libraries
import dayjs from 'dayjs';

// Entities
import { SrEquip } from './entities/sr_equip.entity';

@Injectable()
export class WeatherSrService {
  constructor(
    @InjectDataSource('weathersr')
    private dataSource: DataSource,
    @InjectRepository(SrEquip)
    private SrEquipRepository: Repository<SrEquip>,
  ) {}

  // 지역 조회
  async getAreaList(): Promise<SrEquip[]> {
    try {
      return await this.SrEquipRepository.findBy({});
    } catch (error) {
      throw new Error(`지역 조회 중 오류 발생: ${error.message}`);
    }
  }
}
