import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/module';

@Module({
  imports: [ApplicationModule.forRoot()],
  controllers: [],
  providers: [],
})
export class MainModule {}
