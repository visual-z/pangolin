import { Module } from '@nestjs/common';
import { AuthController } from './controller';
import { GithubStrategy } from './service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [GithubStrategy],
})
export class AuthApplicationModule {}
