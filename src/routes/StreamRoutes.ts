"use strict";

import express from "express";
import { Authenticate } from "../middleware";
import {
  AllStreamers,
  StreamKeyRequest,
  StreamKeyUpdate,
} from "../controllers";

const router = express.Router();

/* ------------------- Authentication --------------------- */
router.use(Authenticate);

router.get("/all_streams", AllStreamers);
router.get("/stream_key", StreamKeyRequest);
router.post("/stream_key_update", StreamKeyUpdate);

export { router as StreamRoutes };
