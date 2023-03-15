import { BaseController } from '@app/shared/base-controller';
import { TYPES } from '@app/types';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { UserController, UserService } from '.';

@injectable()
export class UserControllerImpl
  extends BaseController
  implements UserController
{
  constructor(
    @inject(TYPES.UserService) private readonly userService: UserService
  ) {
    super();
  }

  async getCurrentUser(_: Request, res: Response): Promise<void> {
    const userId = res.locals.userId;
    try {
      const result = await this.userService.getUser(userId);
      this.handleSuccess(result, res);
    } catch (err) {
      this.handleError(err, res);
    }
  }

  async signUp(req: Request, res: Response): Promise<void> {
    try {
      this.handleSuccess(await this.userService.signUp(req.body), res);
    } catch (err) {
      this.handleError(err, res);
    }
  }
}
