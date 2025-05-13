export type UnauthorizedExceptionPayload = {
  message: string;
  type: RestrictionType;
};

type RestrictionType =
  | 'email_not_verified'
  | 'invalid_credentials'
  | 'invalid_token'
  | 'user_banned';
