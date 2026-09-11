const express = require("express");

const {
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
} = require("../controllers/reportController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Report Routes */

/*
    Student Appointment Reports

    Available to:
    - Student
*/

router.get(
    "/student/appointments/pdf",
    authenticateToken,
    authorizeRoles(
        "student"
    ),
    downloadStudentAppointmentReportPDF
);


router.get(
    "/student/appointments/excel",
    authenticateToken,
    authorizeRoles(
        "student"
    ),
    downloadStudentAppointmentReportExcel
);

/*
    Provider Appointment Reports

    Available to:
    - Service Provider
*/

router.get(
    "/provider/appointments/pdf",
    authenticateToken,
    authorizeRoles(
        "provider"
    ),
    downloadProviderAppointmentReportPDF
);


router.get(
    "/provider/appointments/excel",
    authenticateToken,
    authorizeRoles(
        "provider"
    ),
    downloadProviderAppointmentReportExcel
);

/*
    Appointment Reports

    Available to:
    - Appointment Officer
    - Administrator
*/

router.get(
    "/appointments/pdf",
    authenticateToken,
    authorizeRoles(
        "appointment_officer",
        "admin"
    ),
    downloadAppointmentReportPDF
);


router.get(
    "/appointments/excel",
    authenticateToken,
    authorizeRoles(
        "appointment_officer",
        "admin"
    ),
    downloadAppointmentReportExcel
);


/*
    Service Reports

    Available to:
    - Service Manager
    - Administrator
*/

router.get(
    "/services/pdf",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    downloadServiceReportPDF
);


router.get(
    "/services/excel",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    downloadServiceReportExcel
);


/*
    System Reports

    Available to:
    - Administrator
*/

router.get(
    "/system/pdf",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    downloadSystemReportPDF
);


router.get(
    "/system",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    getSystemReport
);


router.get(
    "/system/excel",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    downloadSystemReportExcel
);


module.exports = router;