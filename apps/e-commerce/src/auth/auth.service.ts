import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  authClientResponseDto,
  authLogin,
  authRegisterDto,
  tokensPayload,
} from 'contracts';
import { BaseMicroservice } from '../common/base/base-microservice.service';

@Injectable()
export class AuthService extends BaseMicroservice {
  constructor(@Inject('AUTH_SERVICE') protected readonly client: ClientProxy) {
    super();
  }

  async register(dto: authRegisterDto): Promise<authClientResponseDto> {
    return this.sendToClient<authClientResponseDto, authRegisterDto>(
      AUTH_PATTERNS.REGISTER,
      dto,
    );
  }

  async login(dto: authLogin): Promise<authClientResponseDto> {
    return this.sendToClient<authClientResponseDto, authLogin>(
      AUTH_PATTERNS.LOGIN,
      dto,
    );
  }

  async updateTokens(payload: tokensPayload): Promise<authClientResponseDto> {
    return this.sendToClient<authClientResponseDto, tokensPayload>(
      AUTH_PATTERNS.UPDATETOKENS,
      payload,
    );
  }
}
