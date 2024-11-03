import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { EnvConfigService } from 'src/env-config/env.config.service';
import { CreateUserWithGoogleDto } from '../dto/google.auth.dto';
import { GoogleAuthPayload } from 'src/constants/interfaces/third-party-data/google.auth.payload';
import { GoogleAuthService } from '../services/google/google.auth.service';
import { JwtUser } from 'src/constants/interfaces/req-user/jwt.user';
import { Role } from 'src/constants/enums/user.roles';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: EnvConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {
    super({
      clientID: configService.googleClientId,
      clientSecret: configService.googleClientSecret,
      callbackURL: configService.googleCallbackUrl,
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleAuthPayload,
    done: VerifyCallback,
  ) {
    const { emails, id, name, displayName, photos } = profile;
    if (!emails.length) {
      throw new UnauthorizedException('Failed to get email');
    }
    const photo = photos[0];
    const { value: email, verified = false } = emails[0];
    if (!email) {
      throw new UnauthorizedException('Failed to get email');
    }
    const data: CreateUserWithGoogleDto = {
      email,
      name: displayName,
      googleId: id,
      googleEmailVerified: verified,
      hasPassword: false,
      verified: true,
    };
    // if (photo) data.profilePicture = photo.value;
    // console.log(profile);
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(data);

    const user = await this.googleAuthService.getUserWithGoogle(data);

    const passingData: JwtUser = {
      email: user.email,
      userId: user.id,
      verified: user.verified,
      roles: [Role.User],
      iat: 0,
      exp: 0,
    };

    done(null, passingData);
  }
}
