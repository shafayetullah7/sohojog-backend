import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {

//     const request = context.switchToHttp().getRequest();
//     console.log('****************************');

//     if (!request.headers['x-custom-header']) {
//       throw new UnauthorizedException('Missing custom header');
//     }

//     const result = (await super.canActivate(context)) as boolean;

//     if (result) {
//       // Example: You could do extra checks on the request here
//     }

//     return result;
//   }
}
