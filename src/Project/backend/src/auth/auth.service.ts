import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
  ) { }

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
}

// --------------------------카카오로그인(추후 개발 예정)--------------------------------
// async kakaoLogin(options: { code: string; domain: string }): Promise<any> {
//   const { code, domain } = options;
//   const kakaoKey = '87073966cb41...';
//   const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
//   const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
//   const body = {
//     grant_type: 'authorization_code',
//     client_id: kakaoKey,
//     redirect_uri: `${domain}/kakao-callback`,
//     code,
//   };
//   const headers = {
//     'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
//   };
//   try {
//     const response = await axios({
//       method: 'POST',
//       url: kakaoTokenUrl,
//       timeout: 30000,
//       headers,
//       data: qs.stringify(body),
//     });
//     if (response.status === 200) {
//       console.log(`kakaoToken : ${JSON.stringify(response.data)}`);
//       // Token 을 가져왔을 경우 사용자 정보 조회
//       const headerUserInfo = {
//         'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
//         Authorization: 'Bearer ' + response.data.access_token,
//       };
//       console.log(`url : ${kakaoTokenUrl}`);
//       console.log(`headers : ${JSON.stringify(headerUserInfo)}`);
//       const responseUserInfo = await axios({
//         method: 'GET',
//         url: kakaoUserInfoUrl,
//         timeout: 30000,
//         headers: headerUserInfo,
//       });
//       console.log(`responseUserInfo.status : ${responseUserInfo.status}`);
//       if (responseUserInfo.status === 200) {
//         console.log(
//           `kakaoUserInfo : ${JSON.stringify(responseUserInfo.data)}`,
//         );
//         return responseUserInfo.data;
//       } else {
//         throw new UnauthorizedException();
//       }
//     } else {
//       throw new UnauthorizedException();
//     }
//   } catch (error) {
//     console.log(error);
//     throw new UnauthorizedException();
//   }
// }
