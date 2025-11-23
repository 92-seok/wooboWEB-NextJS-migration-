import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: number; // user id
  email: string;
};

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    console.log(
      '[DEBUG] JWT_ACCESS_SECRET =>',
      configService.get('JWT_ACCESS_SECRET')
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    // request.user에 들어갈 값 로직
    return { userId: payload.sub, email: payload.email };
  }
}
