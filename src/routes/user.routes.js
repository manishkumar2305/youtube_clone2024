import { Router } from "express";
import { reigsterUser } from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(reigsterUser);

export default router;
