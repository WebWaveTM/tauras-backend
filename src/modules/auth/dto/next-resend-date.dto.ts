import { Expose } from 'class-transformer';

export class NextResendDateDto {
  @Expose()
  nextResendDate: null | string;

  constructor(payload: Partial<NextResendDateDto>) {
    Object.assign(this, payload);
  }
}
