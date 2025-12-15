import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Request, Response } from 'express';

interface IRpcError {
  status?: number;
  statusCode?: number;
  message?: string;
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    const error: unknown = exception.getError();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'An error occurred';

    if (typeof error === 'object' && error !== null) {
      const rpcError = error as IRpcError;

      status = rpcError.status ?? rpcError.statusCode ?? status;
      message = rpcError.message ?? message;
    } else if (typeof error === 'string') {
      message = error;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
