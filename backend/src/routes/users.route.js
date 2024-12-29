import { Router } from "express";
import { login, register } from "../controllers/userController.js";

const router = Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/get_all_activity")
router.route("/add_all_activity")


export default router