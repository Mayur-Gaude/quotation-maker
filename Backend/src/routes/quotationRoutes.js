// src/routes/quotationRoutes.js

import express from "express";
import {
    createQuotationController,
    getAllQuotationsController,
    getQuotationByIdController,
    updateQuotationController,
    deleteQuotationController,
    downloadQuotationPDFController,
    downloadQuotationExcelController,
    finalizeQuotationController
} from "../controllers/quotationController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createQuotationController);
router.get("/", getAllQuotationsController);
router.get("/:id", getQuotationByIdController);
router.put("/:id", updateQuotationController);
router.delete("/:id", deleteQuotationController);
router.get("/:id/pdf", downloadQuotationPDFController);
router.get("/:id/excel", downloadQuotationExcelController);
router.patch("/:id/finalize", finalizeQuotationController);


export default router;
