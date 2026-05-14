import SqlItem from "../models/SqlItem.js";

export const listSqlItemsByUser = async userId => {
    return SqlItem.find({ userId }).sort({ name: 1 }).lean();
};

export const createSqlItem = async (userId, data) => {
    return SqlItem.create({
        userId,
        name: data.name,
        defaultRate: data.defaultRate,
        unit: data.unit ?? ""
    });
};

export const updateSqlItem = async (id, userId, data) => {
    const doc = await SqlItem.findOne({ _id: id, userId });
    if (!doc) {
        const err = new Error("Item not found or access denied");
        err.statusCode = 404;
        throw err;
    }
    if (data.name !== undefined) doc.name = data.name;
    if (data.defaultRate !== undefined) doc.defaultRate = data.defaultRate;
    if (data.unit !== undefined) doc.unit = data.unit;
    await doc.save();
    return doc;
};

export const deleteSqlItem = async (id, userId) => {
    const doc = await SqlItem.findOne({ _id: id, userId });
    if (!doc) {
        const err = new Error("Item not found or access denied");
        err.statusCode = 404;
        throw err;
    }
    await doc.deleteOne();
};
