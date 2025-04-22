import { Body, Controller, Post } from '@nestjs/common';
import { RegisterUserInput } from './dto/input/register-user.input';
import { UserService } from './service/users.service';
import Lang from '@constants/language';
import { MessageResponse } from './dto/response/message.response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async registerUser(
    @Body() registerUserInput: RegisterUserInput,
  ): Promise<MessageResponse> {
    await this.userService.registerUser(registerUserInput);

    return { message: Lang.USER_REGISTER_SUCCESS };
  }
}
