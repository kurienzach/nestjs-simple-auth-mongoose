import { Injectable } from "@nestjs/common";
import { SanitizedUser, User, UserDocument } from "./user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { compare, hash } from "bcrypt";
import { IUserService, UserCreateDTO } from "nestjs-simple-auth";

/** *************************************************
 * EXCEPTIONS
 ****************************************************/

class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
  }
}

class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid Credentials");
  }
}

/** *************************************************
 * SERVICE
 ****************************************************/

/**
 * Sanitize user object
 * - Removed password field
 * @param user
 * @returns user object without password property set as undefined
 */
function sanitizeUser<T>(user: T): Exclude<T, "password"> {
  // eslint-disable-next-line no-param-reassign
  if ((user as any)?.password) (user as any).password = undefined;
  return user as any;
}

interface JwtPayload {
  sub: string;
  username?: string;
  mobile?: string;
}

@Injectable()
export class UserService implements IUserService<SanitizedUser> {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  /**
   * Returns the User after validating the username and password
   * @param userDTO
   * @returns User
   */
  async findByUsernamePassword(
    username: string,
    password: string
  ): Promise<SanitizedUser> {
    const user = await this.UserModel.findOne({ username });

    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordMatches = await compare(password, user.password);
    if (!isPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    const data = sanitizeUser(user);
    return data;
  }

  /**
   * Create a new User
   * @param userData
   * @returns
   */
  async createUser(userData: UserCreateDTO): Promise<SanitizedUser> {
    // Validate data : We should atleast have (username, password) or (mobile no)
    let isValid = false;
    if (!!userData.password && !!userData.password) {
      // CHeck if username already exists
      const existingUser = await this.UserModel.findOne({
        username: userData.username,
      });
      if (existingUser === null) isValid = true;
    } else if (!!userData.mobile) {
      // Check if mobile number exists
      const existingUser = await this.UserModel.findOne({
        mobile: userData.mobile,
      });
      if (existingUser === null) isValid = true;
    }

    if (!isValid) {
      throw new Error(
        "User should atleast contain valid username, passwrod or mobile number"
      );
    }

    // Hash password
    const password = await hash(userData.password, 10);

    const user = new this.UserModel({
      username: userData.username,
      password,
      mobile: userData.mobile,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    });

    await user.save();

    return sanitizeUser(user);
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId);
    return sanitizeUser(user);
  }

  getJwtTokenPayload(user: User): JwtPayload {
    return {
      sub: user.id,
      username: user.username,
      mobile: user.mobile,
    };
  }

  async validateJwtPayload(payload: JwtPayload) {
    return this.findUserById(payload.sub);
  }
}
