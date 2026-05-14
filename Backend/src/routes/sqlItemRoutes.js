import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
    listSqlItemsController,
    createSqlItemController,
    updateSqlItemController,
    deleteSqlItemController
} from "../controllers/sqlItemController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listSqlItemsController);
router.post("/", createSqlItemController);
router.put("/:id", updateSqlItemController);
router.delete("/:id", deleteSqlItemController);

export default router;
