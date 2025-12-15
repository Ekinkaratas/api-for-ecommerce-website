import { Inject, Injectable } from '@nestjs/common';
import type { Redis as redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: redis) {}

  async setTokens(userId: string, access: string, refresh: string) {
    const multi = this.client.multi();

    multi.set(`access:${userId}`, access, 'EX', 60 * 15);
    multi.set(`refresh:${userId}`, refresh, 'EX', 60 * 60 * 24 * 7);

    const result = await multi.exec();

    if (!result) {
      throw new Error('Redis transaction failed');
    }
  }

  async deleteTokens(userId: string) {
    await this.client.del(`auth:access:${userId}`);
    await this.client.del(`auth:refresh:${userId}`);
  }
}
