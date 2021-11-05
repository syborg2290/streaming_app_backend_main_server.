"use strict";

import bcrypt from "bcrypt";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../dto";

export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: UserPayload) => {
  return jwt.sign(payload, `${process.env.APP_SECRET}`, { expiresIn: "30d" });
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get("Authorization");
  const token = signature?.split(" ")[1];
  if (token) {
    const payload = (await jwt.verify(
      token,
      `${process.env.APP_SECRET}`
    )) as UserPayload;
    if (payload != null) {
      req.user = payload;
      return true;
    }
  }
  return false;
};
