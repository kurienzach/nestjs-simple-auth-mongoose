import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({
  collection: "users",
  timestamps: true,
})
class User {
  _id: Types.ObjectId;
  id: string;

  @Prop({ unique: true, sparse: true, required: false })
  username?: string;

  @Prop()
  password?: string;

  @Prop()
  mobile?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  email?: string;

  @Prop()
  lastLogin?: Date;
}

type UserDocument = User & Document;
const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ mobile: 1, username: 1 }, { unique: true, sparse: true });

type SanitizedUser = Exclude<User, "password">;

export { User, UserSchema, UserDocument, SanitizedUser };
