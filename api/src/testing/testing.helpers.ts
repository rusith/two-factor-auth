import { DBProvider } from '@app/helpers/db-provider';
import { container } from '@app/inversify.config';
import { TYPES } from '@app/types';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';

export function mockRequest(locals = {}, body = {}, requestHeaders = {}) {
  let status = 200;
  let data: unknown = null;
  const headers = new Map<string, string>();
  const statusFn = (s: number) => (status = s);
  const sendFn = (d: unknown) => (data = d);
  const setHeader = (type: string, value: string) => headers.set(type, value);

  return {
    getStatus: () => status,
    getData: () => data,
    getContentType: () => headers.get('Content-Type'),
    request: { body, headers: requestHeaders } as Request,
    response: {
      status: statusFn,
      send: sendFn,
      setHeader,
      locals
    } as unknown as Response
  };
}

export function mockDbProvider(mock?: (client: PrismaClient) => void) {
  container.unbind(TYPES.DBProvider);
  const mockClient = mockDeep<PrismaClient>();
  mock && mock(mockClient);
  container.bind<DBProvider>(TYPES.DBProvider).toConstantValue({
    createClient: () => mockClient
  });
}
