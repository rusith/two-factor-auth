import { Request, Response } from 'express';
import { GetUserResponse, SignUpRequest } from './user.dto';

export interface UserController {
  signUp(req: Request, res: Response): Promise<void>;
  getCurrentUser(req: Request, res: Response): Promise<void>;
}

export interface UserService {
  signUp(data: SignUpRequest): Promise<void>;
  getUser(id: string): Promise<GetUserResponse>;
}
