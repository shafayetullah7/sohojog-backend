// src/@types/express.d.ts

import * as express from 'express';
import { JwtPayload } from 'src/constants/interfaces/jwt.payload';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';

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
    startTime?: number;
  }
}
