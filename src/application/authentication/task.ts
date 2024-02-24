import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-yet';

@Injectable()
export class AuthenticationTask implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(AuthenticationTask.name);

  public constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache<RedisStore>,
  ) {}

  public onApplicationBootstrap() {
    this.getUserList().catch((error) => {
      this.logger.error(JSON.stringify(error));
    });
  }

  public async getToken() {
    await this.cacheManager.store.client.del('zentao:token');
    const tokenResponse = await this.httpService.axiosRef.post(
      `${this.configService.getOrThrow('application.authentication.zentao.url')}/api.php/v1/tokens`,
      {
        account: this.configService.getOrThrow(
          'application.authentication.zentao.account',
        ),
        password: this.configService.getOrThrow(
          'application.authentication.zentao.password',
        ),
      },
    );

    await this.cacheManager.set(
      'zentao:token',
      tokenResponse.data.token,
      2 ** 21,
    );
  }

  public async getUserList() {
    await this.cacheManager.store.client.del('zentao:token');
    let token: string = await this.cacheManager.get('zentao:token');
    if (!token) {
      await this.getToken();
      token = await this.cacheManager.get('zentao:token');
    }
    try {
      const userList = (
        await this.httpService.axiosRef.get(
          `${this.configService.getOrThrow('application.authentication.zentao.url')}/api.php/v1/users`,
          {
            headers: {
              Token: token,
            },
            params: {
              page: 1,
              limit: 1024,
            },
          },
        )
      ).data.users.map((user: { account: string }) => user.account);
      await this.cacheManager.store.client.sAdd('zentao:userList', userList);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
