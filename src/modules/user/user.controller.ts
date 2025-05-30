import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { convertQueryObject } from '~/infrastructure/database/prisma/lib/convert-query-object';

import type { UpdateUserDto } from './dto/update-user.dto';
import type { TUser } from './types';

import { AllowInactive } from '../auth/decorators/allow-inactive.decorator';
import { AllowUnverified } from '../auth/decorators/allow-unverified.decorator';
import { User } from '../auth/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { PaginationUserParams } from './dto/pagination-users-params.dto';
import { SearchUserParams } from './dto/search-users-params.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() payload: CreateUserDto) {
    const user = await this.userService.create(payload);
    return new UserDto(user);
  }

  @Get()
  async getMany(@Query() query: PaginationUserParams) {
    const paginationParams = convertQueryObject(query);
    const user = await this.userService.findAll(paginationParams);
    return new PaginatedUsersDto(user);
  }

  @Get('/search')
  async search(@Query() query: SearchUserParams) {
    const users = await this.userService.search(query.query);
    return users.map((user) => new UserDto(user));
  }

  @AllowInactive()
  @AllowUnverified()
  @Get('/me')
  async getMe(@User() user: TUser) {
    return new UserDto(user);
  }

  @AllowInactive()
  @AllowUnverified()
  @Patch('/me')
  async updateMe(@User() user: TUser, @Body() payload: UpdateUserDto) {
    const updatedUser = await this.userService.update(user.id, payload);
    return new UserDto(updatedUser);
  }

  @Get('/:id')
  async getOne(@Param() params: UserIdParamDto) {
    const user = await this.userService.findOne(params.id);
    if (!user) {
      throw new HttpException(
        `User with id ${params.id} not found`,
        HttpStatus.NOT_FOUND
      );
    }
    return new UserDto(user);
  }

  @Patch('/:id')
  async update(
    @Param() params: UserIdParamDto,
    @Body() payload: UpdateUserDto
  ) {
    const user = await this.userService.update(params.id, payload);
    return new UserDto(user);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: UserIdParamDto) {
    await this.userService.remove(params.id);
  }
}
