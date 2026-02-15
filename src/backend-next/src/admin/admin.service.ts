import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ========== 사용자 관리 ==========

  async getAllUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) {
    const { page = 1, limit = 10, role, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          is_active: true,
          last_login_at: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async updateUserRole(id: number, role: string) {
    // console.log('=== updateUserRole Debug ===');
    // console.log('User ID:', id);
    // console.log('New Role:', role);
    // console.log('Role Type:', typeof role);
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      message: '권한이 변경되었습니다.',
      user,
    };
  }

  async updateUserPassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: '비밀번호가 변경되었습니다.',
      userId: id,
    };
  }

  async updateUserStatus(id: number, isActive: boolean) {
    console.log('=== updateUserStatus Debug ===');
    console.log('User ID:', id);
    console.log('New Status:', isActive);
    console.log('Status Type:', typeof isActive);

    const user = await this.prisma.user.update({
      where: { id },
      data: { is_active: isActive },
    });

    return {
      message: '사용자 상태가 변경되었습니다.',
      user,
    };
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { id } });

    return {
      message: '사용자가 삭제되었습니다.',
      userId: id,
    };
  }

  // ========== 제어 이력 관리 ==========

  async getAllControlHistory(query: {
    BDONG_CD?: string;
    CD_DIST_OBSV?: string;
    limit?: number;
    page?: number;
  }) {
    const [broadcasts, displays, gates] = await Promise.all([
      this.getBroadcastHistory(query),
      this.getDisplayHistory(query),
      this.getGateHistory(query),
    ]);

    const allHistory = [
      ...(broadcasts.data || []),
      ...(displays.data || []),
      ...(gates.data || []),
    ].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    const { limit = 50, page = 1 } = query;
    const skip = (page - 1) * limit;

    return {
      success: true,
      data: allHistory.slice(skip, skip + limit),
    };
  }

  async getBroadcastHistory(query: {
    BDONG_CD?: string;
    CD_DIST_OBSV?: string;
    limit?: number;
    page?: number;
  }) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 50, page = 1 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (BDONG_CD || CD_DIST_OBSV) {
      where.device = {};
      if (BDONG_CD) where.device.region_code = BDONG_CD;
      if (CD_DIST_OBSV) where.device.device_code = CD_DIST_OBSV;
    }

    const logs = await this.prisma.broadcastLog.findMany({
      where,
      include: {
        device: {
          select: {
            region_code: true,
            device_code: true,
            device_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const data = logs.map((log) => ({
      id: log.id,
      type: 'broadcast',
      BDONG_CD: log.device.region_code,
      CD_DIST_OBSV: log.device.device_code,
      NM_DIST_OBSV: log.device.device_name,
      command: log.command,
      param1: log.param1,
      param2: log.param2,
      param3: log.param3,
      status: log.status,
      user: log.user,
      registered_at: log.registered_at,
      created_at: log.created_at,
    }));

    return {
      success: true,
      data,
    };
  }

  async getDisplayHistory(query: {
    BDONG_CD?: string;
    CD_DIST_OBSV?: string;
    limit?: number;
    page?: number;
  }) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 50, page = 1 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (BDONG_CD || CD_DIST_OBSV) {
      where.device = {};
      if (BDONG_CD) where.device.region_code = BDONG_CD;
      if (CD_DIST_OBSV) where.device.device_code = CD_DIST_OBSV;
    }

    const logs = await this.prisma.displayLog.findMany({
      where,
      include: {
        device: {
          select: {
            region_code: true,
            device_code: true,
            device_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const data = logs.map((log) => ({
      id: log.id,
      type: 'display',
      BDONG_CD: log.device.region_code,
      CD_DIST_OBSV: log.device.device_code,
      NM_DIST_OBSV: log.device.device_name,
      command: log.command,
      param1: log.param1,
      param2: log.param2,
      param3: log.param3,
      status: log.status,
      user: log.user,
      registered_at: log.registered_at,
      created_at: log.created_at,
    }));

    return {
      success: true,
      data,
    };
  }

  async getGateHistory(query: {
    BDONG_CD?: string;
    CD_DIST_OBSV?: string;
    limit?: number;
    page?: number;
  }) {
    const { BDONG_CD, CD_DIST_OBSV, limit = 50, page = 1 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (BDONG_CD || CD_DIST_OBSV) {
      where.device = {};
      if (BDONG_CD) where.device.region_code = BDONG_CD;
      if (CD_DIST_OBSV) where.device.device_code = CD_DIST_OBSV;
    }

    const logs = await this.prisma.gateLog.findMany({
      where,
      include: {
        device: {
          select: {
            region_code: true,
            device_code: true,
            device_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    });

    const data = logs.map((log) => ({
      id: log.id,
      type: 'gate',
      BDONG_CD: log.device.region_code,
      CD_DIST_OBSV: log.device.device_code,
      NM_DIST_OBSV: log.device.device_name,
      gate_action: log.gate_action,
      light_action: log.light_action,
      sound_action: log.sound_action,
      status: log.status,
      user: log.user,
      registered_at: log.registered_at,
      created_at: log.created_at,
    }));

    return {
      success: true,
      data,
    };
  }
}
