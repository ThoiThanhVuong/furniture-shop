import { Router } from "express";
import { momoIpnHandler } from "./momo.ipn.controller";

const router = Router();

// IPN từ MoMo
router.post("/ipn", momoIpnHandler);

export default router;
