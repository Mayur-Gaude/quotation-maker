// src/models/Quotation.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
    },
    { _id: false }
);

const quotationSchema = new mongoose.Schema(
    {
        quotationNumber: { type: String, required: true, unique: true },

        quotationDate: { type: Date, default: Date.now },

        companyDetails: {
            name: { type: String, required: true },
            address: String,
            phone: String,
            email: String,
            gstNumber: String
        },

        customerDetails: {
            name: { type: String, required: true },
            address: String,
            phone: String,
            email: String
        },

        items: {
            type: [itemSchema],
            validate: [arr => arr.length > 0, "At least one item is required"]
        },

        subTotal: { type: Number, required: true },

        tax: {
            label: String,
            percentage: Number,
            amount: Number
        },

        discount: {
            label: String,
            amount: Number
        },

        grandTotal: { type: Number, required: true },

        termsAndConditions: String,
        notes: String,

        status: {
            type: String,
            enum: ["DRAFT", "FINAL"],
            default: "DRAFT"
        },

        // Future use (auth)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Quotation", quotationSchema);
