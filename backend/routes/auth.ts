import express from "express";

import { Login, getCurrentUser, logout } from "../controllers/auth";
import { updateProfile } from "../controllers/profile";
import { isAuth } from "../middlewares/auth"

const router = express.Router();

router.route("/login").post(Login);
router.route("/logout").post(logout);
router.route("/profile").put(isAuth, updateProfile);

router.route("/me").get(isAuth, getCurrentUser);

export default router;