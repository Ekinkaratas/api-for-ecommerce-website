import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiCommonResponses,
  authClientResponseDto,
  authLogin,
  authRegisterDto,
  tokensPayload,
} from 'contracts';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { CurrentUser } from './decorator/get-current-user.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RpcExceptionFilter } from '../common/filters/rpc-exception.filter';

@ApiTags('auth')
@UseFilters(new RpcExceptionFilter())
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/r')
  @ApiOperation({ summary: 'creates a new user' })
  @ApiCommonResponses()
  register(@Body() dto: authRegisterDto): Promise<authClientResponseDto> {
    return this.authService.register(dto);
  }

  @Post('/L')
  @ApiOperation({ summary: 'user information is verified' })
  @ApiCommonResponses()
  login(@Body() dto: authLogin): Promise<authClientResponseDto> {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/newT')
  @ApiOperation({ summary: 'updates user tokens' })
  @ApiCommonResponses()
  updateTokens(@CurrentUser() userPayload: tokensPayload) {
    return this.authService.updateTokens(userPayload);
  }
}
