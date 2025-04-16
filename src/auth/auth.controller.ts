import type { Response } from 'express';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AppConfigService } from '~/config/config.service';

import { AccessTokenService } from './access-token.service';
import { AuthService } from './auth.service';
import { REFRESH_TOKEN_COOKIE, type TokenPayload } from './const';
import { AccessPayload } from './decorators/access-payload';
import { PublicRoute } from './decorators/public-route.decorator';
import { RefreshPayload } from './decorators/refresh-payload.decorator';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { TokensDto } from './dto/tokens.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accessTokenService: AccessTokenService,
    private readonly configService: AppConfigService
  ) {}

  private setCookieRefreshToken(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      maxAge: this.configService.get('REFRESH_EXPIRES_IN') * 1000,
      sameSite: 'strict',
      secure: this.configService.get('NODE_ENV') === 'production',
    });
  }

  private clearCookieRefreshToken(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      sameSite: 'strict',
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
  async signin(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.signin(body);
    this.setCookieRefreshToken(res, tokens.refreshToken);

    return new TokensDto(tokens);
  }

  @Post('/signup')
  @PublicRoute()
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.signup(body);
    this.setCookieRefreshToken(res, tokens.refreshToken);

    return new TokensDto(tokens);
  }

  @Get('/signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async signout(
    @Res({ passthrough: true }) res: Response,
    @AccessPayload() accessPayload: TokenPayload,
    @RefreshPayload() refreshPayload: TokenPayload
  ) {
    await this.authService.signout(accessPayload, refreshPayload);
    this.clearCookieRefreshToken(res);
  }

  // @Get('/test')
  // test() {
  //   return 'test';
  // }

  async forgotPassword() {
    return 'forgot password';
  }

  async resetPassword() {
    return 'reset password';
  }

  async sendVerificationEmail() {
    return 'send verification email';
  }

  async verifyEmail() {
    return 'verify email';
  }
}
