import { Controller, Get } from '@nestjs/common';
import { UserService } from './service/users.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser(): string {
    return this.userService.sayHi();
  }
}
