import { Request, Response } from 'express';

export function mockRequest(locals = {}, body = {}) {
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
    request: { body } as Request,
    response: {
      status: statusFn,
      send: sendFn,
      setHeader,
      locals
    } as unknown as Response
  };
}
