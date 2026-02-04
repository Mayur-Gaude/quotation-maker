// src/services/quotationService.js

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
 * Get all quotations
 */
export const getAllQuotations = async (queryParams) => {
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;
    const search = queryParams.search || "";

    const searchFilter = search
        ? {
            $or: [
                { quotationNumber: { $regex: search, $options: "i" } },
                { "companyDetails.name": { $regex: search, $options: "i" } },
                { "customerDetails.name": { $regex: search, $options: "i" } }
            ]
        }
        : {};

    const [data, total] = await Promise.all([
        Quotation.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Quotation.countDocuments(searchFilter)
    ]);

    return {
        page,
        limit,
        total,
        data
    };
};

/**
 * Get quotation by ID
 */
export const getQuotationById = async (id) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    return quotation;
};

/**
 * Update quotation
 */
export const updateQuotation = async (id, updateData) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
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
export const deleteQuotation = async (id) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    if (quotation.status === "FINAL") {
        const err = new Error("Finalized quotations cannot be deleted");
        err.statusCode = 400;
        throw err;
    }

    await quotation.deleteOne();
};

// Finalize Quotation
export const finalizeQuotation = async (id) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    quotation.status = "FINAL";
    await quotation.save();

    return quotation;
};



// PDF generation
export const generateQuotationPDFService = async (id, res) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    generateQuotationPDF(quotation, res);
};



// Excel generation
export const generateQuotationExcelService = async (id, res) => {
    const quotation = await Quotation.findById(id);

    if (!quotation) {
        throw new Error("Quotation not found");
    }

    await generateQuotationExcel(quotation, res);
};
