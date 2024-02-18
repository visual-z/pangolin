import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';
import { createHash } from 'crypto';
import { generateRandomPassword } from '../../utils/randomPassword';

@Controller('auth')
export class AuthController {
  constructor(private httpService: HttpService) {}
  @Get('github')
  @UseGuards(AuthGuard('github'))
  public githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  public async githubLoginCallback(
    @Req() request: any,
    @Res() response: Response,
  ) {
    const authUser = request.user;

    // 获取token
    const tokenResponse = await this.httpService.axiosRef.post(
      'http://127.0.0.1/api.php/v1/tokens',
      {
        account: 'visual',
        password: 'Zyh=20020821',
      },
    );
    if (tokenResponse.data.token) {
      console.log(tokenResponse.data.token);
      const userResponse = await this.httpService.axiosRef.get(
        'http://127.0.0.1/api.php/v1/users',
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
        if (user.account === authUser.nodeId) {
          result = true;
          break;
        }
      }
      if (result === true) {
        console.log('查找到认证用户，进行免密登录');
        const timestamp = Date.now().toString();
        const token = createHash('md5')
          .update('test0' + 'c6080a832a3ebe1d55f3b1d382a6ed9c' + timestamp)
          .digest('hex');

        response.redirect(
          `http://127.0.0.1/api.php?m=user&f=apilogin&account=${authUser.nodeId}&code=test0&time=${timestamp}&token=${token}`,
        );
      } else {
        // 创建用户
        console.log('未查找到认证用户，创建新用户');
        const password = generateRandomPassword(16);

        await this.httpService.axiosRef
          .post(
            'http://127.0.0.1/api.php/v1/users',
            {
              account: authUser.nodeId,
              password,
              realname: authUser.username,
            },
            {
              headers: {
                Token: tokenResponse.data.token,
              },
            },
          )
          .then(() => {
            /* TODO 拆分逻辑到service
             * 1. 生成账户密码后将用户的账号密码输出到网页展示
             * 2. 账号使用oidc的用户名
             * 3. 使用hbr模板
             */
            console.log('查找到认证用户，进行免密登录');
            const timestamp = Date.now().toString();

            response.redirect(
              `http://127.0.0.1/api.php?m=user&f=apilogin&account=${authUser.nodeId}&code=test0&time=${timestamp}&token=${createHash(
                'md5',
              )
                .update(
                  'test0' + 'c6080a832a3ebe1d55f3b1d382a6ed9c' + timestamp,
                )
                .digest('hex')}`,
            );
          })
          .catch((error) => {
            console.log(JSON.stringify(error.response.data));
          });
      }
    } else {
      response.status(500).json(tokenResponse);
    }
  }
}
