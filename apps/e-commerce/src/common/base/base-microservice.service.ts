import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom, throwError, timeout } from 'rxjs';

export abstract class BaseMicroservice {
  protected abstract readonly client: ClientProxy;

  protected async sendToClient<TResponse, TPayload>(
    pattern: string,
    payload: TPayload,
    timeoutDuration: number = 5000,
  ): Promise<TResponse> {
    const result$ = this.client
      .send<TResponse, TPayload>(pattern, payload)
      .pipe(
        timeout(timeoutDuration),
        catchError((err: unknown) =>
          throwError(() => new RpcException(err as string | object)),
        ),
      );
    return await lastValueFrom(result$);
  }
}
