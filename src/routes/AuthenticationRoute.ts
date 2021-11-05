"use strict";

import express from "express";
import { Authenticate } from "../middleware";
import {
  UserSignUp,
  UserLogin,
  VerifyAuthentication,
  UploadProfileImgUrl,
} from "../controllers";

const router = express.Router();

/* Routes for authentications */

router.post("/register", UserSignUp);
router.post("/upload_profile_img_url", UploadProfileImgUrl);
router.post("/login", UserLogin);
router.post("/verifyAuthentication", VerifyAuthentication);

/* ------------------- Authentication --------------------- */
router.use(Authenticate);
/* ------------------- Check authorization below routes from here --------------------- */

export { router as AuthenticationRoute };
