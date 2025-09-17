import { Entity, Column, PrimaryColumn, JoinColumn } from 'typeorm';

@Entity({
  name: 'tcm_cou_dngr_adm',
  comment:
    '센싱정보 관리기관 정보\r\n\r\n1) ADMCODE : 법정동코드 (시군구5자리)\r\n6) USE_YN : 사용여부 사용(Y), 미사용 또는 삭제(N)',
})
export class TcmCouDngrAdm {
  @PrimaryColumn({
    name: 'ADMCODE',
    type: 'char',
    length: 5,
    comment: '관리기관코드(법정동코드 5자리)',
  })
  ADMCODE: string;

  @Column({
    name: 'CHPSNNM',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '담당자명',
  })
  CHPSNNM: string;

  @Column({
    name: 'CHARGE_DEPT',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '담당부서',
  })
  CHARGE_DEPT: string;

  @Column({
    name: 'CTTPC',
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '연락처',
  })
  CTTPC: number;

  @Column({
    name: 'RM',
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: '비고',
  })
  RM: string;

  @Column({
    name: 'USE_YN',
    type: 'char',
    length: 1,
    nullable: true,
    comment: '사용여부(Y, N)',
  })
  USE_YN: string;

  @Column({
    name: 'RGSDE',
    type: 'datetime',
    nullable: true,
    comment: '최초등록일시',
    default: () => 'current_timestamp',
  })
  REGSDE: string;

  @Column({
    name: 'UPDDE',
    type: 'datetime',
    nullable: true,
    comment: '최종수정일시',
    onUpdate: 'current_timestamp',
  })
  UPDDE: string;
}
