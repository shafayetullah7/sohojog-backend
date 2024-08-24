import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../interfaces/jwt.payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtilsService {
  constructor(private jwtService: JwtService) {}
  generateToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  verifyToken() {}
}
