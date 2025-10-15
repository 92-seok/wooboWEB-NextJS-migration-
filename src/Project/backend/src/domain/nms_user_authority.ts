import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NmsUser } from './nms_user.entity';

@Entity('nms_user_authority')
export class NmsUserAuthority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name : 'user_id'})
  userId: number;

  @Column('varchar', { name: 'authority_name'})
  authorityName: string;

  @ManyToOne(() => NmsUser, (user) => user.authorities)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: NmsUser;
}