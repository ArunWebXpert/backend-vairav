import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/users.entity';
import { UserController } from './users.controller';
import { providers } from './providers';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TokensModule,
  ],
  providers,
  controllers: [UserController],
})
export class UsersModule {}
