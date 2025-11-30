import { Router } from "express";
import * as cartController from "./cart.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.put("/items/:itemId", cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/clear", cartController.clearCart);

export default router;
