import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  authClientResponseDto,
  authLogin,
  authRegisterDto,
  tokensPayload,
} from 'contracts/index';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: authRegisterDto): Promise<authClientResponseDto> {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() dto: authLogin): Promise<authClientResponseDto> {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.UPDATETOKENS)
  updateTokens(@Payload() req: tokensPayload): Promise<authClientResponseDto> {
    return this.authService.updateTokens(req);
  }
}
