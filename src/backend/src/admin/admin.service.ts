import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { NmsUser } from '../auth/entities/nms_user.entity';
import { NmsUserAuthority } from '../auth/entities/nms_user_authority.entity';
import { NmsBrdSend } from '../weathersi/entities/nms_brdsend.entity';
import { NmsDisSend } from '../weathersi/entities/nms_dissend.entity';
import { NmsGateControl } from '../weathersi/entities/nms_gatecontrol.entity';
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
    private userAuthRepo: Repository<NmsUserAuthority>,
    @InjectRepository(NmsUser, 'weathersi')
    private weathersiUserRepository: Repository<NmsUser>,
    @InjectRepository(NmsBrdSend, 'weathersi')
    private brdSendRepository: Repository<NmsBrdSend>,
    @InjectRepository(NmsDisSend, 'weathersi')
    private disSendRepository: Repository<NmsDisSend>,
    @InjectRepository(NmsGateControl, 'weathersi')
    private gateControlRepository: Repository<NmsGateControl>,
  ) {}

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
    const searchConditions:
      | FindOptionsWhere<NmsUser>
      | FindOptionsWhere<NmsUser>[] = search
      ? [
          { ...where, username: Like(`%${search}%`) },
          { ...where, name: Like(`%${search}%`) },
        ]
      : where;

    // 사용자 목록 조회
    const [users, total] = await this.userRepository.findAndCount({
      where: searchConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      select: [
        'id',
        'username',
        'name',
        'role',
        'is_active',
        'lastLoginAt',
        'createdAt',
      ],
    });

    // 응답 형식을 is_active -> isActive로 변환
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
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
      select: [
        'id',
        'username',
        'name',
        'role',
        'is_active',
        'lastLoginAt',
        'createdAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    return {
      id: user.id,
      username: user.username,
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
    let authorityName: string;
    switch (updateUserRoleDto.role) {
      case UserRole.ADMIN:
        authorityName = 'ROLE_ADMIN';
        break;
      case UserRole.USER:
        authorityName = 'ROLE_USER';
        break;
      case UserRole.OPERATOR:
        authorityName = 'ROLE_OPERATOR';
        break;
      case UserRole.GUEST:
        authorityName = 'ROLE_GUEST';
        break;
      default:
        authorityName = 'ROLE_OPERATOR';
    }
    const authority = this.userAuthRepo.create({ user, authorityName });
    await this.userAuthRepo.save(authority);

    return {
      message: '사용자 권한이 변경되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  // 사용자 비밀번호 강제로 변경
  async updateUserPassword(
    id: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`ID ${id}인 사용자를 찾을 수 없습니다.`);
    }

    // 새 비밀번호 해싱하기
    const hashedPassword = await bcrypt.hash(
      updateUserPasswordDto.newPassword,
      10,
    );
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
      message: `아이디가 ${user.is_active === 1 ? '사용가능' : '사용불가'} 변경 되었습니다.`,
      user: {
        userId: user.id,
        username: user.username,
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
    }

    await this.userRepository.remove(user);

    return {
      message: '사용자가 삭제 되었습니다.',
      userId: user.id,
    };
  }

  // ------------------------------- 사용자 장비 제어 -------------------------------
  // 방송 제어 이력 조회하기
  async getBroadcastHistory(query: any) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    // 전체 개수 조회하기
    const totalQueryBuilder =
      this.brdSendRepository.createQueryBuilder('brdsend');

    if (BDONG_CD) {
      totalQueryBuilder.andWhere('brdsend.BDONG_CD = :BDONG_CD', { BDONG_CD });
    }
    if (CD_DIST_OBSV) {
      totalQueryBuilder.andWhere('brdsend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const total = await totalQueryBuilder.getCount();

    const queryBuilder = this.brdSendRepository
      .createQueryBuilder('brdsend')
      .leftJoin(
        'nms_device',
        'device',
        'brdsend.CD_DIST_OBSV = device.CD_DIST_OBSV AND brdsend.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'brdsend.IDX as IDX',
        'brdsend.BDONG_CD as BDONG_CD',
        'brdsend.CD_DIST_OBSV as CD_DIST_OBSV',
        'brdsend.RCMD as RCMD',
        'brdsend.Parm1 as Parm1',
        'brdsend.Parm2 as Parm2',
        'brdsend.Parm3 as Parm3',
        'brdsend.Parm4 as Parm4',
        'brdsend.BStatus as BStatus',
        'brdsend.RegDate as RegDate',
        'brdsend.RetData as RetData',
        'brdsend.RetDate as RetDate',
        'brdsend.Auth as Auth',
        'brdsend.dtmCreate as dtmCreate',
        'brdsend.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('brdsend.dtmCreate', 'DESC')
      .skip(skip)
      .limit(limit);

    if (BDONG_CD) {
      queryBuilder.andWhere('brdsend.BDONG_CD = :BDONG_CD', { BDONG_CD });
    }
    if (CD_DIST_OBSV) {
      queryBuilder.andWhere('brdsend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const history = await queryBuilder.getRawMany();

    // Auth 값들을 수집
    const authIds = [
      ...new Set(history.map((item) => item.Auth).filter(Boolean)),
    ];

    // 사용자 정보 조회
    const users = await this.userRepository.find({
      where: authIds.map((username) => ({ username })),
      select: ['username', 'name'],
    });

    // username을 key로 하는 Map 생성
    const userMap = new Map(users.map((user) => [user.username, user.name]));

    // history에 userName 매핑
    const historyWithUserNames = history.map((item) => ({
      ...item,
      userName: userMap.get(item.Auth) || null,
      type: 'broadcast',
    }));

    return {
      success: true,
      message: '방송 제어 이력을 조회했습니다.',
      data: historyWithUserNames,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 전광판 제어 이력 조회하기
  async getDisplayHistory(query: any) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    // 전체 개수 조회하기
    const totalQueryBuilder =
      this.disSendRepository.createQueryBuilder('dissend');

    if (BDONG_CD) {
      totalQueryBuilder.andWhere('dissend.BDONG_CD = :BDONG_CD', { BDONG_CD });
    }
    if (CD_DIST_OBSV) {
      totalQueryBuilder.andWhere('dissend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const total = await totalQueryBuilder.getCount();

    const queryBuilder = this.disSendRepository
      .createQueryBuilder('dissend')
      .leftJoin(
        'nms_device',
        'device',
        'dissend.CD_DIST_OBSV = device.CD_DIST_OBSV AND dissend.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'dissend.IDX as IDX',
        'dissend.BDONG_CD as BDONG_CD',
        'dissend.CD_DIST_OBSV as CD_DIST_OBSV',
        'dissend.RCMD as RCMD',
        'dissend.Parm1 as Parm1',
        'dissend.Parm2 as Parm2',
        'dissend.Parm3 as Parm3',
        'dissend.BStatus as BStatus',
        'dissend.RegDate as RegDate',
        'dissend.Auth as Auth',
        'dissend.dtmCreate as dtmCreate',
        'dissend.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('dissend.dtmCreate', 'DESC')
      .skip(skip)
      .limit(limit);

    if (BDONG_CD) {
      queryBuilder.andWhere('dissend.BDONG_CD = :BDONG_CD', { BDONG_CD });
    }
    if (CD_DIST_OBSV) {
      queryBuilder.andWhere('dissend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const history = await queryBuilder.getRawMany();

    // Auth 값들을 수집
    const authIds = [
      ...new Set(history.map((item) => item.Auth).filter(Boolean)),
    ];

    // 사용자 정보 조회
    const users =
      authIds.length > 0
        ? await this.userRepository.find({
            where: { username: In(authIds) },
            select: ['username', 'name'],
          })
        : [];

    // const users = await this.userRepository.find({
    //   where: authIds.map(username => ({ username })),
    //   select: ['username', 'name'],
    // });

    // username을 key로 하는 Map 생성
    const userMap = new Map(users.map((user) => [user.username, user.name]));

    // history에 userName 매핑
    const historyWithUserNames = history.map((item) => ({
      ...item,
      userName: userMap.get(item.Auth) || null,
      type: 'display',
    }));

    return {
      success: true,
      message: '전광판 제어 이력을 조회했습니다.',
      data: historyWithUserNames,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 차단기 제어 이력 조회하기
  async getGateHistory(query: any) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    // 전체 개수 조회하기
    const totalQueryBuilder =
      this.gateControlRepository.createQueryBuilder('gatecontrol');

    if (BDONG_CD) {
      totalQueryBuilder.andWhere('gatecontrol.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
    }
    if (CD_DIST_OBSV) {
      totalQueryBuilder.andWhere('gatecontrol.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const total = await totalQueryBuilder.getCount();

    const queryBuilder = this.gateControlRepository
      .createQueryBuilder('gatecontrol')
      .leftJoin(
        'nms_device',
        'device',
        'gatecontrol.CD_DIST_OBSV = device.CD_DIST_OBSV AND gatecontrol.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'gatecontrol.IDX as IDX',
        'gatecontrol.BDONG_CD as BDONG_CD',
        'gatecontrol.CD_DIST_OBSV' as 'CD_DIST_OBSV',
        'gatecontrol.Gate as Gate',
        'gatecontrol.Light as Light',
        'gatecontrol.Sound as Sound',
        'gatecontrol.GStatus as GStatus',
        'gatecontrol.RegDate as RegDate',
        'gatecontrol.Auth as Auth',
        'gatecontrol.dtmCreate as dtmCreate',
        'gatecontrol.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('gatecontrol.dtmCreate', 'DESC')
      .skip(skip)
      .limit(limit);

    if (BDONG_CD) {
      queryBuilder.andWhere('gatecontrol.BDONG_CD = :BDONG_CD', { BDONG_CD });
    }
    if (CD_DIST_OBSV) {
      queryBuilder.andWhere('gatecontrol.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const history = await queryBuilder.getRawMany();

    // Auth 값들을 수집
    const authIds = [
      ...new Set(history.map((item) => item.Auth).filter(Boolean)),
    ];

    // 사용자 정보 조회
    const users = await this.userRepository.find({
      where: authIds.map((username) => ({ username })),
      select: ['username', 'name'],
    });

    // username을 key로 하는 Map 생성
    const userMap = new Map(users.map((user) => [user.username, user.name]));

    // history에 userName 매핑
    const historyWithUserNames = history.map((item) => ({
      ...item,
      userName: userMap.get(item.Auth) || null,
      type: 'gate',
    }));

    return {
      success: true,
      message: '차단기 제어 이력을 조회했습니다.',
      data: historyWithUserNames,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 모든 장비 제어 이력 통합 조회
  async getAllControlHistory(query: any) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    // ========== 1. Total 개수 계산 (3개 테이블 합산하기) ==========
    const broadcastTotalBuilder =
      this.brdSendRepository.createQueryBuilder('brdsend');
    const displayTotalBuilder =
      this.disSendRepository.createQueryBuilder('dissend');
    const gateTotalBuilder =
      this.gateControlRepository.createQueryBuilder('gatecontrol');

    if (BDONG_CD) {
      broadcastTotalBuilder.andWhere('brdsend.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
      displayTotalBuilder.andWhere('dissend.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
      gateTotalBuilder.andWhere('gatecontrol.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
    }
    if (CD_DIST_OBSV) {
      broadcastTotalBuilder.andWhere('brdsend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
      displayTotalBuilder.andWhere('dissend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
      gateTotalBuilder.andWhere('gatecontrol.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    const [broadcastTotal, displayTotal, gateTotal] = await Promise.all([
      broadcastTotalBuilder.getCount(),
      displayTotalBuilder.getCount(),
      gateTotalBuilder.getCount(),
    ]);

    const total = broadcastTotal + displayTotal + gateTotal;

    // ========== 데이터 조회(충분한 양)하기 ==========
    // 각 테이블에서 (skip + limit)만큼 가져와야 페이징이 정확
    const fetchLimit = skip + limit;
    // 방송 제어 이력
    const broadcastQueryBuilder = this.brdSendRepository
      .createQueryBuilder('brdsend')
      .leftJoin(
        'nms_device',
        'device',
        'brdsend.CD_DIST_OBSV = device.CD_DIST_OBSV AND brdsend.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'brdsend.IDX as IDX',
        'brdsend.BDONG_CD as BDONG_CD',
        'brdsend.CD_DIST_OBSV as CD_DIST_OBSV',
        'brdsend.RCMD as RCMD',
        'brdsend.Parm1 as Parm1',
        'brdsend.Parm2 as Parm2',
        'brdsend.Parm3 as Parm3',
        'brdsend.Parm4 as Parm4',
        'brdsend.BStatus as BStatus',
        'brdsend.RegDate as RegDate',
        'brdsend.RetData as RetData',
        'brdsend.RetDate as RetDate',
        'brdsend.Auth as Auth',
        'brdsend.dtmCreate as dtmCreate',
        'brdsend.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('brdsend.dtmCreate', 'DESC')
      .limit(fetchLimit);

    if (BDONG_CD) {
      broadcastQueryBuilder.andWhere('brdsend.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
    }
    if (CD_DIST_OBSV) {
      broadcastQueryBuilder.andWhere('brdsend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    // 전광판 제어 이력
    const displayQueryBuilder = this.disSendRepository
      .createQueryBuilder('dissend')
      .leftJoin(
        'nms_device',
        'device',
        'dissend.CD_DIST_OBSV = device.CD_DIST_OBSV AND dissend.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'dissend.IDX as IDX',
        'dissend.BDONG_CD as BDONG_CD',
        'dissend.CD_DIST_OBSV as CD_DIST_OBSV',
        'dissend.RCMD as RCMD',
        'dissend.Parm1 as Parm1',
        'dissend.Parm2 as Parm2',
        'dissend.Parm3 as Parm3',
        'dissend.BStatus as BStatus',
        'dissend.RegDate as RegDate',
        'dissend.Auth as Auth',
        'dissend.dtmCreate as dtmCreate',
        'dissend.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('dissend.dtmCreate', 'DESC')
      .limit(fetchLimit);

    if (BDONG_CD) {
      displayQueryBuilder.andWhere('dissend.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
    }
    if (CD_DIST_OBSV) {
      displayQueryBuilder.andWhere('dissend.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }

    // 차단기 제어 이력
    const gateQueryBuilder = this.gateControlRepository
      .createQueryBuilder('gatecontrol')
      .leftJoin(
        'nms_device',
        'device',
        'gatecontrol.CD_DIST_OBSV = device.CD_DIST_OBSV AND gatecontrol.BDONG_CD = device.BDONG_CD',
      )
      .select([
        'gatecontrol.IDX as IDX',
        'gatecontrol.BDONG_CD as BDONG_CD',
        'gatecontrol.CD_DIST_OBSV' as 'CD_DIST_OBSV',
        'gatecontrol.Gate as Gate',
        'gatecontrol.Light as Light',
        'gatecontrol.Sound as Sound',
        'gatecontrol.GStatus as GStatus',
        'gatecontrol.RegDate as RegDate',
        'gatecontrol.Auth as Auth',
        'gatecontrol.dtmCreate as dtmCreate',
        'gatecontrol.dtmUpdate as dtmUpdate',
        'device.NM_DIST_OBSV as NM_DIST_OBSV',
      ])
      .orderBy('gatecontrol.dtmCreate', 'DESC')
      .limit(fetchLimit);

    if (BDONG_CD) {
      gateQueryBuilder.andWhere('gatecontrol.BDONG_CD = :BDONG_CD', {
        BDONG_CD,
      });
    }
    if (CD_DIST_OBSV) {
      gateQueryBuilder.andWhere('gatecontrol.CD_DIST_OBSV = :CD_DIST_OBSV', {
        CD_DIST_OBSV,
      });
    }
    // const where: any = {};
    // if (BDONG_CD) where.BDONG_CD = BDONG_CD;
    // if (CD_DIST_OBSV) where.CD_DIST_OBSV = CD_DIST_OBSV;

    // 3개 테이블에서 모두 조회하기
    const [broadcastHistory, displayHistory, gateHistory] = await Promise.all([
      broadcastQueryBuilder.getRawMany(),
      displayQueryBuilder.getRawMany(),
      gateQueryBuilder.getRawMany(),
    ]);

    // Auth 값들을 수집
    const allAuthIds = [
      ...broadcastHistory.map((item) => item.Auth),
      ...displayHistory.map((item) => item.Auth),
      ...gateHistory.map((item) => item.Auth),
    ].filter(Boolean);
    const authIds = [...new Set(allAuthIds)];

    // 5. 사용자 정보 조회
    const users = await this.userRepository.find({
      where: authIds.map((username) => ({ username })),
      select: ['username', 'name'],
    });

    // username을 key로 하는 Map 생성
    const userMap = new Map(users.map((user) => [user.username, user.name]));

    // 타입 구분 및 userName 매핑
    const broadcast = broadcastHistory.map((item) => ({
      ...item,
      uniqueId: `broadcast-${item.IDX}`,
      userName: userMap.get(item.Auth) || null,
      type: 'broadcast',
    }));
    const display = displayHistory.map((item) => ({
      ...item,
      uniqueId: `display-${item.IDX}`,
      userName: userMap.get(item.Auth) || null,
      type: 'display',
    }));
    const gate = gateHistory.map((item) => ({
      ...item,
      uniqueId: `gate-${item.IDX}`,
      userName: userMap.get(item.Auth) || null,
      type: 'gate',
    }));

    // 모든 이력을 합치고 시간순으로 정렬
    const allHistory = [...broadcast, ...display, ...gate]
      .sort((a, b) => {
        const dateA = new Date(a.dtmCreate).getTime();
        const dateB = new Date(b.dtmCreate).getTime();
        return dateB - dateA; //최신순으로
      })
      .slice(skip, skip + limit);

    return {
      success: true,
      message: '모든 제어 이력을 조회했습니다.',
      data: allHistory,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        broadcast: broadcast.length,
        display: display.length,
        gate: gate.length,
      },
    };
  }
}
