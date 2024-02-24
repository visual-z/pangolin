import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller';
import { AuthenticationService } from './service';
import { HttpModule } from '@nestjs/axios';
import { AuthenticationTask } from './task';

@Module({
  imports: [HttpModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthenticationTask],
})
export class AuthenticationApplicationModule {}
