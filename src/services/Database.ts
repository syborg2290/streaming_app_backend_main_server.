"use strict";

import mongoose from "mongoose";

export default async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("Mongo db connection successful !");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
