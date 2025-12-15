import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import * as argon from 'argon2';
import {
  authClientResponseDto,
  authLogin,
  authRegisterDto,
  rpc,
  toUserRegisterDto,
  USER_PATTERNS,
  userForAuthResponse,
  tokensPayload,
} from 'contracts/index';

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('USER-SERVICE') private readonly userService: ClientProxy,
    @Inject('REDIS_CLIENT') private readonly redis: RedisService,
  ) {}

  private async getTokens(payload: tokensPayload): Promise<Tokens> {
    try {
      const [access_token, refresh_token] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
          expiresIn: '15m',
        }),

        this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
          expiresIn: '7d',
        }),
      ]);

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async register(dto: authRegisterDto): Promise<authClientResponseDto> {
    const hash = await argon.hash(dto.password);

    const userDto = toUserRegisterDto(dto, hash);

    const payload = await rpc<tokensPayload>(
      this.userService,
      USER_PATTERNS.REGISTER,
      userDto,
    );

    const tokens = await this.getTokens(payload);

    try {
      await this.redis.setTokens(
        payload.id,
        tokens.access_token,
        tokens.refresh_token,
      );

      return {
        userData: payload,
        refresh_Token: tokens.access_token,
        access_Token: tokens.refresh_token,
      };
    } catch (e) {
      this.userService.emit(USER_PATTERNS.ROLLBACK, payload.id);
      console.log('auth.service register error message: ', e);
      throw new InternalServerErrorException(
        'Redis error — transaction aborted',
      );
    }
  }

  async login(dto: authLogin): Promise<authClientResponseDto> {
    const result = await rpc<userForAuthResponse>(
      this.userService,
      USER_PATTERNS.VERIFY,
      dto,
    );

    const { passwordHash, ...user } = result;

    const passwordFlag = await argon.verify(passwordHash, dto.password);

    if (!passwordFlag) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user);

    try {
      await this.redis.setTokens(
        user.id,
        tokens.access_token,
        tokens.refresh_token,
      );

      return {
        userData: user,
        refresh_Token: tokens.access_token,
        access_Token: tokens.refresh_token,
      };
    } catch (e) {
      console.log('auth.service register error message: ', e);
      throw new InternalServerErrorException(
        'Redis error — transaction aborted',
      );
    }
  }

  async updateTokens(req: tokensPayload): Promise<authClientResponseDto> {
    const tokens = await this.getTokens(req);

    try {
      await this.redis.setTokens(
        req.id,
        tokens.access_token,
        tokens.refresh_token,
      );

      return {
        userData: req,
        refresh_Token: tokens.access_token,
        access_Token: tokens.refresh_token,
      };
    } catch (e) {
      console.log('auth.service updateTokens error message: ', e);
      throw new InternalServerErrorException(
        'Redis error — transaction aborted',
      );
    }
  }
}
