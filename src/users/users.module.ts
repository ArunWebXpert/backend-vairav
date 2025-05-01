import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensModule } from 'src/tokens/tokens.module';
import { User, UserSchema } from './entities/users.entity';
import { UserController } from './users.controller';
import { providers } from './providers';
import { UserService } from './service/users.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TokensModule,
  ],
  providers,
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
