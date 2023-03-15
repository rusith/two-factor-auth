import { NotFoundError } from '@app/errors/NotFoundError';
import { ValidationError } from '@app/errors/ValidationError';
import { UtilHelper } from '@app/helpers';
import { TYPES } from '@app/types';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { UserService } from '.';
import { GetUserResponse, SignUpRequest } from './user.dto';

@injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @inject(TYPES.UtilHelper) private readonly utilHelper: UtilHelper
  ) {}

  async getUser(id: string): Promise<GetUserResponse> {
    const prismaClient = new PrismaClient();
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const user = await prismaClient.user.findFirst({
      where: { id },
      include: { userAuthenticators: true }
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      name: user.name,
      tfaEnabled: user.userAuthenticators.length > 0
    };
  }

  public async signUp(data: SignUpRequest): Promise<void> {
    const prismaClient = new PrismaClient();
    if (!data.name) {
      throw new ValidationError('Name is required');
    }
    if (!data.email) {
      throw new ValidationError('Email is required');
    }
    if (!data.password) {
      throw new ValidationError('Password is required');
    }

    const salt = this.utilHelper.getUniqueString(30);

    const userWithEmail = await prismaClient.user.findFirst({
      where: {
        email: data.email
      }
    });

    if (userWithEmail) {
      throw new ValidationError('Email already exists');
    }

    await prismaClient.user.create({
      data: {
        email: data.email,
        name: data.name,
        salt,
        password: this.utilHelper.saltHashPassword(data.password, salt)
      }
    });
  }
}
