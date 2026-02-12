// src/utils/pdfGenerator.js
import PDFDocument from "pdfkit";

const MARGIN = 50;

const formatNumber = (n) =>
    Number(n) != null && !Number.isNaN(Number(n))
        ? Number(n).toFixed(2)
        : "0.00";

const generateQuotationPDF = (quotation, res) => {
    const doc = new PDFDocument({
        margin: MARGIN,
        size: "A4",
        bufferPages: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${quotation.quotationNumber}.pdf`
    );

    doc.pipe(res);

    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;
    const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

    let y = MARGIN;

    // =========================
    // HEADER (CENTERED)
    // =========================

    doc.font("Helvetica-Bold").fontSize(20);
    doc.text("QUOTATION", MARGIN, y, {
        width: CONTENT_WIDTH,
        align: "center"
    });

    y += 30;

    doc.font("Helvetica").fontSize(11);

    doc.text(`Quotation No: ${quotation.quotationNumber}`, {
        align: "center"
    });

    doc.moveDown(0.5);

    doc.text(
        `Date: ${new Date(quotation.quotationDate).toLocaleDateString()}`,
        { align: "center" }
    );

    doc.moveDown(0.5);

    doc.text(`By: ${quotation.companyDetails?.name || "—"}`, {
        align: "center"
    });

    y = doc.y + 25;

    // =========================
    // TABLE CONFIG
    // =========================

    const rowPadding = 6;
    const minRowHeight = 22;

    const col = {
        no: 40,
        desc: 230,
        qty: 60,
        rate: 90,
        amount: 100
    };

    const tableLeft = MARGIN;
    const tableWidth =
        col.no + col.desc + col.qty + col.rate + col.amount;

    const drawRowBorders = (rowY, rowHeight) => {
        doc.rect(tableLeft, rowY, tableWidth, rowHeight).stroke();

        // Vertical lines
        let x = tableLeft;
        Object.values(col).forEach(width => {
            x += width;
            doc.moveTo(x, rowY)
                .lineTo(x, rowY + rowHeight)
                .stroke();
        });
    };

    const drawTableHeader = () => {
        const rowHeight = minRowHeight;

        doc.font("Helvetica-Bold").fontSize(10);

        // Header background
        doc.rect(tableLeft, y, tableWidth, rowHeight)
            .fillAndStroke("#f3f4f6", "#000000");

        doc.fillColor("#000");

        doc.text("Sr.", tableLeft + 5, y + rowPadding, {
            width: col.no - 10
        });

        doc.text("Description", tableLeft + col.no + 5, y + rowPadding, {
            width: col.desc - 10
        });

        doc.text("Qty", tableLeft + col.no + col.desc + 5, y + rowPadding, {
            width: col.qty - 10,
            align: "right"
        });

        doc.text(
            "Rate",
            tableLeft + col.no + col.desc + col.qty + 5,
            y + rowPadding,
            { width: col.rate - 10, align: "right" }
        );

        doc.text(
            "Amount",
            tableLeft +
            col.no +
            col.desc +
            col.qty +
            col.rate +
            5,
            y + rowPadding,
            { width: col.amount - 10, align: "right" }
        );

        drawRowBorders(y, rowHeight);

        y += rowHeight;

        doc.font("Helvetica").fontSize(10);
    };

    const checkPageBreak = neededHeight => {
        if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
            drawTableHeader();
        }
    };

    // Draw first header
    drawTableHeader();

    // =========================
    // TABLE ROWS
    // =========================

    const items = quotation.items || [];

    items.forEach((item, index) => {
        const descHeight = doc.heightOfString(
            item.description || "—",
            { width: col.desc - 10 }
        );

        const rowHeight = Math.max(
            minRowHeight,
            descHeight + rowPadding * 2
        );

        checkPageBreak(rowHeight);

        // Draw borders first
        drawRowBorders(y, rowHeight);

        // Sr
        doc.text(String(index + 1),
            tableLeft + 5,
            y + rowPadding,
            { width: col.no - 10 }
        );

        // Description
        doc.text(item.description || "—",
            tableLeft + col.no + 5,
            y + rowPadding,
            { width: col.desc - 10 }
        );

        // Qty
        doc.text(String(item.quantity ?? ""),
            tableLeft + col.no + col.desc + 5,
            y + rowPadding,
            { width: col.qty - 10, align: "right" }
        );

        // Rate
        doc.text(formatNumber(item.rate),
            tableLeft + col.no + col.desc + col.qty + 5,
            y + rowPadding,
            { width: col.rate - 10, align: "right" }
        );

        // Amount
        doc.text(formatNumber(item.amount),
            tableLeft +
            col.no +
            col.desc +
            col.qty +
            col.rate +
            5,
            y + rowPadding,
            { width: col.amount - 10, align: "right" }
        );

        y += rowHeight;
    });


    // =========================
    // TOTAL SECTION
    // =========================

    checkPageBreak(80);

    doc.moveTo(tableLeft, y)
        .lineTo(tableLeft + CONTENT_WIDTH, y)
        .stroke();

    y += 20;

    const totalsRight = tableLeft + col.no + col.desc + col.qty + col.rate;

    doc.font("Helvetica-Bold").fontSize(12);

    doc.text("Grand Total:", totalsRight - 120, y, {
        width: 120,
        align: "right"
    });

    doc.text(formatNumber(quotation.grandTotal), totalsRight, y, {
        width: col.amount,
        align: "right"
    });

    y += 40;

    // // =========================
    // // TERMS
    // // =========================

    // if (quotation.termsAndConditions) {
    //     checkPageBreak(100);

    //     doc.font("Helvetica-Bold").fontSize(11);
    //     doc.text("Terms & Conditions", MARGIN, y);

    //     y += 15;

    //     doc.font("Helvetica").fontSize(10);
    //     doc.text(quotation.termsAndConditions, MARGIN, y, {
    //         width: CONTENT_WIDTH
    //     });

    //     y = doc.y + 25;
    // }

    // =========================
    // TERMS
    // =========================

    const termsText =
        quotation.termsAndConditions?.trim() ||
        "Payment is due within 30 days from the date of quotation. All services will be provided as agreed. Any additional work will be billed separately.";

    const termsHeight =
        doc.heightOfString(termsText, { width: CONTENT_WIDTH }) + 40;

    checkPageBreak(termsHeight);

    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Terms & Conditions", MARGIN, y);

    y += 18;

    doc.font("Helvetica").fontSize(10);
    doc.text(termsText, MARGIN, y, {
        width: CONTENT_WIDTH
    });

    y = doc.y + 25;

    // =========================
    // THANK YOU MESSAGE
    // =========================

    checkPageBreak(40);

    doc.font("Helvetica-Oblique").fontSize(11);
    doc.text(
        "Thank you for the opportunity to work with you!",
        MARGIN,
        y,
        { width: CONTENT_WIDTH, align: "center" }
    );

    // // =========================
    // // PAGE NUMBERS
    // // =========================

    // const range = doc.bufferedPageRange();

    // for (let i = 0; i < range.count; i++) {
    //     doc.switchToPage(i);

    //     doc.fontSize(9).font("Helvetica");
    //     doc.text(
    //         `Page ${i + 1} of ${range.count}`,
    //         0,
    //         PAGE_HEIGHT - 40,
    //         { align: "center" }
    //     );
    // }

    doc.end();
};

export default generateQuotationPDF;
