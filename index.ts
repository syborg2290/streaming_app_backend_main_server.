"use strict";

import express, { Application } from "express";
import App from "./src/services/ExpressApp";
import dbConnection from "./src/services/Database";

const StartServer = async () => {
  require('dotenv').config();

  const app: Application = express();

  await dbConnection();

  await App(app);

  try {
    app.listen(process.env.PORT, (): void => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  } catch (error: any) {
    console.error(`Error occured: ${error.message}`);
  }
};

StartServer();
