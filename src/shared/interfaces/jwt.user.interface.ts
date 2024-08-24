import { JwtPayload } from './jwt.payload.interface';

export interface JwtUser extends JwtPayload {
  iat: number;
  exp: number;
}
