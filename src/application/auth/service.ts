import { Injectable } from '@nestjs/common';
import { BaseClient, Client, Issuer } from 'openid-client';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { generateRandomPassword } from '../../utils/randomPassword';
import { Response } from 'express';
import { User } from './typings';
import * as process from 'process';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

@Injectable()
export class AuthenticationService {
  private client: Client;

  public constructor(private httpService: HttpService) {
    const issuerUrl = process.env.ZENTAO_IDENTITY_OPENID_CONFIG_URL;
    const clientId = process.env.ZENTAO_IDENTITY_OPENID_CLIENT_ID;
    const clientSecret = process.env.ZENTAO_IDENTITY_OPENID_CLIENT_SECRET;

    Issuer.discover(issuerUrl).then((issuer) => {
      this.client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [process.env.ZENTAO_IDENTITY_OPENID_REDIRECT_URI],
        response_types: ['code'],
      });
    });
  }

  public async getZenTaoUser(
    response: Response,
    userInfo: User.Info,
    tokenResponse: { data: { token: string } },
  ) {
    /* TODO 拆分逻辑到service
     * 1. 生成账户密码后将用户的账号密码输出到网页展示
     * 2. 账号使用oidc的用户名
     * 3. 使用hbr模板
     */
    if (tokenResponse.data.token) {
      const userResponse = await this.httpService.axiosRef.get(
        `${process.env.ZENTAO_IDENTITY_URL}/api.php/v1/users`,
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
          `${process.env.ZENTAO_IDENTITY_URL}/api.php/v1/users`,
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
        `${process.env.ZENTAO_IDENTITY_CODE}` +
          `${process.env.ZENTAO_IDENTITY_KEY}` +
          timestamp,
      )
      .digest('hex');
    return `${process.env.ZENTAO_IDENTITY_URL}/api.php?m=user&f=apilogin&account=${userInfo.preferred_username}&code=${process.env.ZENTAO_IDENTITY_CODE}&time=${timestamp}&token=${token}`;
  }
}
