import { userRoles } from '@constants/enum/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  @Prop({
    type: String,
    enum: userRoles,
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// remove password before converting to json
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});
