import { NestFactory } from '@nestjs/core';
import type { SQSEvent } from 'aws-lambda';
import { NotificationService } from './notification/notification.service.js';
import { NotificationLambdaModule } from './notification-lambda.module.js';

let notificationService: NotificationService;

async function bootstrap(): Promise<NotificationService> {
  if (notificationService) return notificationService;
  const app = await NestFactory.createApplicationContext(NotificationLambdaModule);
  notificationService = app.get(NotificationService);
  return notificationService;
}

export const handler = async (event: SQSEvent): Promise<void> => {
  const service = await bootstrap();
  await Promise.all(event.Records.map((record) => service.process(record.body)));
};
