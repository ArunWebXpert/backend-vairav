import { Injectable } from '@nestjs/common';
import { RegisterUserInput } from '../dto/input/register-user.input';

@Injectable()
export class UserService {
  constructor() {}

  registerUser(registerUserInput: RegisterUserInput) {
    console.log(registerUserInput);
  }
}
