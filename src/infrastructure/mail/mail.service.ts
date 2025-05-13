import type { Eta } from 'eta';
import type { Transporter } from 'nodemailer';

import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  MAIL_RENDERER_INSTANCE,
  MAIL_TRANSPORTER_INSTANCE,
  type TemplatePayload,
} from './const';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_TRANSPORTER_INSTANCE)
    private readonly transporter: Transporter,
    @Inject(MAIL_RENDERER_INSTANCE) private readonly renderer: Eta
  ) {}

  async sendMail(
    to: string | string[],
    subject: string,
    template: TemplatePayload
  ) {
    const { data, id } = template;
    this.logger.log(
      `Rendering template: ${id} with data: ${JSON.stringify(data)}`
    );
    const html = await this.renderer.renderAsync(id, data);
    this.logger.log(
      `Sending email to: ${Array.isArray(to) ? to.join(', ') : to}, subject: "${subject}"`
    );
    await this.transporter.sendMail({
      html,
      subject,
      to,
    });
    this.logger.log(`Email sent to: ${Array.isArray(to) ? to.join(', ') : to}`);
  }
}
