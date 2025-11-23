import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { NmsUser } from './nms_user.entity';

@Entity('nms_user_token')
export class NmsUserToken {
  // user_id 를 PK로 사용하기
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @OneToOne(() => NmsUser, (user) => user.token, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: NmsUser;

  @Column({ name: 'hashed_rt', type: 'varchar', length: 255, nullable: true })
  hashedRt: string | null;

  @CreateDateColumn({ name: 'last_login_at' })
  lastLoginAt: Date;
}
