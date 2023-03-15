import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/typescript-types';
import { Request, Response } from 'express';
import { LoginRequest, LoginResultDTO } from './auth.dto';

export interface AuthService {
  login(data: LoginRequest): Promise<LoginResultDTO>;
  getTwoFactorRegistrationOptions(
    userId: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON>;

  verifyTwoFactorRegistration(
    data: RegistrationResponseJSON,
    userId: string
  ): Promise<boolean>;
}

export interface AuthController {
  login(req: Request, res: Response): Promise<void>;
  getTwoFactorRegistrationOptions(req: Request, res: Response): Promise<void>;
  verifyTwoFactorRegistration(req: Request, res: Response): Promise<void>;
}
