"use strict";

import { Request, Response, NextFunction } from "express";
import ShortUniqueId from "short-unique-id";
import { User } from "../models";

export const AllStreamers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.query.streams) {
      let streams = JSON.parse(req.query.streams as string);
      let allStreamers = [];
      for (let stream in streams) {
        if (!streams.hasOwnProperty(stream)) {
          continue;
        } else {
          const streamerUser = await User.findOne({ stream_key: stream });
          allStreamers.push(streamerUser);
        }
      }
      return res.status(200).json(allStreamers);
    }
  } catch (error) {
    return res.status(400).json({ message: "Error with streamers request" });
  }
};

export const StreamKeyRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const streamerUser = await User.findOne({
      email: req.user?.email,
    });
    if (streamerUser != null) {
      return res.status(200).json({
        stream_key: streamerUser.stream_key,
      });
    }
  } catch (error) {
    return res.status(400).json({ message: "Error with stream key request" });
  }
};

export const StreamKeyUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const streamerUser = await User.findOne({
      email: req.user?.email,
    });
    if (streamerUser != null) {
      const uid = new ShortUniqueId({ length: 10 });
      const streamkey = uid() + streamerUser.username;
      User.findOneAndUpdate(
        {
          email: req.user?.email,
        },
        {
          stream_key: streamkey,
        },
        {
          upsert: true,
          new: true,
        },
        (err, user) => {
          if (!err) {
            res.status(200).json({
              stream_key: user.stream_key,
            });
          }
        }
      );
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error with update stream key request" });
  }
};
