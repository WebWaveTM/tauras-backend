import { Expose, plainToClass } from 'class-transformer';

@Expose()
export class ExposeAllDto {
  constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this.exposeNestedObjects(this);
  }

  private exposeNestedObjects(obj: any) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = plainToClass(ExposeAllDto, obj[key]);
        this.exposeNestedObjects(obj[key]);
      }
    }
  }
}
