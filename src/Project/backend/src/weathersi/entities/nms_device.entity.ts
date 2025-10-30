import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity({
  database: 'weathersi',
  schema: 'weathersi',
  name: 'nms_device',
  comment: '',
}) // 테이블명 지정
@Index(['GB_OBSV']) // 인덱스 지정
export class NmsDevice {
  @PrimaryColumn({
    name: 'BDONG_CD',
    type: 'varchar',
    length: 10,
    comment: '법정동코드 10자리',
  })
  BDONG_CD: string;

  @PrimaryColumn({
    name: 'CD_DIST_OBSV',
    type: 'varchar',
    length: 10,
    comment: '장비번호',
  })
  CD_DIST_OBSV: string;

  @Column({
    name: 'JHACode',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '지역번호',
  })
  JHACode: string;

  @Column({
    name: 'NM_DIST_OBSV',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: '장비명칭',
  })
  NM_DIST_OBSV: string;

  @Column({
    name: 'GB_OBSV',
    type: 'char',
    length: 2,
    nullable: true,
    comment: '장비구분코드',
  })
  GB_OBSV: number;

  @Column({
    name: 'ConnModel',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '프로토콜',
  })
  ConnModel: string;

  @Column({
    name: 'ConnPhone',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '전화번호',
  })
  ConnPhone: string;

  @Column({
    name: 'ConnIP',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'IP번호(000.000.000.000)',
  })
  ConnIP: string;

  @Column({
    name: 'ConnPort',
    type: 'varchar',
    length: 5,
    nullable: true,
    comment: 'PORT번호(00000)',
  })
  ConnPort: string;

  @Column({
    name: 'LastStatus',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '마지막상태(start, ing, end, fail, error)',
  })
  LastStatus: string;

  @Column({
    name: 'LastDate',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '마지막시간(성공시)',
  })
  LastDate: string;

  @Column({
    name: 'ErrorChk',
    type: 'int',
    nullable: true,
    comment: '오류횟수(0:오류)',
  })
  ErrorChk: number;

  @Column({
    name: 'USE_YN',
    type: 'char',
    length: 2,
    nullable: true,
    comment: "사용유무('1','0')",
  })
  USE_YN: string;

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

  @Column({
    name: 'DATA',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '데이터',
  })
  DATA: string;

  @Column({
    name: 'UNIT',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '단위',
  })
  UNIT: string;

  @Column({
    name: 'RainBit',
    type: 'double',
    nullable: true,
  })
  RainBit: string;

  @Column({
    name: 'SubOBCount',
    type: 'int',
    nullable: true,
  })
  SubOBCount: number;

  @Column({
    name: 'DetCode',
    type: 'int',
    nullable: true,
  })
  DetCode: number;

  @Column({
    name: 'SeeLevelUse',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  SeeLevelUse: string;

  @Column({
    name: 'SizeX',
    type: 'int',
    nullable: true,
  })
  SizeX: number;

  @Column({
    name: 'SizeY',
    type: 'int',
    nullable: true,
  })
  SizeY: number;

  @Column({
    name: 'EComment',
    type: 'varchar',
    length: 400,
    nullable: true,
  })
  EComment: string;

  @Column({
    name: 'sub_obsv',
    type: 'int',
    nullable: true,
  })
  sub_obsv: number;

  @Column({
    name: 'LoggerTime',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  LoggerTime: string;
}
