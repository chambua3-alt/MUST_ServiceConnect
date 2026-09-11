const PDFDocument = require("pdfkit");


/* Sanitize PDF Filename */

function sanitizeFilename(filename) {

    return String(filename)
        .replace(/[^a-z0-9_-]/gi, "_")
        .toLowerCase();

}


/* Generate PDF Report */

function generatePDF(
    res,
    title,
    columns,
    rows,
    filename
) {

    const document =
        new PDFDocument({
            size: "A4",
            layout: "landscape",
            margin: 40
        });


    /* PDF Response Headers */

    const safeFilename =
        sanitizeFilename(filename || title);


    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}.pdf"`
    );


    /* Pipe PDF To Response */

    document.pipe(res);


    /* Report Title */

    document
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(
            title,
            {
                align: "center"
            }
        );


    document.moveDown(0.8);


    /* Report Date */

    document
        .fontSize(9)
        .font("Helvetica")
        .text(
            `Generated: ${new Date().toLocaleString()}`,
            {
                align: "right"
            }
        );


    document.moveDown(0.8);


    /* Table Configuration */

    const pageWidth =
        document.page.width -
        document.page.margins.left -
        document.page.margins.right;

    const cellPadding = 5;
    const bodyFontSize = 7;
    const headerFontSize = 8;
    const minimumRowHeight = 24;

    const values = rows.map(function (row) {
        return row.map(function (value) {
            return value === null || value === undefined
                ? ""
                : String(value);
        });
    });

    const preferredWidths = columns.map(function (column, index) {

        const longestValue = Math.max(
            String(column).length,
            ...values.map(function (row) {
                return (row[index] || "").length;
            })
        );

        return Math.min(
            220,
            Math.max(48, longestValue * 4.2 + cellPadding * 2)
        );

    });

    const preferredTotal = preferredWidths.reduce(
        function (total, width) {
            return total + width;
        },
        0
    );

    const scale = pageWidth / preferredTotal;

    const columnWidths = preferredWidths.map(function (width) {
        return scale < 1
            ? width * scale
            : width + ((pageWidth - preferredTotal) / columns.length);
    });

    function drawHeader(y) {

        document
            .font("Helvetica-Bold")
            .fontSize(headerFontSize);

        let x = document.page.margins.left;
        let headerHeight = 24;

        columns.forEach(function (column, index) {
            headerHeight = Math.max(
                headerHeight,
                document.heightOfString(
                    String(column),
                    {
                        width: columnWidths[index] - cellPadding * 2,
                        lineGap: 1
                    }
                ) + cellPadding * 2
            );
        });

        columns.forEach(function (column, index) {
            document.rect(
                x,
                y,
                columnWidths[index],
                headerHeight
            ).stroke();

            document.text(
                String(column),
                x + cellPadding,
                y + cellPadding,
                {
                    width: columnWidths[index] - cellPadding * 2,
                    height: headerHeight - cellPadding * 2,
                    lineGap: 1
                }
            );

            x += columnWidths[index];
        });

        return headerHeight;

    }

    let currentY = document.y;
    currentY += drawHeader(currentY);

    document
        .font("Helvetica")
        .fontSize(bodyFontSize);

    values.forEach(function (row) {

        const rowHeight = Math.max(
            minimumRowHeight,
            ...row.map(function (value, index) {
                return document.heightOfString(
                    value,
                    {
                        width: columnWidths[index] - cellPadding * 2,
                        lineGap: 1
                    }
                ) + cellPadding * 2;
            })
        );

        if (
            currentY + rowHeight >
            document.page.height - document.page.margins.bottom
        ) {
            document.addPage();
            currentY = document.page.margins.top;
            currentY += drawHeader(currentY);
            document.font("Helvetica").fontSize(bodyFontSize);
        }

        let x = document.page.margins.left;

        row.forEach(function (value, index) {

            document.rect(
                x,
                currentY,
                columnWidths[index],
                rowHeight
            ).stroke();

            document.text(
                value,
                x + cellPadding,
                currentY + cellPadding,
                {
                    width: columnWidths[index] - cellPadding * 2,
                    height: rowHeight - cellPadding * 2,
                    lineGap: 1
                }
            );

            x += columnWidths[index];
        });

        currentY += rowHeight;

    });


    /* Finish PDF */

    document.end();

}


module.exports = {
    generatePDF
};