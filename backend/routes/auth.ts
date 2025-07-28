import express from "express";

import { Login, getCurrentUser, logout } from "../controllers/auth";
import { isAuth } from "../middlewares/auth"

const router = express.Router();

router.route("/login").post(Login);
router.route("/logout").post(logout);

//Only authenticated users can hit this endpoint
router.route("/me").get(isAuth, getCurrentUser);

export default router;