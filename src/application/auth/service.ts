import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: '84fee72896e2b952b62c',
      clientSecret: '134359898570b8cb4dcdee73b90ac30d8f78d795',
      callbackURL: 'http://127.0.0.1:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  // 在用户成功认证后被passport调用
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const user = {
      username: profile.username,
      nodeId: profile.nodeId,
    };

    done(null, user);
  }
}
