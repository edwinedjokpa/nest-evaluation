import { Request } from 'express';

export interface RequestWithUserId extends Request {
  user: { id: string; email: string; password: string };
}
