import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor() {}

  sayHi() {
    return 'Hi';
  }
}
