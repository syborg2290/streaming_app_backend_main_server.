"use strict";

import { plainToClass } from "class-transformer";
import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import ShortUniqueId from "short-unique-id";
import { User } from "../models";
import { UserRegisterInput, UserLoginInput } from "../dto";
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { UserPayload } from "../dto";
import jwt from "jsonwebtoken";
import { s3, S3_BUCKET } from "../services/Aws";
const uuid = require("uuid");

export const UserSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInputs = plainToClass(UserRegisterInput, req.body);

    const validationError = await validate(userInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(500).json(validationError);
    }

    const { firstname, lastname, profile_img_url, email, password, username } =
      userInputs;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingEmail = await User.find({ email: email });
    const existingUsername = await User.find({ username: username });

    if (existingEmail.length > 0) {
      return res.json({ message: "Email already used!" });
    }

    if (existingUsername.length > 0) {
      return res.json({ message: "Username already used!" });
    }

    const uid = new ShortUniqueId({ length: 10 });
    const streamkey = uid() + username;
    const result = await User.create({
      firstname: firstname,
      lastname: lastname,
      profile_img_url: profile_img_url,
      email: email,
      password: userPassword,
      salt: salt,
      username: username,
      stream_key: streamkey,
    });

    if (result) {
      //Generate the Signature
      const signature = await GenerateSignature({
        _id: result._id,
        username: result.username,
      });
      // Send the result
      return res.json({
        message: "success",
        result: {
          signature: signature,
          username: result.username,
        },
      });
    }

    return res.status(500).json({ message: "Error while creating user" });
  } catch (error) {
    return res.status(500).json({ message: "Error while creating user" });
  }
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userInputs = plainToClass(UserLoginInput, req.body);

    const validationError = await validate(userInputs, {
      validationError: { target: true },
    });

    if (validationError.length > 0) {
      return res.status(500).json(validationError);
    }

    const { username, password } = userInputs;
    const user = await User.findOne({ username: username });
    if (user) {
      const validation = await ValidatePassword(
        password,
        user.password,
        user.salt
      );

      if (validation) {
        const signature = await GenerateSignature({
          _id: user._id,
          username: user.username,
        });

        return res.status(200).json({
          signature: signature,
          username: user.username,
        });
      } else {
        return res.json({
          message: "Entered password didn't match with this username",
        });
      }
    } else {
      return res.json({ message: "Any user didn't find with this username" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error With Signin process" });
  }
};

export const VerifyAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.get("Authorization");
    const token = signature?.split(" ")[1];

    if (token) {
      const payload = (await jwt.verify(
        token,
        `${process.env.APP_SECRET}`
      )) as UserPayload;
      if (payload !== null) {
        req.user = payload;
        return res.status(200).json({ message: "Authorized" });
      }
    }
    return res.status(401).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error with Verifying Authentication" });
  }
};

export const UploadProfileImgUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let fileType = req.body.fileType;
    if (fileType != ".jpg" && fileType != ".png" && fileType != ".jpeg") {
      return res.json({ message: "Image format invalid" });
    }

    fileType = fileType.substring(1, fileType.length);

    const fileName = uuid.v4();
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName + "." + fileType,
      Expires: 60 * 60,
      ContentType: "image/" + fileType,
      ACL: "public-read",
    };

    s3.getSignedUrl("putObject", s3Params, (err: any, data: any) => {
      if (err) {
        console.log(err);
        return res.end();
      }
      const returnData = {
        success: true,
        message: "Url generated",
        uploadUrl: data,
        downloadUrl:
          `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}` + "." + fileType,
      };
      return res.status(200).json({ message: "success", result: returnData });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error with Generating Profile Image Url" });
  }
};
