import { Router } from "express";
import { login } from "../controllers/LoginController.js";

const router = Router();
router.post("/inicio-sesion", login);

export default router;