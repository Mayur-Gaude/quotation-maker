// src/validation/quotationValidator.js
import Joi from "joi";

const itemSchema = Joi.object({
    description: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().allow("", null),
    rate: Joi.number().min(0).required(),
    amount: Joi.number().min(0).required()
});

const quotationSchema = Joi.object({
    quotationDate: Joi.date().optional(),

    companyDetails: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().allow("", null),
        phone: Joi.string().allow("", null),
        email: Joi.string().email().allow("", null),
        gstNumber: Joi.string().allow("", null)
    }).required(),

    customerDetails: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().allow("", null),
        phone: Joi.string().allow("", null),
        email: Joi.string().email().allow("", null)
    }).required(),

    items: Joi.array().items(itemSchema).min(1).required(),

    subTotal: Joi.number().min(0).required(),

    tax: Joi.object({
        label: Joi.string().allow("", null),
        percentage: Joi.number().min(0),
        amount: Joi.number().min(0)
    }).optional(),

    discount: Joi.object({
        label: Joi.string().allow("", null),
        amount: Joi.number().min(0)
    }).optional(),

    grandTotal: Joi.number().min(0).required(),

    termsAndConditions: Joi.string().allow("", null),
    notes: Joi.string().allow("", null),

    status: Joi.string().valid("DRAFT", "FINAL").optional()
});

export default quotationSchema;
