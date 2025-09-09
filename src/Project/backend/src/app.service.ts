import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { NmsDevice } from './entities/nms_device.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NmsDevice)
    private nmsDeviceRepository: Repository<NmsDevice>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // 모든 NMS 디바이스 조회
  async getAllDevices(): Promise<NmsDevice[]> {
    try {
      return await this.nmsDeviceRepository.find({
        order: { CD_DIST_OBSV: 'ASC' },
      });
    } catch (error) {
      throw new Error(`디바이스 조회 중 오류 발생: ${error.message}`);
    }
  }
}
