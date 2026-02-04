import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NmsUser } from './nms_user.entity';

@Entity('nms_user_authority')
export class NmsUserAuthority {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => NmsUser, (user) => user.authorities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: NmsUser;

  @Column({ name: 'authority_name', length: 255 })
  authorityName: string;
}
