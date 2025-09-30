import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'nms_gatecontrol',
  comment: '',
})
export class NmsGateControl {
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
    comment: 'wb_equip.CD_DIST_OBSV',
  })
  CD_DIST_OBSV: string;

  @Column({
    name: 'Gate',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '제어요청(OPEN, CLOSE)',
  })
  Gate: string;

  @Column({
    name: 'Light',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '',
  })
  Light: string;

  @Column({
    name: 'Sound',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '',
  })
  Parm2: string;

  @Column({
    name: 'GStatus',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '제어상태',
  })
  GStatus: string;

  @Column({
    name: 'RegDate',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '등록시간',
  })
  RegDate: string;

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
    default: () => 'current_timestamp'
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
