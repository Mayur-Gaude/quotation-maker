import {
    listSqlItemsByUser,
    createSqlItem,
    updateSqlItem,
    deleteSqlItem
} from "../services/sqlItemService.js";
import {
    createSqlItemSchema,
    updateSqlItemSchema
} from "../validation/sqlItemValidator.js";

export const listSqlItemsController = async (req, res, next) => {
    try {
        const data = await listSqlItemsByUser(req.user.id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const createSqlItemController = async (req, res, next) => {
    try {
        const { error, value } = createSqlItemSchema.validate(req.body, {
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const doc = await createSqlItem(req.user.id, value);
        res.status(201).json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

export const updateSqlItemController = async (req, res, next) => {
    try {
        const { error, value } = updateSqlItemSchema.validate(req.body, {
            stripUnknown: true
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        const doc = await updateSqlItem(req.params.id, req.user.id, value);
        res.status(200).json({ success: true, data: doc });
    } catch (err) {
        next(err);
    }
};

export const deleteSqlItemController = async (req, res, next) => {
    try {
        await deleteSqlItem(req.params.id, req.user.id);
        res.status(200).json({
            success: true,
            message: "Saved item removed"
        });
    } catch (err) {
        next(err);
    }
};
