import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service.js';
import { UserClientService } from '../user/user-client.service.js';

interface AccessRequestEvent {
  accessRequestId: string;
  userId: string;
  roleId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  comment?: string;
  resolvedAt?: string;
  requestedAt: string;
}

const SUBJECT: Record<AccessRequestEvent['status'], string> = {
  PENDING: 'Your role access request has been submitted',
  APPROVED: 'Your role access request has been approved',
  REJECTED: 'Your role access request has been rejected',
  CANCELLED: 'Your role access request has been cancelled',
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly userClient: UserClientService,
    private readonly email: EmailService,
  ) {}

  async process(messageBody: string): Promise<void> {
    const event: AccessRequestEvent = JSON.parse(messageBody);
    const user = await this.userClient.findById(event.userId);

    const subject = SUBJECT[event.status];
    const html = this.buildHtml(event, user.name);

    await this.email.sendMail(user.email, subject, html);
  }

  private buildHtml(event: AccessRequestEvent, userName: string): string {
    const statusMessages: Record<AccessRequestEvent['status'], string> = {
      PENDING: `Your request for role <strong>${event.roleId}</strong> has been submitted and is awaiting review.`,
      APPROVED: `Great news! Your request for role <strong>${event.roleId}</strong> has been approved.`,
      REJECTED: `Your request for role <strong>${event.roleId}</strong> has been rejected.`,
      CANCELLED: `Your request for role <strong>${event.roleId}</strong> has been cancelled.`,
    };

    const commentLine = event.comment
      ? `<p><strong>Comment:</strong> ${event.comment}</p>`
      : '';

    const resolvedLine = event.resolvedAt
      ? `<p><strong>Resolved at:</strong> ${new Date(event.resolvedAt).toUTCString()}</p>`
      : '';

    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Role Access Request Update</h2>
        <p>Hi ${userName},</p>
        <p>${statusMessages[event.status]}</p>
        ${commentLine}
        <p><strong>Request ID:</strong> ${event.accessRequestId}</p>
        <p><strong>Requested at:</strong> ${new Date(event.requestedAt).toUTCString()}</p>
        ${resolvedLine}
        <hr />
        <p style="color: #888; font-size: 12px;">This is an automated notification.</p>
      </div>
    `;
  }
}
