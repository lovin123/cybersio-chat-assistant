import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS for local development (middleware handles Vercel serverless)
  app.enableCors({
    origin:
      process.env.FRONTEND_URL ||
      'https://cybersio-chat-assistant-9dtu.vercel.app',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();
  cachedApp = app;
  return app;
}

// For Vercel serverless
export default async function handler(req: any, res: any) {
  const app = await createApp();
  const httpAdapter = app.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
}

// For local development
async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

// Only bootstrap if not in serverless environment
if (require.main === module) {
  bootstrap();
}
