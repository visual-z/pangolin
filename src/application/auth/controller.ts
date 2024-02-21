import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthenticationService } from './service';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { User } from './typings';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AuthenticationController {
  public constructor(
    private httpService: HttpService,
    private readonly configService: ConfigService,
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
      try {
        const payload = await this.authenticationService
          .getClient()
          .callback(
            this.configService.get('OPENID_REDIRECT_URI'),
            this.authenticationService.getClient().callbackParams(request),
          );
        //
        const userInfo = await this.authenticationService
          .getClient()
          .userinfo(payload.access_token);
        //
        const tokenResponse = await this.httpService.axiosRef.post(
          `${this.configService.get('ZENTAO_URL')}/api.php/v1/tokens`,
          {
            account: this.configService.get('ZENTAO_TOKEN_ACCOUNT'),
            password: this.configService.get('ZENTAO_TOKEN_PASSWORD'),
          },
        );
        //
        await this.authenticationService.getZenTaoUser(
          response,
          <User.Info>userInfo,
          tokenResponse,
        );
      } catch (error) {
        console.log(error);
        response.status(500);
      }
    } else {
      response.redirect(
        this.authenticationService.getClient().authorizationUrl({
          scope: this.configService.get('OPENID_SCOPE'),
          redirect_uri: this.configService.get('OPENID_REDIRECT_URI'),
        }),
      );
    }
  }
}
