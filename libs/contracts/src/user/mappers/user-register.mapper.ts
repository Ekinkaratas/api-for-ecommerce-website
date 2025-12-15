import { authRegisterDto } from 'contracts/auth/index.js';
import { userRegisterDto } from '../user-register.dto.js';

export function toUserRegisterDto(
  dto: authRegisterDto,
  passwordHash: string,
): userRegisterDto {
  return {
    email: dto.email,
    password: passwordHash,
    firstName: dto.firstname,
    lastName: dto.lastname,
    phoneNumber: dto.phoneNumber,
  };
}
