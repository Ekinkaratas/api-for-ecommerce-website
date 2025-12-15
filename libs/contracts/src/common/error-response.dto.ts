import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP Status Code' })
  statusCode: number;

  @ApiProperty({ example: 'Product not found', description: 'Error Message' })
  message: string;

  @ApiProperty({
    example: '2023-10-27T10:00:00.000Z',
    description: 'Time Stamp',
  })
  timestamp: string;

  @ApiProperty({ example: '/products/1', description: 'Desired path' })
  path: string;
}
