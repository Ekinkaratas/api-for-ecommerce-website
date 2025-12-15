import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  USER_PATTERNS,
  userForAuthResponse,
  userLogin,
  userRegisterDto,
  validateDto,
} from 'contracts/index';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(USER_PATTERNS.REGISTER)
  async register(
    @Payload() data: userRegisterDto,
  ): Promise<userForAuthResponse> {
    const userdto = await validateDto<userRegisterDto>(userRegisterDto, data);

    return this.userService.register(userdto);
  }

  @MessagePattern(USER_PATTERNS.VERIFY)
  async verifyLogin(@Payload() data: userLogin): Promise<userForAuthResponse> {
    const userDto = await validateDto<userLogin>(userLogin, data);
    return this.userService.verifyLogin(userDto);
  }
  @EventPattern(USER_PATTERNS.ROLLBACK)
  rollBack(@Payload() userId: string): Promise<void> {
    return this.userService.deleteUser(userId);
  }
}
