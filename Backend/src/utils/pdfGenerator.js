// src/utils/pdfGenerator.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MARGIN = 50;
const BRAND = "#1e3a5f";
const BRAND_LIGHT = "#334e68";
const ACCENT = "#0ea5e9";

const formatNumber = n =>
    Number(n) != null && !Number.isNaN(Number(n))
        ? Number(n).toFixed(2)
        : "0.00";

const resolveLogoPath = () =>
    path.join(__dirname, "..", "assets", "quotation-logo.png");

/**
 * @param {object} quotation
 * @param {import("http").ServerResponse} res
 * @param {{ currencySymbol?: string }} [options]
 */
const generateQuotationPDF = (quotation, res, options = {}) => {
    const currencySymbol = options.currencySymbol || "₹";
    const formatMoney = n => `${currencySymbol}${formatNumber(n)}`;

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

    const rowPadding = 6;
    const minRowHeight = 24;

    const col = {
        no: 40,
        desc: 230,
        qty: 60,
        rate: 90,
        amount: 100
    };

    const tableLeft = MARGIN;
    const tableWidth = col.no + col.desc + col.qty + col.rate + col.amount;

    const drawHeaderBand = () => {
        const bandH = 112;
        doc.save();
        doc.rect(0, 0, PAGE_WIDTH, bandH).fill(BRAND);
        doc.rect(0, bandH - 6, PAGE_WIDTH, 6).fill(ACCENT);

        const logoSize = 52;
        const logoY = 34;
        const logoX = MARGIN;
        let logoDrawn = false;
        try {
            const logoPath = resolveLogoPath();
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, logoX, logoY, {
                    width: logoSize,
                    height: logoSize,
                    fit: [logoSize, logoSize]
                });
                logoDrawn = true;
            }
        } catch {
            /* optional asset */
        }

        if (!logoDrawn) {
            doc.roundedRect(logoX, logoY, logoSize, logoSize, 8).fill(BRAND_LIGHT);
            const letter = (
                quotation.companyDetails?.name ||
                quotation.quotationNumber ||
                "Q"
            )
                .trim()
                .charAt(0)
                .toUpperCase();
            doc.fillColor("#ffffff")
                .font("Helvetica-Bold")
                .fontSize(24)
                .text(letter, logoX, logoY + 12, {
                    width: logoSize,
                    align: "center"
                });
        }

        const textLeft = logoX + logoSize + 18;
        doc.fillColor("#f8fafc")
            .font("Helvetica-Bold")
            .fontSize(26)
            .text("QUOTATION", textLeft, logoY + 2, {
                width: PAGE_WIDTH - textLeft - MARGIN,
                lineGap: 2
            });

        doc.font("Helvetica")
            .fontSize(11)
            .fillColor("#cbd5e1")
            .text(
                `No. ${quotation.quotationNumber}   ·   ${new Date(
                    quotation.quotationDate
                ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })}`,
                textLeft,
                logoY + 34,
                { width: PAGE_WIDTH - textLeft - MARGIN }
            );

        const companyName = quotation.companyDetails?.name || "—";
        doc.font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#e2e8f0")
            .text(companyName, MARGIN, logoY + 2, {
                width: PAGE_WIDTH - MARGIN * 2,
                align: "right"
            });

        doc.restore();
        return bandH + 28;
    };

    let y = drawHeaderBand();

    const drawRowBorders = (rowY, rowHeight) => {
        doc.strokeColor("#e2e8f0");
        doc.rect(tableLeft, rowY, tableWidth, rowHeight).stroke();
        let x = tableLeft;
        Object.values(col).forEach(width => {
            x += width;
            doc.moveTo(x, rowY)
                .lineTo(x, rowY + rowHeight)
                .stroke();
        });
        doc.strokeColor("#000000");
    };

    const drawTableHeader = () => {
        const rowHeight = minRowHeight;

        doc.rect(tableLeft, y, tableWidth, rowHeight).fill("#e8eef4");
        doc.strokeColor("#cbd5e1");
        doc.rect(tableLeft, y, tableWidth, rowHeight).stroke();
        doc.strokeColor("#000000");

        doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(9);

        doc.text("Sr.", tableLeft + 6, y + rowPadding, {
            width: col.no - 12
        });

        doc.text("Description", tableLeft + col.no + 6, y + rowPadding, {
            width: col.desc - 12
        });

        doc.text("Qty", tableLeft + col.no + col.desc + 6, y + rowPadding, {
            width: col.qty - 12,
            align: "right"
        });

        doc.text(
            "Rate",
            tableLeft + col.no + col.desc + col.qty + 6,
            y + rowPadding,
            { width: col.rate - 12, align: "right" }
        );

        doc.text(
            "Amount",
            tableLeft + col.no + col.desc + col.qty + col.rate + 6,
            y + rowPadding,
            { width: col.amount - 12, align: "right" }
        );

        drawRowBorders(y, rowHeight);

        y += rowHeight;

        doc.fillColor("#0f172a").font("Helvetica").fontSize(9.5);
    };

    const checkPageBreak = neededHeight => {
        if (y + neededHeight > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
            drawTableHeader();
        }
    };

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#0f172a")
        .text("Line items", MARGIN, y);
    y += 22;

    drawTableHeader();

    const items = quotation.items || [];

    items.forEach((item, index) => {
        const descHeight = doc.heightOfString(item.description || "—", {
            width: col.desc - 12
        });

        const rowHeight = Math.max(minRowHeight, descHeight + rowPadding * 2);

        checkPageBreak(rowHeight);

        drawRowBorders(y, rowHeight);

        doc.fillColor("#0f172a");

        doc.text(String(index + 1), tableLeft + 6, y + rowPadding, {
            width: col.no - 12
        });

        doc.font("Helvetica")
            .fontSize(9.5)
            .text(
                item.description || "—",
                tableLeft + col.no + 6,
                y + rowPadding,
                { width: col.desc - 12, lineGap: 1 }
            );

        doc.text(
            String(item.quantity ?? ""),
            tableLeft + col.no + col.desc + 6,
            y + rowPadding,
            { width: col.qty - 12, align: "right" }
        );

        doc.text(
            formatMoney(item.rate),
            tableLeft + col.no + col.desc + col.qty + 6,
            y + rowPadding,
            { width: col.rate - 12, align: "right" }
        );

        doc.font("Helvetica-Bold").text(
            formatMoney(item.amount),
            tableLeft + col.no + col.desc + col.qty + col.rate + 6,
            y + rowPadding,
            { width: col.amount - 12, align: "right" }
        );

        doc.font("Helvetica");

        y += rowHeight;
    });

    checkPageBreak(88);

    doc.moveTo(tableLeft, y)
        .lineWidth(1)
        .strokeColor("#cbd5e1")
        .lineTo(tableLeft + CONTENT_WIDTH, y)
        .stroke();
    doc.strokeColor("#000000");

    y += 22;

    const totalsRight = tableLeft + col.no + col.desc + col.qty + col.rate;

    doc.font("Helvetica-Bold")
        .fontSize(12)
        .fillColor(BRAND);

    doc.text("Grand total:", totalsRight - 120, y, {
        width: 120,
        align: "right"
    });

    doc.text(formatMoney(quotation.grandTotal), totalsRight, y, {
        width: col.amount,
        align: "right"
    });

    y += 36;

    doc.fillColor("#0f172a");

    const notesText = quotation.notes?.trim();
    if (notesText) {
        const notesBlockHeight =
            doc.heightOfString(notesText, { width: CONTENT_WIDTH }) + 36;
        checkPageBreak(notesBlockHeight);

        doc.font("Helvetica-Bold").fontSize(11).fillColor(BRAND);
        doc.text("Notes", MARGIN, y);
        y += 16;

        doc.font("Helvetica").fontSize(10).fillColor("#334155");
        doc.text(notesText, MARGIN, y, {
            width: CONTENT_WIDTH,
            lineGap: 2
        });

        y = doc.y + 20;
    }

    const termsText = quotation.termsAndConditions?.trim();
    if (termsText) {
        const termsHeight =
            doc.heightOfString(termsText, { width: CONTENT_WIDTH }) + 36;

        checkPageBreak(termsHeight);

        doc.font("Helvetica-Bold").fontSize(11).fillColor(BRAND);
        doc.text("Terms & conditions", MARGIN, y);

        y += 16;

        doc.font("Helvetica").fontSize(10).fillColor("#334155");
        doc.text(termsText, MARGIN, y, {
            width: CONTENT_WIDTH,
            lineGap: 2
        });

        y = doc.y + 20;
    }

    checkPageBreak(36);

    doc.font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor("#64748b")
        .text("Thank you for your business.", MARGIN, y, {
            width: CONTENT_WIDTH,
            align: "center"
        });

    doc.end();
};

export default generateQuotationPDF;
