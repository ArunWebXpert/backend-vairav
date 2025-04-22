import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserInput } from './dto/input/register-user.input';
import { UserService } from './service/users.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  registerUser(@Body() registerUserInput: RegisterUserInput) {
    this.userService.registerUser(registerUserInput);
  }
}
