import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({
  //database: 'weathersi',
  //schema: 'weathersi',
  name: 'nms_dissend',
  comment: '원격제어_전광판',
})
@Index(['BStatus'])
export class NmsDisSend {
  @PrimaryGeneratedColumn({
    name: 'IDX',
    type: 'int',
    comment: 'AUTO_PK',
  })
  IDX: number;

  @Column({
    name: 'BDONG_CD',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '법정동코드(10자리)',
  })
  BDONG_CD: string;

  @Column({
    name: 'CD_DIST_OBSV',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '장비번호(wb_equip.CD_DIST_OBSV)',
  })
  CD_DIST_OBSV: string;

  @Column({
    name: 'RCMD',
    type: 'varchar',
    length: 5,
    nullable: true,
    comment: '명령코드("S170", "D060", "D090",...)',
  })
  RCMD: string;

  @Column({
    name: 'Parm1',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '파라메타1()',
  })
  Parm1: string;

  @Column({
    name: 'Parm2',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '파라메타2()',
  })
  Parm2: string;

  @Column({
    name: 'Parm3',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '파라메타3()',
  })
  Parm3: string;

  @Column({
    name: 'RegDate',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등록시간',
  })
  RegDate: string;

  @Column({
    name: 'BStatus',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '제어상태',
  })
  BStatus: string;

  @Column({
    name: 'Auth',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '제어한 아이디(username)',
  })
  Auth: string;

  @Column({
    name: 'dtmCreate',
    type: 'datetime',
    nullable: true,
    comment: 'AUTO_CREATE',
    default: () => 'current_timestamp',
  })
  dtmCreate: string;

  @Column({
    name: 'dtmUpdate',
    type: 'datetime',
    nullable: true,
    comment: 'AUTO_UPDATE',
    onUpdate: 'current_timestamp',
  })
  dtmUpdate: string;
}
