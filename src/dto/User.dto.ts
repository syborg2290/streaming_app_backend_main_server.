"use strict";

import { IsEmail, Length } from "class-validator";

export class UserRegisterInput {
  firstname: string;

  lastname: string;

  profile_img_url: string;

  @IsEmail()
  email: string;

  @Length(2, 100)
  username: string;

  @Length(6, 20)
  password: string;
}

export class UserLoginInput {
  username: string;

  password: string;
}

export interface UserPayload {
  _id: string;
  username: string;
}
