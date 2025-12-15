import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

export async function rpc<T = any>(
  client: ClientProxy,
  pattern: any,
  data: any,
): Promise<T> {
  return await firstValueFrom(client.send(pattern, data));
}
