import type { Prisma } from '@prisma/client';

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PrismaService } from '../prisma.service';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueFieldConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const [model, field] = args.constraints;
    const record = await this.txHost.tx[model as Prisma.ModelName].findUnique({
      where: { [field]: value },
    });
    return !record;
  }

  defaultMessage(args: ValidationArguments) {
    const [model, field] = args.constraints;
    return `${field} already exists in ${model}`;
  }
}

export function IsUniqueField(
  model: Prisma.ModelName,
  field: string,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      constraints: [model, field],
      options: validationOptions,
      propertyName: propertyName,
      target: object.constructor,
      validator: IsUniqueFieldConstraint,
    });
  };
}
