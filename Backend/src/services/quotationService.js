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
