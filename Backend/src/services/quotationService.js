// src/services/quotationService.js

import mongoose from "mongoose";
import Quotation from "../models/Quotation.js";
import generateQuotationNumber from "../utils/generateQuotationNumber.js";

import generateQuotationPDF from "../utils/pdfGenerator.js";
import generateQuotationExcel from "../utils/excelGenerator.js";
/**
 * Create a new quotation
 */
export const createQuotation = async (quotationData) => {
    const quotationNumber = generateQuotationNumber();

    const quotation = await Quotation.create({
        ...quotationData,
        quotationNumber
    });

    return quotation;
};

/**
 * Get all quotations (service)
 */
export const getAllQuotations = async ({ userId, page, limit, search, status }) => {
    const currentPage = parseInt(page) || 1;
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;
    const keyword = search || "";


    const searchFilter = keyword
        ? {
            $or: [
                { quotationNumber: { $regex: keyword, $options: "i" } },
                { "companyDetails.name": { $regex: keyword, $options: "i" } },
                { "customerDetails.name": { $regex: keyword, $options: "i" } }
            ]
        }
        : {};

    const finalFilter = {
        userId,
        ...(status && { status }),
        ...searchFilter
    };

    const [data, total] = await Promise.all([
        Quotation.find(finalFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage),
        Quotation.countDocuments(finalFilter)
    ]);

    return {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        data
    };
};

/**
 * Dashboard aggregates for the authenticated user.
 */
export const getQuotationDashboardStats = async userId => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { totalQuotes: 0, totalValue: 0, draftsPending: 0 };
    }
    const uid = new mongoose.Types.ObjectId(userId);
    const [row] = await Quotation.aggregate([
        { $match: { userId: uid } },
        {
            $group: {
                _id: null,
                totalQuotes: { $sum: 1 },
                totalValue: {
                    $sum: { $toDouble: { $ifNull: ["$grandTotal", 0] } }
                },
                draftsPending: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0]
                    }
                }
            }
        }
    ]);

    if (!row) {
        return { totalQuotes: 0, totalValue: 0, draftsPending: 0 };
    }

    return {
        totalQuotes: row.totalQuotes,
        totalValue: row.totalValue,
        draftsPending: row.draftsPending
    };
};

/**
 * Mark a draft quotation as sent (DRAFT → SENT).
 */
export const markQuotationSent = async (id, userId) => {
    const quotation = await Quotation.findOne({ _id: id, userId });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    if (quotation.status !== "DRAFT") {
        const err = new Error("Only drafts can be marked as sent");
        err.statusCode = 400;
        throw err;
    }

    quotation.status = "SENT";
    await quotation.save();
    return quotation;
};

/**
 * Get quotation by ID
 */
export const getQuotationById = async (id, userId) => {
    const quotation = await Quotation.findOne({ _id: id, userId });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    return quotation;
};

/**
 * Copy an existing quotation into a new DRAFT with a fresh quotation number and date.
 */
export const duplicateQuotation = async (id, userId) => {
    const source = await getQuotationById(id, userId);
    const plain = source.toObject();
    const quotationNumber = generateQuotationNumber();

    return Quotation.create({
        quotationNumber,
        quotationDate: new Date(),
        companyDetails: plain.companyDetails,
        customerDetails: plain.customerDetails,
        items: plain.items,
        subTotal: plain.subTotal,
        tax: plain.tax,
        discount: plain.discount,
        grandTotal: plain.grandTotal,
        termsAndConditions: plain.termsAndConditions,
        notes: plain.notes,
        status: "DRAFT",
        userId
    });
};

/**
 * Update quotation
 */
export const updateQuotation = async (id, userId, updateData) => {
    const quotation = await Quotation.findOne({
        _id: id,
        userId
    });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    if (quotation.status === "FINAL") {
        const err = new Error("Finalized quotations cannot be edited");
        err.statusCode = 400;
        throw err;
    }

    Object.assign(quotation, updateData);
    await quotation.save();

    return quotation;
};

/**
 * Delete quotation
 */
export const deleteQuotation = async (id, userId) => {
    const quotation = await Quotation.findOne({
        _id: id,
        userId
    });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    // if (quotation.status === "FINAL") {
    //     const err = new Error("Finalized quotations cannot be deleted");
    //     err.statusCode = 400;
    //     throw err;
    // }

    await quotation.deleteOne();
};

// Finalize Quotation (DRAFT or SENT → FINAL, scoped to owner)
export const finalizeQuotation = async (id, userId) => {
    const quotation = await Quotation.findOne({ _id: id, userId });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    if (quotation.status === "FINAL") {
        const err = new Error("Quotation is already finalized");
        err.statusCode = 400;
        throw err;
    }

    quotation.status = "FINAL";
    await quotation.save();

    return quotation;
};



// PDF generation (owner only)
export const generateQuotationPDFService = async (id, userId, res, query = {}) => {
    const quotation = await Quotation.findOne({ _id: id, userId });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    const currencySymbol =
        typeof query.currency === "string" && query.currency.trim()
            ? decodeURIComponent(query.currency.trim()).slice(0, 5)
            : "₹";

    generateQuotationPDF(quotation, res, { currencySymbol });
};



// Excel generation (owner only)
export const generateQuotationExcelService = async (id, userId, res) => {
    const quotation = await Quotation.findOne({ _id: id, userId });

    if (!quotation) {
        const err = new Error("Quotation not found or access denied");
        err.statusCode = 404;
        throw err;
    }

    await generateQuotationExcel(quotation, res);
};
