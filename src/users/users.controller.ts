import Lang from '@constants/language';
import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserInput } from './dto/input/login-user.input';
import { MessageResponse } from './dto/response/message.response';
import { RegisterUserInput } from './dto/input/register-user.input';
import { UserService } from './service/users.service';
import { LoginResponse } from './dto/response/login.user.response';
import { Public } from 'src/decorators/public.decorator';

@Public()
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

  @Post('login')
  async loginUser(
    @Body() loginUserInput: LoginUserInput,
  ): Promise<LoginResponse> {
    const data = await this.userService.loginUser(loginUserInput);

    return { message: Lang.USER_LOGIN_SUCCESS, ...data };
  }
}
