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
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache<RedisStore>,
  ) {}

  public onApplicationBootstrap() {
    this.getUserList().catch((error) => {
      this.logger.error(error);
    });
  }

  public async getToken() {
    await this.cacheManager.store.client.del('token');
    const tokenResponse = await this.httpService.axiosRef.post(
      `${this.configService.get('ZENTAO_URL')}/api.php/v1/tokens`,
      {
        account: this.configService.get('ZENTAO_TOKEN_ACCOUNT'),
        password: this.configService.get('ZENTAO_TOKEN_PASSWORD'),
      },
    );
    await this.cacheManager.set('token', tokenResponse.data.token, 2 ** 21);
  }

  public async getUserList() {
    await this.cacheManager.store.client.del('token');
    let token: string = await this.cacheManager.get('token');
    if (!token) {
      await this.getToken();
      token = await this.cacheManager.get('token');
    }
    try {
      const userList = (
        await this.httpService.axiosRef.get(
          `${this.configService.get('ZENTAO_URL')}/api.php/v1/users`,
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
      await this.cacheManager.store.client.sAdd('userList', userList);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
