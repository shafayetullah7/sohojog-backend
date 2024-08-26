import { JwtPayload } from '../jwt.payload';

export interface JwtUser extends JwtPayload {
  iat: number;
  exp: number;
}
