import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NmsUserAuthority } from './nms_user_authority.entity';
import { NmsUserToken } from './nms_user_token.entity';
import { UserRole } from '../../common/enums/user-role.enum';


@Entity('nms_user')
export class NmsUser {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'tinyint', default: 1 })
  is_active: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kakao_id?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NmsUserAuthority, (ua) => ua.user)
  authorities: NmsUserAuthority;

  @OneToOne(() => NmsUserToken, (token) => token.user)
  token: NmsUserToken;
}
