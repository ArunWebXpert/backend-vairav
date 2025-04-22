import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  })
  lastName: number;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    unique: true, //should be unique field
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
