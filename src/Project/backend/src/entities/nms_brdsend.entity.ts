import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({
  name: 'nms_brdsend',
  comment: '',
})
@Index(['BStatus'])
export class NmsBrdSend {
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
    comment: '장비번호(wb_brdlistdetail.CD_DIST_OBSV)',
  })
  CD_DIST_OBSV: string;

  @Column({
    name: 'RCMD',
    type: 'varchar',
    length: 5,
    nullable: true,
    comment: '명령코드("B010", "B020", "S170",...)',
  })
  RCMD: string;

  @Column({
    name: 'Parm1',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '파라메타1(방송시: 00000000)',
  })
  Parm1: string;

  @Column({
    name: 'Parm2',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '파라메타2(방송시: wb_brdlist.Repeat)',
  })
  Parm2: string;

  @Column({
    name: 'Parm3',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '파라메타3(방송시: wb_brdlist.Content)',
  })
  Parm3: string;

  @Column({
    name: 'Parm4',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '파라메타4(방송시: wb_brdlist.BCode)',
  })
  Parm4: string;

  @Column({
    name: 'BStatus',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '방송상태',
  })
  BStatus: string;

  @Column({
    name: 'RegDate',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등록시간',
  })
  RegDate: string;

  @Column({
    name: 'RetData',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '응답값',
  })
  RetData: string;

  @Column({
    name: 'RetDate',
    type: 'datetime',
    nullable: true,
    comment: '등록시간',
  })
  RetDate: string;

  @Column({
    name: 'Auth',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '',
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
    comment: 'AUTO_CREATE',
    onUpdate: 'current_timestamp',
  })
  dtmUpdate: string;
}
