import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MainModule } from './module';
import { Logger } from '@nestjs/common';

const logger = new Logger(MainModule.name);

NestFactory.create<NestExpressApplication>(MainModule, {
  forceCloseConnections: false,
}).then((application) => {
  // 启动核心程序
  application.listen(3000).then(() => {
    application
      .getUrl()
      .then((fqdn) => logger.log(`Application is running on: ${fqdn}`));
  });
});
