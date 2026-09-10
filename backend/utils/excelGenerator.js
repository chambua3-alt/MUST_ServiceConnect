const ExcelJS = require("exceljs");


/* Sanitize Excel Filename */

function sanitizeFilename(filename) {

    return String(filename)
        .replace(/[^a-z0-9_-]/gi, "_")
        .toLowerCase();

}


/* Generate Excel Report */

async function generateExcel(
    res,
    title,
    columns,
    rows,
    filename
) {

    const workbook =
        new ExcelJS.Workbook();


    /* Create Worksheet */

    const worksheet =
        workbook.addWorksheet(
            String(title).substring(0, 31)
        );


    /* Worksheet Columns */

    worksheet.columns =
        columns.map(
            function (column) {

                return {
                    header: column,
                    key: column,
                    width: 22
                };

            }
        );


    /* Add Report Rows */

    rows.forEach(
        function (row) {

            const rowData = {};

            columns.forEach(
                function (column, index) {

                    rowData[column] =
                        row[index] === null ||
                        row[index] === undefined
                            ? ""
                            : row[index];

                }
            );

            worksheet.addRow(rowData);

        }
    );


    /* Header Formatting */

    const headerRow =
        worksheet.getRow(1);

    headerRow.font = {
        bold: true
    };


    headerRow.alignment = {
        vertical: "middle",
        horizontal: "center"
    };


    /* Freeze Header Row */

    worksheet.views = [
        {
            state: "frozen",
            ySplit: 1
        }
    ];


    /* Enable Auto Filter */

    worksheet.autoFilter = {
        from: "A1",
        to:
            `${String.fromCharCode(
                64 + columns.length
            )}1`
    };


    /* Format All Cells */

    worksheet.eachRow(
        function (row) {

            row.alignment = {
                vertical: "middle"
            };

        }
    );


    /* Excel Response Headers */

    const safeFilename =
        sanitizeFilename(
            filename || title
        );


    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFilename}.xlsx"`
    );


    /* Write Workbook To Response */

    await workbook.xlsx.write(res);

    res.end();

}


module.exports = {
    generateExcel
};