import Lang from '@constants/language';
import { ConfigService } from '@nestjs/config';
import { IPayload } from './interface/payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(payload: IPayload) {
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      ttl: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    };
  }

  generateRefreshToken(payload: IPayload) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return {
      refreshToken,
      ttl: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    };
  }

  validateRefreshToken(refreshToken: string): string {
    try {
      const { sub }: { sub: string } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });

      return sub;
    } catch {
      throw new UnauthorizedException(Lang.INVALID_SIGNATURE);
    }
  }
}
