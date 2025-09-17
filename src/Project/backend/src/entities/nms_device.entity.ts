import { Entity, Column, PrimaryColumn, JoinColumn } from 'typeorm';

@Entity({ name: 'nms_device' }) // 테이블명 지정
export class NmsDevice {
  @PrimaryColumn({
    name: 'BDong_CD',
    type: 'varchar',
    length: 10,
  })
  BDong_CD: string;

  @PrimaryColumn({
    name: 'CD_DIST_OBSV',
    type: 'varchar',
    length: 10,
  })
  CD_DIST_OBSV: string;

  @Column({
    name: 'JHACode',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  JHACode: string;

  @Column({
    name: 'NM_DIST_OBSV',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  NM_DIST_OBSV: string;

  @Column({
    name: 'GB_OBSV',
    type: 'char',
    length: 2,
    nullable: true,
  })
  GB_OBSV: number;

  @Column({
    name: 'ConnModel',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ConnModel: string;

  @Column({
    name: 'ConnPhone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ConnPhone: string;

  @Column({
    name: 'ConnIP',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ConnIP: string;

  @Column({
    name: 'ConnPort',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  ConnPort: string;

  @Column({
    name: 'LastStatus',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  LastStatus: string;

  @Column({
    name: 'LastDate',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  LastDate: string;

  @Column({
    name: 'ErrorChk',
    type: 'int',
    nullable: true,
  })
  ErrorChk: number;

  @Column({
    name: 'USE_YN',
    type: 'char',
    length: 2,
    nullable: true,
  })
  USE_YN: string;

  @Column({
    name: 'LAT',
    type: 'double',
    nullable: true,
  })
  LAT: string;

  @Column({
    name: 'LON',
    type: 'double',
    nullable: true,
  })
  LON: number;

  @Column({
    name: 'DTL_ADRES',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  DTL_ADRES: string;

  @Column({
    name: 'DATA',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  DATA: string;

  @Column({
    name: 'UNIT',
    type: 'varchar',
    length: 10,
    nullable: true,
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
