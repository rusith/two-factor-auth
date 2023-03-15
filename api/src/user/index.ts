import { Request, Response } from 'express';
import { SignUpRequest } from './user.dto';

export interface UserController {
  signUp(req: Request, res: Response): Promise<void>;
}

export interface UserService {
  signUp(data: SignUpRequest): Promise<void>;
}
