"use strict";

import mongoose, { Schema, Document } from "mongoose";

interface UserDoc extends Document {
  firstname: string;
  lastname: string;
  profile_img_url: string;
  email: string;
  password: string;
  salt: string;
  username: string;
  stream_key: string;
}

const UserSchema = new Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    profile_img_url: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    username: { type: String, required: true },
    stream_key: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const User = mongoose.model<UserDoc>("user", UserSchema);

export { User };
