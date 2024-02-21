import { Module } from '@nestjs/common';
import { AuthenticationController } from './controller';
import { AuthenticationService } from './service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: '.resources/.env',
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationApplicationModule {}
