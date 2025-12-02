import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import * as qs from 'querystring';

import { NmsUser } from './entities/nms_user.entity';
import { NmsUserToken } from './entities/nms_user_token.entity';
import { NmsUserAuthority } from './entities/nms_user_authority.entity';

import { SignUpDto } from './dto/sing-up.dto';
import { SignInDto } from './dto/sing-in.dto';
import { Tokens } from './dto/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NmsUser)
    private readonly userRepo: Repository<NmsUser>,

    @InjectRepository(NmsUserToken)
    private readonly userTokenRepo: Repository<NmsUserToken>,

    @InjectRepository(NmsUserAuthority)
    private readonly userAuthRepo: Repository<NmsUserAuthority>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 생성자 환경변수 확인 (디버깅)
    // console.log('=== AuthService 초기화 ===');
    // console.log('KAKAKO_REST_API_KEY: ', this.configService.get('KAKAO_REST_API_KEY'));
    // console.log('KAKAKO_REDIRECT_URI: ', this.configService.get('KAKAO_REDIRECT_URI'));
    // console.log('process.env.KAKAO_REST_API_KEY: ', process.env.KAKAO_REST_API_KEY);
    // console.log('process.env.KAKAO_REDIRECT_URI: ', process.env.KAKAO_REDIRECT_URI);
  }

  // ********************* 회원가입 로직 *********************
  async signUp(dto: SignUpDto): Promise<Tokens> {
    const exists = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (exists) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const normalizedPw = dto.password.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hashedPw = await bcrypt.hash(normalizedPw, 10);

    const user = this.userRepo.create({
      username: dto.username,
      password: hashedPw,
      name: dto.name,
      is_active: 1,
      role: UserRole.OPERATOR,
    });

    const savedUser = await this.userRepo.save(user);

    // 기본 권한 USER 부여하기
    const authority = this.userAuthRepo.create({
      user: savedUser,
      authorityName: 'ROLE_OPERATOR',
    });
    await this.userAuthRepo.save(authority);

    // role 추가하여 토큰 생성
    const tokens = await this.getTokens(
      savedUser.id,
      savedUser.username,
      savedUser.role,
    );
    await this.saveRefreshToken(savedUser.id, tokens.refreshToken);

    return tokens;
  }

  // ********************* 로그인 로직 *********************
  async signIn(dto: SignInDto): Promise<any> {
    // 모든 사용자 조회
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 맞지 않습니다.');
    }

    // 입력된 비밀번호를 소문자와 숫자만 추출
    const normalizedPw = dto.password.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isMatch = await bcrypt.compare(normalizedPw, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 맞지 않습니다.');
    }

    if (user.is_active !== 1) {
      throw new ForbiddenException('계정이 비활성화 되었습니다. 시스템사업부에 문의하세요.');
    }

    // 사용자 권한 조회하기
    const authorities = await this.userAuthRepo.find({
      where: { user: { id: user.id } },
    });

    // 역할 결정하기 = ROLE_ADMIN 이 있으면 'admin' 아니면 'user'
    const hasAdminRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_ADMIN',
    );
    const hasUserRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_USER',
    );
    const hasOperatorRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_OPERATOR',
    );

    let role: UserRole;
    if (hasAdminRole) {
      role = UserRole.ADMIN;
    } else if (hasUserRole) {
      role = UserRole.USER;
    } else if (hasOperatorRole) {
      role = UserRole.OPERATOR;
    } else {
      role = UserRole.GUEST;
    };

    // const role = hasAdminRole ? UserRole.ADMIN : UserRole.USER;

    // 엔티티의 롤 필드도 동기화 시키기
    if (user.role !== role) {
      user.role = role;
      await this.userRepo.save(user);
    }

    // 마지막 로그 시간 체크하기
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    // 토큰 생성
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

  // ********************* 로그아웃 로직: DB에 저장된 refresh token 제거하기 *********************
  async logout(userId: number): Promise<void> {
    await this.userTokenRepo.update(
      { userId },
      { hashedRt: null }, // hash 토큰 삭제하기
    );
  }

  // ********************* Refresh 토큰 ---> 토큰 재발급하기 *********************
  async refreshTokens(userId: number, rt: string): Promise<Tokens> {
    const tokenRow = await this.userTokenRepo.findOne({ where: { userId } });

    if (!tokenRow || !tokenRow.hashedRt) {
      throw new UnauthorizedException('Refresh token이 없습니다.');
    }

    const rtMatches = await bcrypt.compare(rt, tokenRow.hashedRt);
    if (!rtMatches) {
      throw new ForbiddenException('Refresh token이 유효하지 않습니다.');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    // 사용자 권한 조회해서 역할 결정하기
    const authorities = await this.userAuthRepo.find({
      where: { user: { id: user.id } },
    });


    const hasAdminRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_ADMIN',
    );
    const hasUserRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_USER',
    );
    const hasOperatorRole = authorities.some(
      (auth) => auth.authorityName === 'ROLE_OPERATOR',
    );

    let role: UserRole;
    if (hasAdminRole) {
      role = UserRole.ADMIN;
    } else if (hasUserRole) {
      role = UserRole.USER;
    } else if (hasOperatorRole) {
      role = UserRole.OPERATOR;
    } else {
      role = UserRole.GUEST;
    };

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
        expiresIn: '30m',
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

    const existing = await this.userTokenRepo.findOne({ where: { userId } });

    if (existing) {
      existing.hashedRt = hashedRt;
      await this.userTokenRepo.save(existing);
    } else {
      const row = this.userTokenRepo.create({
        userId,
        hashedRt,
      });
      await this.userTokenRepo.save(row);
    }
  }

  // ********************* 현재 로그인된 사용자 정보 조회 로직 *********************
  async getCurrentUser(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'username', 'name', 'role', 'email', 'is_active'],
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
      isActive: user.is_active === 1,
    }
  }

  // --------------------------카카오로그인 로직--------------------------------
  async kakaoLogin(code: string, domain: string): Promise<any> {
    const kakaoRestApiKey = this.configService.get<string>('KAKAO_REST_API_KEY');
    const kakaoRedirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    console.log('=== 카카오 로그인 시작 ===');
    console.log('카카오 REST API 키: ', kakaoRestApiKey ? `설정됨 (${kakaoRestApiKey.substring(0, 10)}...)` : '미설정');
    console.log('카카오 redirect URI: ', kakaoRedirectUri || '미설정');
    console.log('받은 code: ', code ? `${code.substring(0, 20)}...` : '없음');

    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    // 환경변수 검증하기
    if (!kakaoRestApiKey) {
      console.error('KAKAO_REST_API_KEY가 설정 되지 않음');
      throw new UnauthorizedException('카카오 로그인 설정이 올바르지 않습니다.');
    }
    if (!kakaoRedirectUri) {
      console.error('KAKAO_REDIRECT_URI가 설정 되지 않음');
      throw new UnauthorizedException('카카오 로그인 설정이 올바르지 않습니다.');
    }

    try {
      // 1. 카카오 AccessToken 요청하기
      const tokenBody = {
        grant_type: 'authorization_code',
        client_id: kakaoRestApiKey,
        redirect_uri: kakaoRedirectUri,
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
        console.error('카카오 토큰 요청 실패: ', tokenResponse.status);
        throw new UnauthorizedException('카카오 토큰 발급 실패');
      }

      console.log('카카오 토큰 발급 성공: ', tokenResponse.data);
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
        console.error('카카오 사용자 정보 조회 실패: ', tokenResponse.status);
        throw new UnauthorizedException('카카오 사용자 정보 조회 실패');
      }

      console.log('카카오 사용자 정보 조회 성공');
      console.log('카카오 사용자 정보: ', userInfoResponse.data);
      const kakaoUser = userInfoResponse.data;

      // 3. 카카오 ID로 DB에서 사용자 조회
      const kakaoId = String(kakaoUser.id);
      let user = await this.userRepo.findOne({
        where: { kakao_id: kakaoId },
      });

      // 4. 신규 사용자면 회원가입 처리
      if (!user) {
        console.log('신규 카카오 사용자 - 회원가입 진행');
        const nickname = kakaoUser.kakao_account?.profile?.nickname || 'kakao_user';
        const email = kakaoUser.kakao_account?.email || `${kakaoId}@kakao.com`;

        // 카카오 사용자는 비밀번호가 없으므로 랜덤 비밀번호 생성
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPw = await bcrypt.hash(randomPassword, 10);

        // 사용자 생성하기
        user = this.userRepo.create({
          kakao_id: kakaoId,
          username: `kakao_${kakaoId}`,
          password: hashedPw,
          name: nickname,
          email: email,
          is_active: 1,
          role: UserRole.OPERATOR,
        });

        const savedUser = await this.userRepo.save(user);

        // 기본 권한 부여하기
        const authority = this.userAuthRepo.create({
          user: savedUser,
          authorityName: 'ROLE_OPERATOR',
        });
        await this.userAuthRepo.save(authority);

        user = savedUser;
        console.log('신규 사용자 등록 완료: ', user.username);
      } else {
        console.log('기존 사용자 로그인 : ', user.username);
      }

      // 5. 사용자 활성화 확인
      if (user.is_active !== 1) {
        console.error('비활성화된 계정: ', user.username);
        throw new ForbiddenException('계정이 비활성화 되었습니다. 시스템사업부에 문의하세요.');
      }

      // 6. 사용자 권한 조회
      const authorities = await this.userAuthRepo.find({
        where: { user: { id: user.id } },
      });

      const hasAdminRole = authorities.some(
        (auth) => auth.authorityName === 'ROLE_ADMIN',
      );
      const hasUserRole = authorities.some(
        (auth) => auth.authorityName === 'ROLE_USER',
      );
      const hasOperatorRole = authorities.some(
        (auth) => auth.authorityName === 'ROLE_OPERATOR',
      );

      let role: UserRole;
      if (hasAdminRole) {
        role = UserRole.ADMIN;
      } else if (hasUserRole) {
        role = UserRole.USER;
      } else if (hasOperatorRole) {
        role = UserRole.OPERATOR;
      } else {
        role = UserRole.GUEST;
      }

      // 엔티티 role 필드 동기화
      if (user.role !== role) {
        user.role = role;
        await this.userRepo.save(user);
      }

      // 7. 마지막 로그인 시간 업데이트
      user.lastLoginAt = new Date();
      await this.userRepo.save(user);

      // 8. 자체 JWT 토큰 생성
      const tokens = await this.getTokens(user.id, user.username, role);
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      console.log('JWT 자체 토큰 발급 성공');
      console.log('=== 카카오 로그인 완료 ===');

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
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('카카오 로그인에 실패했습니다.');
    }
  }
}