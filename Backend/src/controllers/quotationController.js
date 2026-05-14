// src/controllers/quotationController.js

import quotationSchema from "../validation/quotationValidator.js";
import {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    updateQuotation,
    deleteQuotation,
    duplicateQuotation,
    getQuotationDashboardStats,
    markQuotationSent,
    generateQuotationPDFService,
    generateQuotationExcelService,
    finalizeQuotation
} from "../services/quotationService.js";
/**
 * Dashboard summary (counts & totals)
 */
export const getQuotationDashboardStatsController = async (req, res, next) => {
    try {
        const data = await getQuotationDashboardStats(req.user.id);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Create quotation
 */
export const createQuotationController = async (req, res, next) => {
    try {
        const { error } = quotationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const quotation = await createQuotation({
            ...req.body,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Duplicate quotation (new draft, new number)
 */
export const duplicateQuotationController = async (req, res, next) => {
    try {
        const quotation = await duplicateQuotation(
            req.params.id,
            req.user.id
        );

        res.status(201).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all quotations
 */
export const getAllQuotationsController = async (req, res, next) => {
    try {
        const result = await getAllQuotations({
            userId: req.user.id,
            page: req.query.page,
            limit: req.query.limit,
            search: req.query.search,
            status: req.query.status
        });

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};


/**
 * Get quotation by ID
 */
export const getQuotationByIdController = async (req, res, next) => {
    try {
        const quotation = await getQuotationById(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update quotation
 */
export const updateQuotationController = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        delete payload.status;

        const { error } = quotationSchema.validate(payload);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const quotation = await updateQuotation(
            req.params.id,
            req.user.id,
            payload
        );

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete quotation
 */
export const deleteQuotationController = async (req, res, next) => {
    try {
        await deleteQuotation(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            message: "Quotation deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// Download PDF
export const downloadQuotationPDFController = async (req, res, next) => {
    try {
        await generateQuotationPDFService(
            req.params.id,
            req.user.id,
            res,
            req.query
        );
    } catch (error) {
        next(error);
    }
};

// Download Excel
export const downloadQuotationExcelController = async (req, res, next) => {
    try {
        await generateQuotationExcelService(req.params.id, req.user.id, res);
    } catch (error) {
        next(error);
    }
};

//Finalize Quotation
export const finalizeQuotationController = async (req, res, next) => {
    try {
        const quotation = await finalizeQuotation(
            req.params.id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Quotation finalized successfully",
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};

export const markQuotationSentController = async (req, res, next) => {
    try {
        const quotation = await markQuotationSent(req.params.id, req.user.id);
        res.status(200).json({
            success: true,
            message: "Marked as sent",
            data: quotation
        });
    } catch (error) {
        next(error);
    }
};
