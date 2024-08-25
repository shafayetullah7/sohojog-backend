// src/@types/express.d.ts

import * as express from 'express';
import { JwtUser } from 'src/shared/interfaces/jwt.user.interface';

// declare global {
//   namespace Express {
//     interface Request {
//       startTime?: number; // Add startTime property
//       user?: JwtUser; // Add user property of type JwtUser
//     }
//   }
// }

declare module 'express' {
  export interface Request {
    user?: JwtUser;
  }
}
