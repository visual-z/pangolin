import { Injectable } from '@nestjs/common';
import { BaseClient, Client, Issuer } from 'openid-client';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { generateRandomPassword } from '../../utils/randomPassword';
import { Response } from 'express';
import { User } from './typings';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthenticationService {
  private client: Client;

  public constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    Issuer.discover(this.configService.get('OPENID_CONFIG_URL')).then(
      (issuer) => {
        this.client = new issuer.Client({
          client_id: this.configService.get('OPENID_CLIENT_ID'),
          client_secret: this.configService.get('OPENID_CLIENT_SECRET'),
          redirect_uris: [this.configService.get('OPENID_REDIRECT_URI')],
          response_types: ['code'],
        });
      },
    );
  }

  public async getZenTaoUser(
    response: Response,
    userInfo: User.Info,
    tokenResponse: { data: { token: string } },
  ) {
    if (tokenResponse.data.token) {
      try {
        const userResponse = await this.httpService.axiosRef.get(
          `${this.configService.get('ZENTAO_URL')}/api.php/v1/users`,
          {
            headers: {
              Token: tokenResponse.data.token,
            },
            params: {
              page: 1,
              limit: 1024,
            },
          },
        );
        // 查询用户
        let result = false;
        for (const user of userResponse.data.users) {
          if (user.account === userInfo.preferred_username) {
            result = true;
            break;
          }
        }
        if (result === false) {
          // 创建用户
          const password = generateRandomPassword(32);
          await this.httpService.axiosRef.post(
            `${this.configService.get('ZENTAO_URL')}/api.php/v1/users`,
            {
              account: userInfo.preferred_username,
              password,
              realname: userInfo.name,
            },
            {
              headers: {
                Token: tokenResponse.data.token,
              },
            },
          );
          // 输出用户名和密码到网页端
          const contentFile = handlebars.compile(
            fs.readFileSync('.resources/views/index.hbs', 'utf8'),
          );
          response.send(
            contentFile({
              username: userInfo.preferred_username,
              password,
              loginUrl: this.login(userInfo),
            }),
          );
        } else {
          response.redirect(this.login(<User.Info>userInfo));
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      response.status(500).json(tokenResponse);
    }
  }

  public getClient(): BaseClient {
    return this.client;
  }
  public login(userInfo: User.Info) {
    const timestamp = Date.now().toString();
    const token = createHash('md5')
      .update(
        `${this.configService.get('ZENTAO_CODE')}` +
          `${this.configService.get('ZENTAO_KEY')}` +
          timestamp,
      )
      .digest('hex');
    return `${this.configService.get('ZENTAO_URL')}/api.php?m=user&f=apilogin&account=${userInfo.preferred_username}&code=${this.configService.get('ZENTAO_CODE')}&time=${timestamp}&token=${token}`;
  }
}
