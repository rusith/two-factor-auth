import { NotFoundError } from '@app/errors/NotFoundError';
import { ValidationError } from '@app/errors/ValidationError';
import { UtilHelper } from '@app/helpers';
import { DBProvider } from '@app/helpers/db-provider';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { UserService } from '.';
import { GetUserResponse, SignUpRequest } from './user.dto';

@injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @inject(TYPES.UtilHelper) private readonly utilHelper: UtilHelper,
    @inject(TYPES.DBProvider) private readonly dbProvider: DBProvider
  ) {}

  async getUser(id: string): Promise<GetUserResponse> {
    const dbClient = this.dbProvider.createClient();
    if (!id) {
      throw new ValidationError('User ID is required');
    }

    const user = await dbClient.user.findFirst({
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
    const dbClient = this.dbProvider.createClient();
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

    const userWithEmail = await dbClient.user.findFirst({
      where: {
        email: data.email
      }
    });

    if (userWithEmail) {
      throw new ValidationError('Email already exists');
    }

    await dbClient.user.create({
      data: {
        email: data.email,
        name: data.name,
        salt,
        password: this.utilHelper.saltHashPassword(data.password, salt)
      }
    });
  }
}
