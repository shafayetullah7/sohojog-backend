// express.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';
import { JwtUser } from 'src/shared/interfaces/jwt.user.interface';

declare global {
  namespace Express {
    interface Request {
      startTime?: number; // Add startTime property
      user?: JwtUser;
    }
  }
}
