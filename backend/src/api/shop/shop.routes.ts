import { Router } from "express";
import { getShopInfo } from "./shop.controller";

const router = Router();

// public route, không cần authenticate
router.get("/info", getShopInfo);

export default router;
