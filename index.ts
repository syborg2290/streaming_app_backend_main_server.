"use strict";

import express, { Application } from "express";
import App from "./src/services/ExpressApp";
import dbConnection from "./src/services/Database";

const StartServer = async () => {
  require("dotenv").config();

  await dbConnection();

  const app1: Application = express();
  await App(app1);

  const app2: Application = express();
  await App(app2);

  try {
    app1.listen(process.env.PORT1, (): void => {
      console.log(`Application Server Listening On Port ${process.env.PORT1}`);
    });
  } catch (error: any) {
    console.error(`Error occured: ${error.message}`);
  }

  try {
    app2.listen(process.env.PORT2, (): void => {
      console.log(`Application Server Listening On Port ${process.env.PORT2}`);
    });
  } catch (error: any) {
    console.error(`Error occured: ${error.message}`);
  }
};

StartServer();
