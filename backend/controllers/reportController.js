const pool = require("../db");

const {
    generatePDF
} = require("../utils/pdfGenerator");

const {
    generateExcel
} = require("../utils/excelGenerator");


/* Get Appointment Report Data */

async function getAppointmentReportData() {

    const result = await pool.query(`
        SELECT
            a.id,
            a.full_name,
            a.phone,
            a.email,
            s.name AS service_name,
            p.provider_id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason,
            a.rejection_reason,
            a.created_at
        FROM appointments a
        INNER JOIN services s
            ON a.service_id = s.id
        INNER JOIN providers p
            ON a.provider_id = p.id
        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC,
            a.id DESC
    `);

    return result.rows;

}


/* Get Service Report Data */

async function getServiceReportData() {

    const result = await pool.query(`
        SELECT
            s.id,
            s.name AS service_name,
            s.special_name,
            c.name AS category_name,
            s.location,
            s.status,
            s.availability,
            s.working_hours,
            s.is_active,
            s.created_at
        FROM services s
        INNER JOIN service_categories c
            ON s.category_id = c.id
        ORDER BY
            c.name ASC,
            s.name ASC
    `);

    return result.rows;

}


/* Get System Report Data */

async function getSystemReportData() {

    const usersResult = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_users,
            COUNT(*) FILTER (
                WHERE is_active = true
            )::INTEGER AS active_users,
            COUNT(*) FILTER (
                WHERE is_active = false
            )::INTEGER AS inactive_users
        FROM users
    `);


    const servicesResult = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_services,
            COUNT(*) FILTER (
                WHERE is_active = true
            )::INTEGER AS active_services,
            COUNT(*) FILTER (
                WHERE is_active = false
            )::INTEGER AS inactive_services
        FROM services
    `);


    const providersResult = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_providers,
            COUNT(*) FILTER (
                WHERE is_active = true
            )::INTEGER AS active_providers,
            COUNT(*) FILTER (
                WHERE is_active = false
            )::INTEGER AS inactive_providers
        FROM providers
    `);


    const categoriesResult = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_categories,
            COUNT(*) FILTER (
                WHERE is_active = true
            )::INTEGER AS active_categories,
            COUNT(*) FILTER (
                WHERE is_active = false
            )::INTEGER AS inactive_categories
        FROM service_categories
    `);


    const appointmentsResult = await pool.query(`
        SELECT
            COUNT(*)::INTEGER AS total_appointments,
            COUNT(*) FILTER (
                WHERE status = 'pending'
            )::INTEGER AS pending_appointments,
            COUNT(*) FILTER (
                WHERE status = 'approved'
            )::INTEGER AS approved_appointments,
            COUNT(*) FILTER (
                WHERE status = 'rejected'
            )::INTEGER AS rejected_appointments,
            COUNT(*) FILTER (
                WHERE status = 'completed'
            )::INTEGER AS completed_appointments,
            COUNT(*) FILTER (
                WHERE status = 'cancelled'
            )::INTEGER AS cancelled_appointments
        FROM appointments
    `);


    return {
        users:
            usersResult.rows[0],

        services:
            servicesResult.rows[0],

        providers:
            providersResult.rows[0],

        categories:
            categoriesResult.rows[0],

        appointments:
            appointmentsResult.rows[0]
    };

}


/* Download Appointment Report PDF */

async function downloadAppointmentReportPDF(
    req,
    res
) {

    try {

        const data =
            await getAppointmentReportData();


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
                "Provider",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.provider_name,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        generatePDF(
            res,
            "MUST ServiceConnect Appointment Report",
            columns,
            rows,
            "appointment_report"
        );

    } catch (error) {

        console.error(
            "Appointment PDF report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate appointment PDF report."
        });

    }

}


/* Download Appointment Report Excel */

async function downloadAppointmentReportExcel(
    req,
    res
) {

    try {

        const data =
            await getAppointmentReportData();


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
            "Provider ID",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.provider_id,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        await generateExcel(
            res,
            "MUST ServiceConnect Appointment Report",
            columns,
            rows,
            "appointment_report"
        );

    } catch (error) {

        console.error(
            "Appointment Excel report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate appointment Excel report."
        });

    }

}


/* Download Service Report PDF */

async function downloadServiceReportPDF(
    req,
    res
) {

    try {

        const data =
            await getServiceReportData();


        const columns = [
            "ID",
            "Service",
            "Special Name",
            "Category",
            "Location",
            "Status",
            "Availability",
            "Working Hours",
            "Active"
        ];


        const rows =
            data.map(
                function (service) {

                    return [
                        service.id,
                        service.service_name,
                        service.special_name,
                        service.category_name,
                        service.location,
                        service.status,
                        service.availability,
                        service.working_hours,
                        service.is_active
                            ? "Yes"
                            : "No"
                    ];

                }
            );


        generatePDF(
            res,
            "MUST ServiceConnect Service Report",
            columns,
            rows,
            "service_report"
        );

    } catch (error) {

        console.error(
            "Service PDF report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate service PDF report."
        });

    }

}


/* Download Service Report Excel */

async function downloadServiceReportExcel(
    req,
    res
) {

    try {

        const data =
            await getServiceReportData();


        const columns = [
            "ID",
            "Service",
            "Special Name",
            "Category",
            "Location",
            "Status",
            "Availability",
            "Working Hours",
            "Active"
        ];


        const rows =
            data.map(
                function (service) {

                    return [
                        service.id,
                        service.service_name,
                        service.special_name,
                        service.category_name,
                        service.location,
                        service.status,
                        service.availability,
                        service.working_hours,
                        service.is_active
                            ? "Yes"
                            : "No"
                    ];

                }
            );


        await generateExcel(
            res,
            "MUST ServiceConnect Service Report",
            columns,
            rows,
            "service_report"
        );

    } catch (error) {

        console.error(
            "Service Excel report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate service Excel report."
        });

    }

}


/* Download System Report PDF */

async function getSystemReport(
    req,
    res
) {

    try {
        res.status(200).json(
            await getSystemReportData()
        );
    } catch (error) {
        console.error("System report data error:", error.message);
        res.status(500).json({
            message: "Failed to retrieve system report data."
        });
    }

}

async function downloadSystemReportPDF(
    req,
    res
) {

    try {

        const report =
            await getSystemReportData();


        const columns = [
            "Entity",
            "Total",
            "Active/Pending",
            "Inactive/Approved",
            "Other"
        ];


        const rows = [
            [
                "Users",
                report.users.total_users,
                report.users.active_users,
                report.users.inactive_users,
                ""
            ],
            [
                "Services",
                report.services.total_services,
                report.services.active_services,
                report.services.inactive_services,
                ""
            ],
            [
                "Providers",
                report.providers.total_providers,
                report.providers.active_providers,
                report.providers.inactive_providers,
                ""
            ],
            [
                "Categories",
                report.categories.total_categories,
                report.categories.active_categories,
                report.categories.inactive_categories,
                ""
            ],
            [
                "Appointments",
                report.appointments.total_appointments,
                report.appointments.pending_appointments,
                report.appointments.approved_appointments,
                `Completed: ${report.appointments.completed_appointments}, Rejected: ${report.appointments.rejected_appointments}, Cancelled: ${report.appointments.cancelled_appointments}`
            ]
        ];


        generatePDF(
            res,
            "MUST ServiceConnect System Report",
            columns,
            rows,
            "system_report"
        );

    } catch (error) {

        console.error(
            "System PDF report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate system PDF report."
        });

    }

}


/* Download System Report Excel */

async function downloadSystemReportExcel(
    req,
    res
) {

    try {

        const report =
            await getSystemReportData();


        const columns = [
            "Entity",
            "Total",
            "Active/Pending",
            "Inactive/Approved",
            "Other"
        ];


        const rows = [
            [
                "Users",
                report.users.total_users,
                report.users.active_users,
                report.users.inactive_users,
                ""
            ],
            [
                "Services",
                report.services.total_services,
                report.services.active_services,
                report.services.inactive_services,
                ""
            ],
            [
                "Providers",
                report.providers.total_providers,
                report.providers.active_providers,
                report.providers.inactive_providers,
                ""
            ],
            [
                "Categories",
                report.categories.total_categories,
                report.categories.active_categories,
                report.categories.inactive_categories,
                ""
            ],
            [
                "Appointments",
                report.appointments.total_appointments,
                report.appointments.pending_appointments,
                report.appointments.approved_appointments,
                `Completed: ${report.appointments.completed_appointments}, Rejected: ${report.appointments.rejected_appointments}, Cancelled: ${report.appointments.cancelled_appointments}`
            ]
        ];


        await generateExcel(
            res,
            "MUST ServiceConnect System Report",
            columns,
            rows,
            "system_report"
        );

    } catch (error) {

        console.error(
            "System Excel report error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to generate system Excel report."
        });

    }

}

/* Get Student Appointment Report Data */

async function getStudentAppointmentReportData(
    userId
) {

    const result = await pool.query(
        `
        SELECT
            a.id,
            a.full_name,
            a.phone,
            a.email,
            s.name AS service_name,
            p.provider_id,
            u.full_name AS provider_name,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason
        FROM appointments a
        INNER JOIN services s
            ON a.service_id = s.id
        INNER JOIN providers p
            ON a.provider_id = p.id
        INNER JOIN users u
            ON u.id = p.user_id
        WHERE a.user_id = $1
        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC,
            a.id DESC
        `,
        [userId]
    );

    return result.rows;

}


/* Get Provider Appointment Report Data */

async function getProviderAppointmentReportData(
    userId
) {

    const providerResult = await pool.query(
        `
        SELECT id
        FROM providers
        WHERE user_id = $1
          AND is_active = true
        `,
        [userId]
    );


    if (providerResult.rows.length === 0) {

        const error =
            new Error(
                "Provider account was not found."
            );

        error.status = 404;

        throw error;

    }


    const providerId =
        providerResult.rows[0].id;


    const result = await pool.query(
        `
        SELECT
            a.id,
            a.full_name,
            a.phone,
            a.email,
            s.name AS service_name,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason
        FROM appointments a
        INNER JOIN services s
            ON a.service_id = s.id
        WHERE a.provider_id = $1
        ORDER BY
            a.appointment_date DESC,
            a.appointment_time DESC,
            a.id DESC
        `,
        [providerId]
    );

    return result.rows;

}


/* Download Student Appointment Report PDF */

async function downloadStudentAppointmentReportPDF(
    req,
    res
) {

    try {

        const data =
            await getStudentAppointmentReportData(
                req.user.userId
            );


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
            "Provider",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.provider_name,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        generatePDF(
            res,
            "MUST ServiceConnect My Appointments Report",
            columns,
            rows,
            "my_appointments_report"
        );

    } catch (error) {

        console.error(
            "Student appointment PDF report error:",
            error.message
        );


        res.status(
            error.status || 500
        ).json({
            message:
                error.status
                    ? error.message
                    : "Failed to generate student appointment PDF report."
        });

    }

}


/* Download Student Appointment Report Excel */

async function downloadStudentAppointmentReportExcel(
    req,
    res
) {

    try {

        const data =
            await getStudentAppointmentReportData(
                req.user.userId
            );


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
            "Provider ID",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.provider_id,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        await generateExcel(
            res,
            "MUST ServiceConnect My Appointments Report",
            columns,
            rows,
            "my_appointments_report"
        );

    } catch (error) {

        console.error(
            "Student appointment Excel report error:",
            error.message
        );


        res.status(
            error.status || 500
        ).json({
            message:
                error.status
                    ? error.message
                    : "Failed to generate student appointment Excel report."
        });

    }

}


/* Download Provider Appointment Report PDF */

async function downloadProviderAppointmentReportPDF(
    req,
    res
) {

    try {

        const data =
            await getProviderAppointmentReportData(
                req.user.userId
            );


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        generatePDF(
            res,
            "MUST ServiceConnect Provider Appointments Report",
            columns,
            rows,
            "provider_appointments_report"
        );

    } catch (error) {

        console.error(
            "Provider appointment PDF report error:",
            error.message
        );


        res.status(
            error.status || 500
        ).json({
            message:
                error.status
                    ? error.message
                    : "Failed to generate provider appointment PDF report."
        });

    }

}


/* Download Provider Appointment Report Excel */

async function downloadProviderAppointmentReportExcel(
    req,
    res
) {

    try {

        const data =
            await getProviderAppointmentReportData(
                req.user.userId
            );


        const columns = [
            "ID",
            "Student",
            "Phone",
            "Email",
            "Service",
            "Date",
            "Time",
            "Status",
            "Reason"
        ];


        const rows =
            data.map(
                function (appointment) {

                    return [
                        appointment.id,
                        appointment.full_name,
                        appointment.phone,
                        appointment.email,
                        appointment.service_name,
                        appointment.appointment_date,
                        appointment.appointment_time,
                        appointment.status,
                        appointment.reason
                    ];

                }
            );


        await generateExcel(
            res,
            "MUST ServiceConnect Provider Appointments Report",
            columns,
            rows,
            "provider_appointments_report"
        );

    } catch (error) {

        console.error(
            "Provider appointment Excel report error:",
            error.message
        );


        res.status(
            error.status || 500
        ).json({
            message:
                error.status
                    ? error.message
                    : "Failed to generate provider appointment Excel report."
        });

    }

}

module.exports = {
    getSystemReport,
    downloadAppointmentReportPDF,
    downloadAppointmentReportExcel,

    downloadServiceReportPDF,
    downloadServiceReportExcel,

    downloadSystemReportPDF,
    downloadSystemReportExcel,

    downloadStudentAppointmentReportPDF,
    downloadStudentAppointmentReportExcel,

    downloadProviderAppointmentReportPDF,
    downloadProviderAppointmentReportExcel
};