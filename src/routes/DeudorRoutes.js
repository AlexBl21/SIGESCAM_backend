import { Router } from "express";
const router = Router();
import DeudorController from "../controllers/DeudorController.js";


router.get("/", DeudorController.listarDeudores);

export default router;