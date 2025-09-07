import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import qs from 'qs';

@Injectable()
export class AuthService {
  async kakaoLogin(param: { code: any; domain: any }) {
    const { code, domain } = param;
    const kakaoKey = 'a21fca6df45467b72c4cff24ec14cb6b';
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

    const body = {
      grant_type: 'authorization_code',
      client_id: kakaoKey,
      redirect_uri: `${domain}/kakao-callback`,
      code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    };
    try {
      const response = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });

      console.log(response);
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        Authorization: 'Bearer ' + response.data.access_token,
      };
      console.log(response);

      const responseUserInfo = await axios({
        method: 'GET',
        url: kakaoUserInfoUrl,
        timeout: 30000,
        headers: headerUserInfo,
      });
      console.log(responseUserInfo);

      if (responseUserInfo.status === 200) {
        return responseUserInfo.data;
      } else {
        throw new BadRequestException('카카오 로그인 실패');
      }
    } catch (error) {
      console.log('카카오 로그인 에러:', error);
      throw new BadRequestException('카카오 로그인 처리 중 오류가 발생했습니다.');
    }
  }
}
