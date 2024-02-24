import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { load } from 'js-yaml';
import * as _ from 'lodash';
import { readdirSync, readFileSync } from 'fs';
import { redisClusterStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ApplicationModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          return readdirSync('./.resources/configurations/', {
            withFileTypes: true,
          })
            .filter((element) => {
              return !element.name.endsWith('example.yaml');
            })
            .map((element) => {
              return load(
                readFileSync(`${element.path}${element.name}`).toString(),
              ) as Record<string, unknown>;
            })
            .reduce((previousValue, currentValue) => {
              return _.merge(previousValue, currentValue);
            }, {});
        },
      ],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        //
        const instance = await redisClusterStore(
          configService.getOrThrow('main.provider.catcher'),
        );
        //
        return {
          store: instance as unknown as CacheStore,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
