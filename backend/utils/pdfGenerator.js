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

    const columnWidth =
        pageWidth / columns.length;

    const rowHeight = 25;

    let currentY =
        document.y;


    /* Table Header */

    document
        .font("Helvetica-Bold")
        .fontSize(9);


    columns.forEach(
        function (column, index) {

            const x =
                document.page.margins.left +
                (index * columnWidth);


            document
                .rect(
                    x,
                    currentY,
                    columnWidth,
                    rowHeight
                )
                .stroke();


            document.text(
                String(column),
                x + 5,
                currentY + 8,
                {
                    width:
                        columnWidth - 10,
                    height:
                        rowHeight - 10,
                    ellipsis: true
                }
            );

        }
    );


    currentY += rowHeight;


    /* Table Rows */

    document
        .font("Helvetica")
        .fontSize(8);


    rows.forEach(
        function (row) {

            /* New Page */

            if (
                currentY + rowHeight >
                document.page.height -
                document.page.margins.bottom
            ) {

                document.addPage();

                currentY =
                    document.page.margins.top;

                document
                    .font("Helvetica-Bold")
                    .fontSize(9);


                columns.forEach(
                    function (column, index) {

                        const x =
                            document.page.margins.left +
                            (index * columnWidth);


                        document
                            .rect(
                                x,
                                currentY,
                                columnWidth,
                                rowHeight
                            )
                            .stroke();


                        document.text(
                            String(column),
                            x + 5,
                            currentY + 8,
                            {
                                width:
                                    columnWidth - 10,
                                height:
                                    rowHeight - 10,
                                ellipsis: true
                            }
                        );

                    }
                );


                currentY += rowHeight;


                document
                    .font("Helvetica")
                    .fontSize(8);

            }


            row.forEach(
                function (value, index) {

                    const x =
                        document.page.margins.left +
                        (index * columnWidth);


                    document
                        .rect(
                            x,
                            currentY,
                            columnWidth,
                            rowHeight
                        )
                        .stroke();


                    document.text(
                        value === null ||
                        value === undefined
                            ? ""
                            : String(value),
                        x + 5,
                        currentY + 8,
                        {
                            width:
                                columnWidth - 10,
                            height:
                                rowHeight - 10,
                            ellipsis: true
                        }
                    );

                }
            );


            currentY += rowHeight;

        }
    );


    /* Finish PDF */

    document.end();

}


module.exports = {
    generatePDF
};