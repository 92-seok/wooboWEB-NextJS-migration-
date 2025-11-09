import { Entity, Column, PrimaryColumn, Index, IntegerType } from 'typeorm';

@Entity({
  name: 'sr_equip',
  comment: '',
}) // 테이블명 지정
@Index(['LOGGER_TIME']) // 인덱스 지정
export class SrEquip {
  @PrimaryColumn({
    name: 'observatoryCode',
    type: 'varchar',
    length: 13,
    comment: '소하천코드',
  })
  observatoryCode: string;

  @Column({
    name: 'BDONG_CD',
    type: 'varchar',
    length: 10,
    comment: '법정동코드 10자리',
  })
  BDONG_CD: string;

  @Column({
    name: 'observatoryName',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '소하천명',
  })
  observatoryName: string;

  @Column({
    name: 'SW_VERSION',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'S/W 버전',
  })
  SW_VERSION: string;

  @Column({
    name: 'FW_VERSION',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'F/W 버전',
  })
  FW_VERSION: string;

  @Column({
    name: 'LOGGER_UPTIME',
    type: 'datetime',
    nullable: true,
    comment: '로거 부팅시간',
  })
  LOGGER_UPTIME: Date;

  @Column({
    name: 'LOGGER_TIME',
    type: 'datetime',
    nullable: true,
    comment: '로거 현재시간',
  })
  LOGGER_TIME: Date;

  @Column({
    name: 'LOGGER_GL',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '로거 GL',
  })
  LOGGER_GL: string;

  @Column({
    name: 'LOGGER_EL',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '로거 EL',
  })
  LOGGER_EL: string;

  @Column({
    name: 'LOGGER_FL',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '로거 FL',
  })
  LOGGER_FL: string;

  @Column({
    name: 'serviceKey',
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '서비스키',
  })
  serviceKey: string;

  @Column({
    name: 'observationDateTime',
    type: 'varchar',
    length: 14,
    nullable: true,
    comment: '관측일시(yyyyMMddHHmmss)',
  })
  observationDateTime: string;

  @Column({
    name: 'waterLevel',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '수위',
  })
  waterLevel: number;

  @Column({
    name: 'averageVelocity',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '평균 유속',
  })
  averageVelocity: number;

  @Column({
    name: 'totalDischarge',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '총 유량',
  })
  totalDischarge: number;

  @Column({
    name: 'ResultCode',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '전송결과',
  })
  ResultCode: string;

  @Column({
    name: 'ResultMsg',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '전송결과 메시지',
  })
  ResultMsg: string;

  @Column({
    name: 'waterLevelStatusCode',
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: '수위 계측기 상태 코드',
  })
  waterLevelStatusCode: string;

  @Column({
    name: 'velocityStatusCode',
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: '유속 계측기 상태 코드',
  })
  velocityStatusCode: string;

  @Column({
    name: 'dischargeStatusCode',
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: '유량 연산장치 상태 코드',
  })
  dischargeStatusCode: string;

  @Column({
    name: 'upsStatusCode',
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'UPS 장치 상태 코드',
  })
  upsStatusCode: string;

  @Column({
    name: 'RTSP_URL',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: 'CCTV카메라 RTSP URL',
  })
  RTSP_URL: string;

  @Column({
    name: 'LAT',
    type: 'double',
    nullable: true,
    comment: '위도',
  })
  LAT: number;

  @Column({
    name: 'LON',
    type: 'double',
    nullable: true,
    comment: '경도',
  })
  LON: number;

  @Column({
    name: 'DTL_ADRES',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '주소',
  })
  DTL_ADRES: string;
}
