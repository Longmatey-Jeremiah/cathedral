import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

/** What the callback handler needs off the Google profile. */
export interface GoogleProfile {
  email: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      // Non-sensitive scopes only — no Google verification review needed.
      scope: ['openid', 'email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GoogleProfile {
    const email = profile.emails?.[0];
    // Accounts are matched by email, so an unverified one would let anyone
    // claiming an address sign in as that user.
    // The passport types say `verified` is a boolean but Google sends the
    // string "true"/"false" — normalize, and require an explicit yes so a
    // missing flag fails closed.
    if (!email?.value || String(email.verified) !== 'true') {
      throw new UnauthorizedException('Google account has no verified email');
    }
    return { email: email.value };
  }
}
