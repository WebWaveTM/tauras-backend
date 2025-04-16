import type { SignUpPayload } from './signup.payload';

export type SignInPayload = Pick<SignUpPayload, 'email' | 'password'>;
