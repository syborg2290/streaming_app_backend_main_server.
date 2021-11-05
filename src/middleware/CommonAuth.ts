import { Request, NextFunction, Response } from "express";
import { ValidateSignature } from "../utility";

export const Authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = await ValidateSignature(req);
    if (signature) {
      return next();
    } else {
      return res.status(401).json({ message: "Unauthorised access" });
    }
  } catch (error) {
    console.log(error);
  }
};
