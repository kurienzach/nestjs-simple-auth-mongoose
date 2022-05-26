import { SimpleAuthMongooseModule } from "./user.module";
import { UserService } from "./user.service";
import { User, UserDocument, SanitizedUser } from "./user.schema";
import { IUserService, ProviderOptions } from "nestjs-simple-auth";

const UserServiceProvider: ProviderOptions<IUserService<any>> = {
  imports: [SimpleAuthMongooseModule],
  useExisting: UserService,
};

export {
  SimpleAuthMongooseModule,
  UserService,
  User,
  UserDocument,
  SanitizedUser,
  UserServiceProvider,
};
