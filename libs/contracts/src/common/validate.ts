import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  payload: any,
): Promise<T> {
  const instance = plainToInstance(dtoClass, payload);
  const errors = await validate(instance);

  if (errors.length > 0) {
    const msg = errors
      .flatMap((e) => (e.constraints ? Object.values(e.constraints) : []))
      .join(', ');

    throw new Error(`DTO Validation failed: ${msg}`);
  }

  return instance;
}
