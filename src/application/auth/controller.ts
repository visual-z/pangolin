import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthenticationService } from './service';
import { Request, Response } from 'express';
import * as process from 'process';
import { HttpService } from '@nestjs/axios';
import { User } from './typings';

@Controller()
export class AuthenticationController {
  public constructor(
    private httpService: HttpService,
    private readonly authenticationService: AuthenticationService,
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
          process.env.ZENTAO_IDENTITY_OPENID_REDIRECT_URI,
          this.authenticationService.getClient().callbackParams(request),
        );
      //
      const userInfo = await this.authenticationService
        .getClient()
        .userinfo(payload.access_token);
      const tokenResponse = await this.httpService.axiosRef.post(
        `${process.env.ZENTAO_IDENTITY_URL}/api.php/v1/tokens`,
        {
          account: process.env.ZENTAO_IDENTITY_TOKEN_ACCOUNT,
          password: process.env.ZENTAO_IDENTITY_TOKEN_PASSWORD,
        },
      );
      await this.authenticationService.getZenTaoUser(
        response,
        <User.Info>userInfo,
        tokenResponse,
      );
    } else {
      response.redirect(
        this.authenticationService.getClient().authorizationUrl({
          scope: process.env.ZENTAO_IDENTITY_OPENID_SCOPE,
          redirect_uri: process.env.ZENTAO_IDENTITY_OPENID_REDIRECT_URI,
        }),
      );
    }
  }
}
