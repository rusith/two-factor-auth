import { NotFoundError } from '@app/errors/NotFoundError';
import { ValidationError } from '@app/errors/ValidationError';
import { Response } from 'express';
import { injectable } from 'inversify';

@injectable()
export class BaseController {
  protected handleSuccess<T>(data: T | null, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
      success: true,
      error: null,
      data
    });
  }

  protected handleError(err: unknown, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    if (err instanceof ValidationError) {
      res.status(400);
      res.send({
        success: false,
        error: err.message,
        data: null
      });
    } else if (err instanceof NotFoundError) {
      res.status(404);
      res.send({
        success: false,
        error: 'Resource not found',
        data: null
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('Unexpected error: ', err);
      res.status(400);
      res.send({
        success: false,
        error: 'An unexpected error occurred',
        data: null
      });
    }
  }

  protected getUserId(res: Response) {
    return res.locals.userId;
  }
}
