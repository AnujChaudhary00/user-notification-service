import { Module } from '@nestjs/common';
import { SqsConsumerService } from './sqs-consumer.service.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  providers: [SqsConsumerService],
})
export class SqsModule {}
