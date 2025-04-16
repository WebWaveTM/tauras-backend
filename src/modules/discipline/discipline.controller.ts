import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import type { PaginationDisciplineParams } from './dto/pagination-discipline-params.dto';

import { DisciplineService } from './discipline.service';
import { CreateDisciplineDto } from './dto/create-discipline.dto';
import { DisciplineIdParamDto } from './dto/discipline-id-param.dto';
import { DisciplineDto } from './dto/discipline.dto';
import { PaginatedDisciplinesDto } from './dto/paginated-disciplines.dto';
import { UpdateDisciplineDto } from './dto/update-discipline.dto';

@Controller('disciplines')
export class DisciplineController {
  constructor(private readonly disciplineService: DisciplineService) {}

  @Post()
  async create(@Body() createDisciplineDto: CreateDisciplineDto) {
    const discipline = await this.disciplineService.create(createDisciplineDto);
    return new DisciplineDto(discipline);
  }

  @Get()
  async findAll(@Param() params: PaginationDisciplineParams) {
    const disciplines = await this.disciplineService.findAll(params);
    return new PaginatedDisciplinesDto(disciplines);
  }

  @Get('/:id')
  async findOne(@Param() params: DisciplineIdParamDto) {
    const discipline = await this.disciplineService.findOne(params.id);
    return new DisciplineDto(discipline);
  }

  @Patch('/:id')
  async update(
    @Param() params: DisciplineIdParamDto,
    @Body() updateDisciplineDto: UpdateDisciplineDto
  ) {
    const discipline = await this.disciplineService.update(
      params.id,
      updateDisciplineDto
    );
    return new DisciplineDto(discipline);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param() params: DisciplineIdParamDto) {
    await this.disciplineService.remove(params.id);
  }
}
