import MSG from 'src/constants/validation.message';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserInput {
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsEmail({}, { message: MSG.PROPERTY_MUST_BE_EMAIL })
  @IsString()
  email: string;

  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsString()
  password: string;
}
