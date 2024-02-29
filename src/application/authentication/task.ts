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
      this.logger.error(error);
    });
  }

  public async getToken() {
    const tokenResponse = await this.httpService.axiosRef.post(
      `${this.configService.getOrThrow('application.authentication.zentao.httpUrl')}/api.php/v1/tokens`,
      {
        account: this.configService.getOrThrow(
          'application.authentication.zentao.account',
        ),
        password: this.configService.getOrThrow(
          'application.authentication.zentao.password',
        ),
      },
    );
    await this.cacheManager.store.client.set(
      'AuthenticationTask:token',
      tokenResponse.data.token,
      { PX: 2 ** 21 },
    );
  }

  public async getUserList() {
    let token: string = await this.cacheManager.store.client.get(
      'AuthenticationTask:token',
    );
    if (!token) {
      await this.getToken();
      token = await this.cacheManager.store.client.get(
        'AuthenticationTask:token',
      );
    }
    try {
      const userList = (
        await this.httpService.axiosRef.get(
          `${this.configService.getOrThrow('application.authentication.zentao.httpUrl')}/api.php/v1/users`,
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
      await this.cacheManager.store.client.sAdd(
        'AuthenticationTask:userList',
        userList,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }
}
