import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { AuthenticationService } from './service';
import { Request, Response } from 'express';
import { User } from './typings';
import { AuthenticationTask } from './task';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller()
export class AuthenticationController {
  public constructor(
    private readonly configService: ConfigService,
    private readonly authenticationTask: AuthenticationTask,
    private readonly authenticationService: AuthenticationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('/')
  public async index(
    @Query('code') code: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    if (code) {
      //
      const payload = await this.authenticationService
        .getClient()
        .callback(
          this.configService.getOrThrow(
            'application.authentication.openid.redirectUri',
          ),
          this.authenticationService.getClient().callbackParams(request),
        );
      //
      const userInfo = await this.authenticationService
        .getClient()
        .userinfo(payload.access_token);
      //
      const token: string | null = await this.cacheManager.get('token');
      if (!token) {
        await this.authenticationTask.getToken();
      }
      //
      await this.authenticationService.getZenTaoUser(
        response,
        <User.Info>userInfo,
        token,
      );
    } else {
      response.redirect(
        this.authenticationService.getClient().authorizationUrl({
          scope: this.configService.getOrThrow(
            'application.authentication.openid.scope',
          ),
          redirect_uri: this.configService.getOrThrow(
            'application.authentication.openid.redirectUri',
          ),
        }),
      );
    }
  }
}
