// src/utils/excelGenerator.js

import ExcelJS from "exceljs";

const generateQuotationExcel = async (quotation, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Quotation");

    sheet.addRow(["Quotation No", quotation.quotationNumber]);
    sheet.addRow(["Date", new Date(quotation.quotationDate).toDateString()]);
    sheet.addRow([]);

    sheet.addRow(["Company", quotation.companyDetails.name]);
    sheet.addRow(["Customer", quotation.customerDetails.name]);
    sheet.addRow([]);

    sheet.addRow(["Description", "Qty", "Rate", "Amount"]);

    quotation.items.forEach(item => {
        sheet.addRow([
            item.description,
            item.quantity,
            item.rate,
            item.amount
        ]);
    });

    sheet.addRow([]);
    sheet.addRow(["Sub Total", quotation.subTotal]);
    sheet.addRow(["Grand Total", quotation.grandTotal]);

    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${quotation.quotationNumber}.xlsx`
    );
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
};

export default generateQuotationExcel;
