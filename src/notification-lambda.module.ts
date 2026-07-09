import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from './sqs/sqs.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SqsModule,
  ],
})
export class NotificationLambdaModule {}
