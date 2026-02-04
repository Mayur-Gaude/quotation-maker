// src/utils/generateQuotationNumber.js

const generateQuotationNumber = () => {
    const prefix = "QT";

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const datePart = `${year}${month}${day}`;

    // Random 4-digit number
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `${prefix}-${datePart}-${randomPart}`;
};

export default generateQuotationNumber;
