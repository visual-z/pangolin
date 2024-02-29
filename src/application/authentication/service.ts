import { Inject, Injectable, Logger } from '@nestjs/common';
import { BaseClient, Client, Issuer } from 'openid-client';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { generateRandomPassword } from '../../utils/randomPassword';
import { Response } from 'express';
import { User } from './typings';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AuthenticationTask } from './task';
import { RedisStore } from 'cache-manager-redis-yet';

@Injectable()
export class AuthenticationService {
  private client: Client;
  private readonly logger: Logger = new Logger(AuthenticationService.name);

  public constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private authenticationTask: AuthenticationTask,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache<RedisStore>,
  ) {
    Issuer.discover(
      this.configService.getOrThrow(
        'application.authentication.openid.configUrl',
      ),
    ).then((issuer) => {
      this.client = new issuer.Client({
        client_id: this.configService.getOrThrow(
          'application.authentication.openid.clientID',
        ),
        client_secret: this.configService.getOrThrow(
          'application.authentication.openid.clientSecret',
        ),
        redirect_uris: [
          this.configService.getOrThrow(
            'application.authentication.openid.redirectUri',
          ),
        ],
      });
    });
  }

  public async getZenTaoUser(
    response: Response,
    userInfo: User.Info,
    token: string,
  ) {
    try {
      // 缓存
      const result = await this.cacheManager.store.client.SISMEMBER(
        'zentao:userList',
        userInfo.name,
      );
      if (result === false) {
        // 创建用户
        const password = generateRandomPassword(32);
        await this.httpService.axiosRef.post(
          `${this.configService.getOrThrow('application.authentication.zentao.httpUrl')}/api.php/v1/users`,
          {
            account: userInfo.preferred_username,
            password,
            realname: userInfo.name,
          },
          {
            headers: {
              Token: token,
            },
          },
        );
        await this.authenticationTask.getUserList();
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
      this.logger.error(error);
      response.status(500);
    }
  }

  public getClient(): BaseClient {
    return this.client;
  }

  public login(userInfo: User.Info) {
    const timestamp = Date.now().toString();
    const token = createHash('md5')
      .update(
        `${this.configService.getOrThrow('application.authentication.zentao.code')}` +
          `${this.configService.getOrThrow('application.authentication.zentao.key')}` +
          timestamp,
      )
      .digest('hex');
    return `${this.configService.getOrThrow('application.authentication.zentao.httpsUrl')}/api.php?m=user&f=apilogin&account=${userInfo.preferred_username}&code=${this.configService.getOrThrow('application.authentication.zentao.code')}&time=${timestamp}&token=${token}`;
  }
}
