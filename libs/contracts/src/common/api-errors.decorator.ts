import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './error-response.dto';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Invalid Request',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized Access',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Access Denied',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'No record found',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Server Error',
      type: ErrorResponseDto,
    }),
  );
}
