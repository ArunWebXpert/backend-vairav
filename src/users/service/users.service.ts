import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import Lang from '@constants/language';
import { LoginUserInput } from '../dto/input/login-user.input';
import { RegisterUserInput } from '../dto/input/register-user.input';
import { TokenService } from 'src/tokens/tokens.service';
import { UserDocument } from '../entities/users.entity';
import { UserRepository } from '../repository/users.repository';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  // register user
  async registerUser(registerUserInput: RegisterUserInput) {
    const userExists = await this.userRepository.findOne({
      email: registerUserInput.email,
    });

    if (userExists) {
      throw new ConflictException(Lang.USER_ALREADY_EXISTS);
    }

    // hash password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      registerUserInput.password,
      saltRounds,
    );

    return await this.userRepository.createDocument({
      ...registerUserInput,
      password: hashedPassword,
    });
  }

  // login user
  async loginUser({ email, password }: LoginUserInput) {
    const user: UserDocument = await this.userRepository.findOne({
      email,
    });

    if (!user) {
      throw new NotFoundException(Lang.INVALID_CREDENTIALS);
    }

    // check if password matches
    const hashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw new NotFoundException(Lang.INVALID_CREDENTIALS);
    }

    // generate token
    const payload = { sub: String(user._id) };

    const accessTokenAndExpiry = this.tokenService.generateAccessToken(payload);

    const refreshTokenAndExpiry =
      this.tokenService.generateRefreshToken(payload);

    return {
      accessTokenAndExpiry,
      refreshTokenAndExpiry,
      user,
    };
  }

  async countUsers(): Promise<number> {
    const usersCount = await this.userRepository.countDocuments();

    return usersCount as number;
  }

  async findUserById(id: string): Promise<UserDocument> {
    return (await this.userRepository.findById(id)) as UserDocument;
  }
}
