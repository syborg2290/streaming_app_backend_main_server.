"use strict";

import express, { Application } from "express";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { xss } from "express-xss-sanitizer";
import cookieParser from "cookie-parser";
import cors from "cors";

import { AuthenticationRoute, StreamRoutes } from "../routes";

import { generateStreamThumbnail } from "../utility";

var cron = require("node-cron");
const config = require("../config/stream_default");
const port = config.rtmp_server?.http.port;

export default async (app: Application) => {
  /* Rate limit for each ip address */
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
  });

  // var corsOptions = {
  //   origin: process.env.ALLOWED_HOST,
  //   optionsSuccessStatus: 200, // For legacy browser support
  //   credentials: true,
  // };

  const allowlist = [process.env.ALLOWED_HOST1];

  const corsOptionsDelegate = (req: any, callback: any) => {
    let corsOptions;

    let isDomainAllowed = allowlist.indexOf(req.header("Origin")) !== -1;

    if (isDomainAllowed) {
      // Enable CORS for this request
      corsOptions = { origin: true };
    } else {
      // Disable CORS for this request
      corsOptions = { origin: false };
    }
    callback(null, corsOptions);
  };

  app.use(cors(corsOptionsDelegate));

  // Body parsing Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());
  // Helmet middleware for http headers security middlware
  app.use(helmet());

  // Http parameters pollution security middlware
  app.use(hpp());

  //  apply to all requests
  app.use(limiter);

  app.use(xss());

  app.use("/auth", AuthenticationRoute);
  app.use("/streams", StreamRoutes);

  cron.schedule("*/5 * * * * *", () => {
    app.get(
      process.env.HOST + ":" + port + "/api/streams",
      function (error, response, body: any) {
        let streams = JSON.parse(body);
        if (typeof (streams["live"] !== undefined)) {
          let live_streams = streams["live"];
          for (let stream in live_streams) {
            if (!live_streams.hasOwnProperty(stream)) continue;
            generateStreamThumbnail(stream);
          }
        }
      }
    );
  });

  return app;
};
