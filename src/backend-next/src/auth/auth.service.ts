import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import * as qs from 'querystring';

import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sing-up.dto';
import { SignInDto } from './dto/sing-in.dto';
import { Tokens } from './dto/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ********************* 회원가입 로직 *********************
  async signUp(dto: SignUpDto): Promise<Tokens> {
    const exists = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (exists) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const normalizedPw = dto.password.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hashedPw = await bcrypt.hash(normalizedPw, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPw,
        email: dto.username,
        name: dto.name,
        is_active: true,
        role: UserRole.OPERATOR,
        authorities: {
          create: {
            authority: 'ROLE_OPERATOR',
          },
        },
        token: {
          create: {},
        },
      },
    });

    const tokens = await this.getTokens(user.id, user.username, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // ********************* 로그인 로직 *********************
  async signIn(dto: SignInDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { authorities: true },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 맞지 않습니다.');
    }

    const normalizedPw = dto.password.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isMatch = await bcrypt.compare(normalizedPw, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    if (!user.is_active) {
      throw new ForbiddenException(
        '계정이 비활성화 되었습니다. 시스템사업부에 문의하세요.',
      );
    }

    // 권한 확인
    const hasAdminRole = user.authorities.some(
      (auth) => auth.authority === 'ROLE_ADMIN',
    );

    let role: UserRole = UserRole.OPERATOR;
    if (hasAdminRole) {
      role = UserRole.ADMIN;
    }

    // 역할 동기화
    if (user.role !== role) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const tokens = await this.getTokens(user.id, user.username, role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: role,
      },
    };
  }

  // ********************* 로그아웃 로직 *********************
  async logout(userId: number): Promise<void> {
    await this.prisma.userToken.update({
      where: { user_id: userId },
      data: { hashed_token: null },
    });
  }

  // ********************* Refresh 토큰 재발급 *********************
  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const tokenRow = await this.prisma.userToken.findUnique({
      where: { user_id: userId },
    });

    if (!tokenRow || !tokenRow.hashed_token) {
      throw new UnauthorizedException('Refresh token이 없습니다.');
    }

    const rtMatches = await bcrypt.compare(rt, tokenRow.hashed_token);
    if (!rtMatches) {
      throw new ForbiddenException('Refresh token이 유효하지 않습니다.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authorities: true },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const hasAdminRole = user.authorities.some(
      (auth) => auth.authority === 'ROLE_ADMIN',
    );

    const role = hasAdminRole ? UserRole.ADMIN : UserRole.OPERATOR;

    const tokens = await this.getTokens(user.id, user.username, role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async getTokens(
    userId: number,
    username: string,
    role: string,
  ): Promise<Tokens> {
    const payload = { sub: userId, username, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: number, rt: string): Promise<void> {
    const hashedRt = await bcrypt.hash(rt, 10);

    await this.prisma.userToken.upsert({
      where: { user_id: userId },
      update: { hashed_token: hashedRt },
      create: { user_id: userId, hashed_token: hashedRt },
    });
  }

  // ********************* 현재 사용자 정보 조회 *********************
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        email: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      isActive: user.is_active,
    };
  }

  // ********************* 카카오 로그인 *********************
  async kakaoLogin(code: string, domain: string): Promise<any> {
    const kakaoRestApiKey = this.configService.get<string>(
      'KAKAO_REST_API_KEY',
    );

    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    if (!kakaoRestApiKey) {
      console.error('KAKAO_REST_API_KEY가 설정 되지 않음');
      throw new UnauthorizedException(
        '카카오 로그인 설정이 올바르지 않습니다.',
      );
    }

    try {
      // 1. 카카오 AccessToken 요청
      const tokenBody = {
        grant_type: 'authorization_code',
        client_id: kakaoRestApiKey,
        redirect_uri: `${domain}/kakao-callback`,
        code,
      };

      const tokenHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      };

      const tokenResponse = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        headers: tokenHeaders,
        data: qs.stringify(tokenBody),
      });

      if (tokenResponse.status !== 200) {
        throw new UnauthorizedException('카카오 토큰 발급 실패');
      }

      const kakaoAccessToken = tokenResponse.data.access_token;

      // 2. 카카오 사용자 정보 조회
      const userInfoHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: `Bearer ${kakaoAccessToken}`,
      };

      const userInfoResponse = await axios({
        method: 'GET',
        url: kakaoUserInfoUrl,
        headers: userInfoHeaders,
      });

      if (userInfoResponse.status !== 200) {
        throw new UnauthorizedException('카카오 사용자 정보 조회 실패');
      }

      const kakaoUser = userInfoResponse.data;

      // 3. 카카오 ID로 사용자 조회
      const kakaoId = String(kakaoUser.id);
      let user = await this.prisma.user.findFirst({
        where: { kakao_id: kakaoId },
        include: { authorities: true },
      });

      // 4. 신규 사용자 회원가입
      if (!user) {
        const nickname =
          kakaoUser.kakao_account?.profile?.nickname || 'kakao_user';
        const email = kakaoUser.kakao_account?.email || `${kakaoId}@kakao.com`;

        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPw = await bcrypt.hash(randomPassword, 10);

        user = await this.prisma.user.create({
          data: {
            kakao_id: kakaoId,
            username: `kakao_${kakaoId}`,
            password: hashedPw,
            name: nickname,
            email: email,
            is_active: true,
            role: UserRole.OPERATOR,
            authorities: {
              create: {
                authority: 'ROLE_OPERATOR',
              },
            },
            token: {
              create: {},
            },
          },
          include: { authorities: true },
        });
      }

      // 5. 사용자 활성화 확인
      if (!user.is_active) {
        throw new ForbiddenException(
          '계정이 비활성화 되었습니다. 시스템사업부에 문의하세요.',
        );
      }

      // 6. 권한 확인
      const hasAdminRole = user.authorities.some(
        (auth) => auth.authority === 'ROLE_ADMIN',
      );

      const role = hasAdminRole ? UserRole.ADMIN : UserRole.OPERATOR;

      // 역할 동기화
      if (user.role !== role) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { role },
        });
      }

      // 7. 마지막 로그인 시간 업데이트
      await this.prisma.user.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });

      // 8. JWT 토큰 생성
      const tokens = await this.getTokens(user.id, user.username, role);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      // 9. 토큰 및 사용자 정보 반환
      return {
        ...tokens,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: role,
        },
      };
    } catch (error) {
      console.error('카카오 로그인 중 오류발생: ', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('카카오 로그인에 실패했습니다.');
    }
  }
}
