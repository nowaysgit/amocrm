import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await app.get(ConfigService);
  const port = config.get<number>('PORT') || config.get<number>('API_PORT');
  await app.listen(port, () => console.log(`Server start at port: ${port}`));
}
bootstrap().then();
