import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClusterService } from './cluster.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  await ClusterService.initialize(async () => {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    const loggerInstance = app.get(Logger);
    loggerInstance.log(`🚀 Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
