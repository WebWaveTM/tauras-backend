import type { Response } from 'express';

import { Transactional } from '@nestjs-cls/transactional';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AppConfigService } from '~/config/config.service';

import type { TUser } from '../user/types';
import type { UnauthorizedExceptionPayload } from './types/exceptions.types';

import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';
import { REFRESH_TOKEN_COOKIE, type TokenPayload } from './const';
import { AccessPayload } from './decorators/access-payload.decorator';
import { AllowInactive } from './decorators/allow-inactive.decorator';
import { AllowUnverified } from './decorators/allow-unverified.decorator';
import { PublicRoute } from './decorators/public-route.decorator';
import { RefreshPayload } from './decorators/refresh-payload.decorator';
import { User } from './decorators/user.decorator';
import { NextResendDateDto } from './dto/next-resend-date.dto';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { TokensDto } from './dto/tokens.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailService } from './email.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly accessTokenService: AccessTokenService,
    private readonly configService: AppConfigService
  ) {}

  private setCookieRefreshToken(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      maxAge: this.configService.get('REFRESH_EXPIRES_IN') * 1000,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
  }

  private clearCookieRefreshToken(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'none',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
  }

  @Delete('/ban-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banAccessToken(@AccessPayload() accessPayload: TokenPayload) {
    await this.accessTokenService.ban(accessPayload);
  }

  @Get('/refresh')
  @PublicRoute()
  @Transactional()
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @RefreshPayload() refreshPayload: TokenPayload
  ) {
    const tokens = await this.authService.refreshTokens(refreshPayload);
    this.setCookieRefreshToken(res, tokens.refreshToken);

    return new TokensDto(tokens);
  }

  @Post('/signin')
  @PublicRoute()
  @Transactional()
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.signin(body);
    if (!tokens) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        type: 'invalid_credentials',
      } satisfies UnauthorizedExceptionPayload);
    }
    this.setCookieRefreshToken(res, tokens.refreshToken);

    return new TokensDto(tokens);
  }

  @Post('/signup')
  @PublicRoute()
  @Transactional()
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.signup(body);
    await this.emailService.requestEmailVerification(
      body.email,
      `${body.firstName} ${body.lastName}`
    );

    this.setCookieRefreshToken(res, tokens.refreshToken);

    return new TokensDto(tokens);
  }

  @Get('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Transactional()
  @UseGuards(RefreshTokenGuard)
  async signout(
    @Res({ passthrough: true }) res: Response,
    @AccessPayload() accessPayload: TokenPayload,
    @RefreshPayload() refreshPayload: TokenPayload
  ) {
    await this.authService.signout(accessPayload, refreshPayload);
    this.clearCookieRefreshToken(res);
  }

  // async forgotPassword() {
  //   return 'forgot password';
  // }

  // async resetPassword() {
  //   return 'reset password';
  // }

  @AllowInactive()
  @AllowUnverified()
  @Get('/send-verification-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendVerificationEmail(@User() user: TUser) {
    const isRequestAllowed = await this.emailService.isRequestAllowed(
      user.email
    );

    if (!isRequestAllowed) {
      throw new HttpException(
        'Request not allowed',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    await this.emailService.requestEmailVerification(user.email, user.fullName);
  }

  @AllowInactive()
  @AllowUnverified()
  @Get('/verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyEmail(@Query() query: VerifyEmailDto, @User() user: TUser) {
    const isVerified = await this.emailService.verifyEmail(
      user.id,
      user.email,
      query.code
    );

    if (!isVerified) {
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @AllowInactive()
  @AllowUnverified()
  @Get('/next-resend-date')
  async getNextResendDate(@User() user: TUser) {
    const nextResendDate = await this.emailService.getNextResendDate(
      user.email
    );

    return new NextResendDateDto({
      nextResendDate,
    });
  }
}
