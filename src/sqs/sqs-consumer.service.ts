import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { NotificationService } from '../notification/notification.service.js';

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private isRunning = false;

  constructor(private readonly notificationService: NotificationService) {
    this.client = new SQSClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.queueUrl = process.env.SQS_QUEUE_URL!;
  }

  onModuleInit() {
    this.isRunning = true;
    this.poll();
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  private async poll(): Promise<void> {
    while (this.isRunning) {
      try {
        const response = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 20,
          }),
        );

        for (const message of response.Messages ?? []) {
          try {
            await this.notificationService.process(message.Body!);
            await this.client.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle!,
              }),
            );
          } catch (err) {
            this.logger.error(`Failed to process message ${message.MessageId}`, err);
          }
        }
      } catch (err) {
        if (this.isRunning) {
          this.logger.error('SQS receive error, retrying in 5s', err);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }
  }
}
