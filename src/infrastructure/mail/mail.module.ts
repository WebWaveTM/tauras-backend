import { Module } from '@nestjs/common';
import { Eta } from 'eta';
import { createTransport } from 'nodemailer';
import { join } from 'path';

import { AppConfigService } from '~/config/config.service';

import { MAIL_RENDERER_INSTANCE, MAIL_TRANSPORTER_INSTANCE } from './const';
import { MailService } from './mail.service';

@Module({
  exports: [MailService],
  providers: [
    {
      inject: [AppConfigService],
      provide: MAIL_TRANSPORTER_INSTANCE,
      useFactory: (configService: AppConfigService) =>
        createTransport({
          auth: {
            pass: configService.get('MAIL_PASSWORD'),
            user: configService.get('MAIL_USER'),
          },
          from: configService.get('MAIL_FROM'),
          host: configService.get('MAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: configService.get('MAIL_SECURE'),
        }),
    },
    {
      provide: MAIL_RENDERER_INSTANCE,
      useFactory: () =>
        new Eta({
          views: join(__dirname, '..', '..', 'assets', 'templates'),
        }),
    },
    MailService,
  ],
})
export class MailModule {}
