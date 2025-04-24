import { UserRepository } from './repository/users.repository';
import { UserService } from './service/users.service';

export const providers = [UserService, UserRepository];
