import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NmsUser } from '../auth/entities/nms_user.entity';
import { NmsUserAuthority } from '../auth/entities/nms_user_authority.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserListQueryDto } from './dto/user-list-query.dto';
import { UserRole } from '../common/enums/user-role.enum';


@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(NmsUser)
    private userRepository: Repository<NmsUser>,
    @InjectRepository(NmsUserAuthority)
    private userAuthRepo: Repository<NmsUserAuthority>
  ) { }

  // 전체 사용자 목록 조회하기 (페이징 + 필터링)
  async getAllUsers(query: UserListQueryDto) {
    const { page = 1, limit = 10, role, isActive, search } = query;
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: FindOptionsWhere<NmsUser> = {};
    if (role) where.role = role;

    // is_active 필터링하기 (tinyin: 1=활성, 0=비활성)
    if (isActive !== undefined) {
      where.is_active = isActive ? 1 : 0;
    }

    // 검색어가 있으면 이메일 또는 이름으로 검색
    const searchConditions: FindOptionsWhere<NmsUser> | FindOptionsWhere<NmsUser>[] = search ? [
      { ...where, email: Like(`%${search}%`) },
      { ...where, name: Like(`%${search}%`) },
    ]
      : where;

    // 사용자 목록 조회
    const [users, total] = await this.userRepository.findAndCount({
      where: searchConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'name', 'role', 'is_active', 'lastLoginAt', 'createdAt']
    });

    // 응답 형식을 is_active -> isActive로 변환
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active === 1,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }));

    return {
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 특정 사용자 조회하기
  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'is_active', 'lastLoginAt', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }


    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active === 1,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // 사용자 권한 변경하기
  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    // 엔티티의 role 필드 업데이트하기
    user.role = updateUserRoleDto.role;
    await this.userRepository.save(user);

    // 기존권한 모두 삭제하기
    await this.userAuthRepo.delete({ user: { id } });

    // 새 권한 추가하기
    const authorityName = updateUserRoleDto.role === UserRole.ADMIN ? 'ROLE_ADMIN' : 'ROLE_USER';
    const authority = this.userAuthRepo.create({ user, authorityName, });
    await this.userAuthRepo.save(authority);

    return {
      message: '사용자 권한이 변경되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 사용자 비밀번호 강제로 변경
  async updateUserPassword(id: number, updateUserPasswordDto: UpdateUserPasswordDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    // 새 비밀번호 해싱하기
    const hashedPassword = await bcrypt.hash(updateUserPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      message: '사용자 비밀번호가 변경되었습니다.',
      userId: user.id,
    };
  }

  async updateUserStatus(id: number, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    // boolean -> tinyint로 변환하기
    user.is_active = updateUserStatusDto.isActive ? 1 : 0;
    await this.userRepository.save(user);

    return {
      message: `사용자가 ${user.is_active === 1 ? '활성화' : '비활성화'} 되었습니다.`,
      user: {
        userId: user.id,
        email: user.email,
        isActive: user.is_active === 1,
      },
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    // 관리자가 마지막 1명일 경우 삭제 방지하기
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });

    if (user.role === UserRole.ADMIN && adminCount === 1) {
      throw new BadRequestException('마지막 관리자는 삭제할 수 없습니다.');
    };

    await this.userRepository.remove(user);

    return {
      message: '사용자가 삭제 되었습니다.',
      userId: user.id,
    };
  }


}