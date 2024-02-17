import { DynamicModule, Module } from '@nestjs/common';
import { AuthApplicationModule } from './auth/module';

@Module({
  imports: [AuthApplicationModule],
  controllers: [],
  providers: [],
})
export class ApplicationModule {
  public static forRoot(): DynamicModule {
    return {
      module: ApplicationModule,
    };
  }
}
