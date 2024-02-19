import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller';
import { AuthenticationService } from './service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationApplicationModule {}
