import { Prisma, PrismaClient } from '@prisma/client';
import { injectable } from 'inversify';

export interface DBProvider {
  createClient(): PrismaClient;
}

@injectable()
export class PrismaDBProvider implements DBProvider {
  createClient(): PrismaClient {
    return new PrismaClient();
  }
}
