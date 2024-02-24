import { DynamicModule, Module } from '@nestjs/common';
import { AuthenticationApplicationModule } from './authentication/module';

@Module({
  imports: [AuthenticationApplicationModule],
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
