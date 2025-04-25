import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClusterService } from './cluster.service';

async function bootstrap() {
  await ClusterService.initialize(async () => {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
