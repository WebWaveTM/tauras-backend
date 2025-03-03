import { Controller, Get, Param } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/{:num}')
  getHello(@Param('num') param: number = null) {
    return `Hello world! ${param}`;
  }
}
