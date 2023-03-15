import { AuthTokenHelper } from '@app/helpers';
import { Request, Response } from 'express';

export function authenticatedApi(
  tokenHelper: Pick<AuthTokenHelper, 'verifyAuthToken'>
) {
  return async (req: Request, res: Response, next: () => void) => {
    function sendUnauthorized() {
      res.setHeader('Content-Type', 'application/json');
      res.status(401);
      res.send({ success: false, error: 'Unauthorized', data: null });
    }

    const header = req.headers.authorization;
    if (!header) {
      return sendUnauthorized();
    }
    const [tokenType, token] = header.split(' ');

    if (tokenType !== 'Bearer') {
      return sendUnauthorized();
    }

    if (!token) {
      return sendUnauthorized();
    }

    const userId = await tokenHelper.verifyAuthToken(token);

    if (!userId) {
      return sendUnauthorized();
    }

    res.locals.userId = userId;

    next();
  };
}
