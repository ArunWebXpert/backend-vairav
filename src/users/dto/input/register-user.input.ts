import MSG from 'src/constants/validation.message';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { userRoles } from '@constants/enum/role.enum';

export class RegisterUserInput {
  @MaxLength(255, { message: MSG.PROPERTY_MAX_LENGTH })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsString()
  firstName: string;

  @MaxLength(255, { message: MSG.PROPERTY_MAX_LENGTH })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsString()
  lastName: string;

  @MaxLength(255, { message: MSG.PROPERTY_MAX_LENGTH })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsEmail({}, { message: MSG.PROPERTY_MUST_BE_EMAIL })
  @IsString()
  email: string;

  @MaxLength(30, { message: MSG.PROPERTY_MAX_LENGTH })
  @IsNotEmpty({ message: MSG.PROPERTY_REQUIRED })
  @IsString()
  password: string;

  @IsEnum(userRoles, { message: MSG.ROLES_ENUM_REQUIRED })
  @IsString()
  role: string;
}
