import { UserDocument } from 'src/users/entities/users.entity';
import { MessageResponse } from './message.response';

export class TokenResponse {
  token: string;
  ttl: string;
}

export class LoginResponse extends MessageResponse {
  user: UserDocument;

  accessTokenAndExpiry: TokenResponse;

  refreshTokenAndExpiry: TokenResponse;
}
