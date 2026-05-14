import Joi from "joi";

export const createSqlItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(500).required(),
    defaultRate: Joi.number().min(0).required(),
    unit: Joi.string().trim().max(50).allow("", null)
});

export const updateSqlItemSchema = Joi.object({
    name: Joi.string().trim().min(1).max(500),
    defaultRate: Joi.number().min(0),
    unit: Joi.string().trim().max(50).allow("", null)
}).min(1);
