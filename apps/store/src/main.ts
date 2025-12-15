import { NestFactory } from '@nestjs/core';
import { StoreModule } from './store.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StoreModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: Number(process.env.SERVICE_PORT),
      },
    },
  );
  await app.listen();
}
void bootstrap();
