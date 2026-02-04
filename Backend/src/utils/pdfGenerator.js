// src/utils/pdfGenerator.js

import PDFDocument from "pdfkit";

const MARGIN = 50;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Table column widths (must sum to CONTENT_WIDTH or less)
const COL_NO = 22;
const COL_DESCRIPTION = 240;
const COL_QTY = 50;
const COL_RATE = 58;
const COL_AMOUNT = 68;
const TABLE_WIDTH = COL_NO + COL_DESCRIPTION + COL_QTY + COL_RATE + COL_AMOUNT;
const TABLE_LEFT = MARGIN + (CONTENT_WIDTH - TABLE_WIDTH) / 2;

const formatNumber = (n) =>
    Number(n) != null && !Number.isNaN(Number(n))
        ? Number(n).toFixed(2)
        : "0.00";

const generateQuotationPDF = (quotation, res) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${quotation.quotationNumber}.pdf`
    );

    doc.pipe(res);

    let y = MARGIN;

    // ===== TITLE =====
    doc.fontSize(22).font("Helvetica-Bold");
    doc.text("QUOTATION", 0, y, { align: "center", width: PAGE_WIDTH });
    y += 28;

    // ===== QUOTATION NO & DATE =====
    doc.fontSize(10).font("Helvetica");
    const metaLine = `Quotation No: ${quotation.quotationNumber}    Date: ${new Date(quotation.quotationDate).toLocaleDateString()}    Status: ${quotation.status || "DRAFT"}`;
    doc.text(metaLine, MARGIN, y, { width: CONTENT_WIDTH });
    y += 22;

    // ===== FROM (COMPANY) & TO (CUSTOMER) - two columns =====
    const colHalf = CONTENT_WIDTH / 2;
    const fromX = MARGIN;
    const toX = MARGIN + colHalf;

    const blockTop = y;
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("From", fromX, blockTop);
    doc.text("To", toX, blockTop);
    y = blockTop + 6;

    doc.fontSize(10).font("Helvetica");
    const companyName = quotation.companyDetails?.name ?? "—";
    const companyAddr = quotation.companyDetails?.address
        ? quotation.companyDetails.address
        : "";
    doc.text(companyName, fromX, y, { width: colHalf - 10 });
    let companyHeight = doc.heightOfString(companyName, { width: colHalf - 10 });
    if (companyAddr) {
        doc.text(companyAddr, fromX, y + companyHeight, { width: colHalf - 10 });
        companyHeight += doc.heightOfString(companyAddr, { width: colHalf - 10 });
    }

    const customerName = quotation.customerDetails?.name ?? "—";
    const customerAddr = quotation.customerDetails?.address || "";
    doc.text(customerName, toX, y, { width: colHalf - 10 });
    let customerHeight = doc.heightOfString(customerName, { width: colHalf - 10 });
    if (customerAddr) {
        doc.text(customerAddr, toX, y + customerHeight, { width: colHalf - 10 });
        customerHeight += doc.heightOfString(customerAddr, { width: colHalf - 10 });
    }

    y += Math.max(companyHeight, customerHeight) + 20;

    // ===== ITEMS TABLE =====
    const tableTop = y;
    const headerRowHeight = 22;
    const rowHeight = 20;

    // Table header background and text
    doc.rect(TABLE_LEFT, tableTop, TABLE_WIDTH, headerRowHeight).fill("#f1f5f9");
    doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(9);
    doc.text("#", TABLE_LEFT + 4, tableTop + 6, { width: COL_NO - 8 });
    doc.text("Description", TABLE_LEFT + COL_NO + 4, tableTop + 6, {
        width: COL_DESCRIPTION - 8
    });
    doc.text("Qty", TABLE_LEFT + COL_NO + COL_DESCRIPTION + 4, tableTop + 6, {
        width: COL_QTY - 8
    });
    doc.text("Rate", TABLE_LEFT + COL_NO + COL_DESCRIPTION + COL_QTY + 4, tableTop + 6, {
        width: COL_RATE - 8
    });
    doc.text("Amount", TABLE_LEFT + COL_NO + COL_DESCRIPTION + COL_QTY + COL_RATE + 4, tableTop + 6, {
        width: COL_AMOUNT - 8
    });
    doc.fillColor("#000000");
    y = tableTop + headerRowHeight;

    // Table border (header bottom + full table outline)
    doc.strokeColor("#cbd5e1").lineWidth(0.5);
    doc.rect(TABLE_LEFT, tableTop, TABLE_WIDTH, headerRowHeight).stroke();
    doc.font("Helvetica").fontSize(9);

    const items = quotation.items || [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const desc = item.description || "—";
        const descHeight = Math.max(
            rowHeight,
            doc.heightOfString(desc, { width: COL_DESCRIPTION - 8 }) + 10
        );

        // Row border
        doc.rect(TABLE_LEFT, y, TABLE_WIDTH, descHeight).stroke();
        doc.text(String(i + 1), TABLE_LEFT + 4, y + 5, { width: COL_NO - 8 });
        doc.text(desc, TABLE_LEFT + COL_NO + 4, y + 5, {
            width: COL_DESCRIPTION - 8
        });
        doc.text(String(item.quantity ?? ""), TABLE_LEFT + COL_NO + COL_DESCRIPTION + 4, y + 5, {
            width: COL_QTY - 8,
            align: "right"
        });
        doc.text(formatNumber(item.rate), TABLE_LEFT + COL_NO + COL_DESCRIPTION + COL_QTY + 4, y + 5, {
            width: COL_RATE - 8,
            align: "right"
        });
        doc.text(formatNumber(item.amount), TABLE_LEFT + COL_NO + COL_DESCRIPTION + COL_QTY + COL_RATE + 4, y + 5, {
            width: COL_AMOUNT - 8,
            align: "right"
        });
        y += descHeight;
    }

    // Close table bottom
    doc.rect(TABLE_LEFT, tableTop, TABLE_WIDTH, y - tableTop).stroke();
    y += 18;

    // ===== TOTALS (below table) =====
    const totalsLeft = TABLE_LEFT + TABLE_WIDTH - 180;
    const totalsWidth = 180;

    doc.font("Helvetica").fontSize(10);
    doc.text("Sub Total:", totalsLeft, y, { width: 100 });
    doc.text(formatNumber(quotation.subTotal), totalsLeft + 100, y, {
        width: 80,
        align: "right"
    });
    y += 16;

    if (quotation.tax?.amount != null && Number(quotation.tax.amount) !== 0) {
        doc.text(`Tax:`, totalsLeft, y, { width: 100 });
        doc.text(formatNumber(quotation.tax.amount), totalsLeft + 100, y, {
            width: 80,
            align: "right"
        });
        y += 16;
    }

    if (quotation.discount?.amount != null && Number(quotation.discount.amount) !== 0) {
        doc.text("Discount:", totalsLeft, y, { width: 100 });
        doc.text(`-${formatNumber(quotation.discount.amount)}`, totalsLeft + 100, y, {
            width: 80,
            align: "right"
        });
        y += 16;
    }

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Grand Total:", totalsLeft, y, { width: 100 });
    doc.text(formatNumber(quotation.grandTotal), totalsLeft + 100, y, {
        width: 80,
        align: "right"
    });
    y += 28;

    // ===== TERMS =====
    if (quotation.termsAndConditions) {
        doc.font("Helvetica-Bold").fontSize(10);
        doc.text("Terms & Conditions", MARGIN, y);
        y += 14;
        doc.font("Helvetica").fontSize(9);
        doc.text(quotation.termsAndConditions, MARGIN, y, {
            width: CONTENT_WIDTH
        });
        y += doc.heightOfString(quotation.termsAndConditions, {
            width: CONTENT_WIDTH
        }) + 16;
    }

    // ===== FOOTER =====
    doc.font("Helvetica").fontSize(10);
    doc.text("Thank you for your business!", 0, y + 10, {
        align: "center",
        width: PAGE_WIDTH
    });

    doc.end();
};

export default generateQuotationPDF;
