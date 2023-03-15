import { BaseController } from '@app/shared/base-controller';
import { TYPES } from '@app/types';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AuthController, AuthService } from '.';

@injectable()
export class AuthControllerImpl
  extends BaseController
  implements AuthController
{
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {
    super();
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      this.handleSuccess(await this.authService.login(req.body), res);
    } catch (err) {
      this.handleError(err, res);
    }
  }

  async getTwoFactorRegistrationOptions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      this.handleSuccess(
        await this.authService.getTwoFactorRegistrationOptions(
          this.getUserId(res)
        ),
        res
      );
    } catch (err) {
      return this.handleError(err, res);
    }
  }

  async verifyTwoFactorRegistration(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await this.authService.verifyTwoFactorRegistration(
        req.body,
        this.getUserId(res)
      );
      this.handleSuccess(result, res);
    } catch (err) {
      return this.handleError(err, res);
    }
  }
}
