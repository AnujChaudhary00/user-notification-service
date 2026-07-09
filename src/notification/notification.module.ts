import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { UserModule } from '../user/user.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [UserModule, EmailModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
