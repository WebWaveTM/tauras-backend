export const MAIL_TRANSPORTER_INSTANCE = 'MAILER_INSTANCE';
export const MAIL_RENDERER_INSTANCE = 'MAIL_RENDERER_INSTANCE';

export type Template = 'restorePassword' | 'verifyEmail';
export type TemplateData<
  T extends Template,
  P extends Record<string, unknown>,
> = {
  data: P;
  id: T;
};

export type TemplatePayload =
  | TemplateData<
      'restorePassword',
      {
        link: string;
        name: string;
      }
    >
  | TemplateData<
      'verifyEmail',
      {
        code: string;
        link: string;
        name: string;
      }
    >;
