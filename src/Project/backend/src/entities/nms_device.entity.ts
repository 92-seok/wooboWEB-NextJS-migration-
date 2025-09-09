import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity('nms_device') // 테이블명 지정
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
    name: 'NM_DIST_OBSV',
    type: 'varchar',
    length: 30,
  })
  NM_DIST_OBSV: string;

  @Column({
    name: 'GB_OBSV',
    type: 'char',
    length: 2,
  })
  GB_OBSV: number;

  @Column({
    name: 'ConnModel',
    type: 'varchar',
    length: 20,
  })
  ConnModel: string;

  @Column({
    name: 'ConnPhone',
    type: 'varchar',
    length: 20,
  })
  ConnPhone: string;

  @Column({
    name: 'ConnIP',
    type: 'varchar',
    length: 20,
  })
  ConnIP: string;

  @Column({
    name: 'ConnPort',
    type: 'varchar',
    length: 5,
  })
  ConnPort: string;

  @Column({
    name: 'LastStatus',
    type: 'varchar',
    length: 10,
  })
  LastStatus: string;

  @Column({
    name: 'LastDate',
    type: 'varchar',
    length: 20,
  })
  LastDate: string;

  @Column({
    name: 'ErrorChk',
    type: 'int',
  })
  ErrorChk: number;
 
  @Column({
    name: 'USE_YN',
    type: 'char',
    length: 2,
  })
  USE_YN: string;
 
  @Column({
    name: 'LAT',
    type: 'double',
  })
  LAT: string;

  @Column({
    name: 'LON',
    type: 'double',
  })
  LON: number;

  @Column({
    name: 'DTL_ADRES',
    type: 'varchar',
    length: 100,
  })
  DTL_ADRES: string;

  @Column({
    name: 'DATA',
    type: 'varchar',
    length: 500,
  })
  DATA: string;

  @Column({
    name: 'UNIT',
    type: 'varchar',
    length: 10,
  })
  UNIT: string;

  @Column({
    name: 'RainBit',
    type: 'double',
  })
  RainBit: string;

  @Column({
    name: 'SubOBCount',
    type: 'int',
  })
  SubOBCount: number;

  @Column({
    name: 'DetCode',
    type: 'int',
  })
  DetCode: number;

  @Column({
    name: 'SeeLevelUse',
    type: 'varchar',
    length: 10,
  })
  SeeLevelUse: string;

  @Column({
    name: 'SizeX',
    type: 'int',
  })
  SizeX: number;

  @Column({
    name: 'SizeY',
    type: 'int',
  })
  SizeY: number;

  @Column({
    name: 'EComment',
    type: 'varchar',
    length: 400,
  })
  EComment: string;

  @Column({
    name: 'sub_obsv',
    type: 'int',
  })
  sub_obsv: number;

  @Column({
    name: 'LoggerTime',
    type: 'varchar',
    length: 50,
  })
  LoggerTime: string;
}
