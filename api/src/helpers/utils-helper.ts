import { createHmac } from 'crypto';
import { injectable } from 'inversify';
import { nanoid } from 'nanoid';
import { UtilHelper } from '.';

@injectable()
export class UtilHelperImpl implements UtilHelper {
  getUniqueString(length: number) {
    return nanoid(length).substring(0, length);
  }

  saltHashPassword(password: string, salt: string): string {
    const hash = createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
  }
}
