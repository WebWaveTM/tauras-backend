import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '~/config/config.service';
import { UserModule } from '~/user/user.module';

import { AccessTokenService } from './access-token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        global: false,
        verifyOptions: {
          audience: configService.get('JWT_AUDIENCE'),
          ignoreExpiration: false,
          issuer: configService.get('JWT_ISSUER'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    RefreshTokenService,
    AccessTokenService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
  ],
})
export class AuthModule {}
