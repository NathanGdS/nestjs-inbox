import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ClusterService } from './cluster.service';

async function bootstrap() {
  await ClusterService.initialize(async () => {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));

    const port = process.env.PORT || 3000;
    await app.listen(port);
    const loggerInstance = app.get(Logger);
    loggerInstance.log(
      `🚀 Application is running ons: http://localhost:${port}`
    );
  });
}
bootstrap();
