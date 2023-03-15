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

    function send(status: number, error: string) {
      res.status(status);
      res.send({ success: false, error, data: null });
    }

    if (err instanceof ValidationError) {
      send(400, err.message);
    } else if (err instanceof NotFoundError) {
      send(404, err.message || 'Resource not found');
    } else {
      // eslint-disable-next-line no-console
      console.log('Unexpected error: ', err);
      send(500, 'Unexpected error occurred');
    }
  }

  protected getUserId(res: Response) {
    return res.locals?.userId;
  }
}
