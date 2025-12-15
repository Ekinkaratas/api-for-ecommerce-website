import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  userForAuthResponse,
  userLogin,
  userRegisterDto,
} from 'contracts/index';
import { PrismaService } from './prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: userRegisterDto): Promise<userForAuthResponse> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: dto.password,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phoneNumber,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });

      return user;
    } catch (error) {
      // Handling only known Prisma errors
      if (error instanceof PrismaClientKnownRequestError) {
        // P2002 = unique constraint
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken.');
        }
      }

      // Unexpected errors propagate as 500
      throw new InternalServerErrorException('Database error.');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // P2025 = record not found
        if (error.code === 'P2025') {
          return;
        }
      }
      throw new InternalServerErrorException('Failed to rollback user.');
    }
  }

  async verifyLogin(dto: userLogin): Promise<userForAuthResponse> {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: {
          OR: [{ email: dto.email }, { phone: dto.phoneNumber }],
        },

        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          passwordHash: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw error;
    }
  }
}
