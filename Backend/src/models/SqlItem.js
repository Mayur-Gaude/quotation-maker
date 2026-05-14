import mongoose from "mongoose";

/**
 * User-scoped catalog rows (logical equivalent of sqlitems table).
 * Stored in MongoDB collection "sqlitems".
 */
const sqlItemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        name: { type: String, required: true, trim: true },
        defaultRate: { type: Number, required: true, min: 0 },
        unit: { type: String, trim: true, default: "" }
    },
    { timestamps: true, collection: "sqlitems" }
);

export default mongoose.model("SqlItem", sqlItemSchema);
