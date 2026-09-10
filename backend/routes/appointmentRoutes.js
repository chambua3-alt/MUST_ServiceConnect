const express = require("express");

const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    getStudentAppointments,
    getProviderAppointments,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment
} = require("../controllers/appointmentController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Appointment Routes */


/* Create Appointment */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "student"
    ),
    createAppointment
);


/* Get All Appointments */

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "appointment_officer",
        "admin"
    ),
    getAppointments
);


/* Get Student Appointments */

router.get(
    "/student/:user_id",
    authenticateToken,
    authorizeRoles(
        "student",
        "admin"
    ),
    getStudentAppointments
);


/* Get Provider Appointments */

router.get(
    "/provider/:provider_id",
    authenticateToken,
    authorizeRoles(
        "provider",
        "admin"
    ),
    getProviderAppointments
);


/* Get One Appointment */

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "student",
        "provider",
        "appointment_officer",
        "admin"
    ),
    getAppointmentById
);


/* Update Appointment */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "student"
    ),
    updateAppointment
);


/* Update Appointment Status */

router.patch(
    "/:id/status",
    authenticateToken,
    authorizeRoles(
        "provider",
        "appointment_officer",
        "admin"
    ),
    updateAppointmentStatus
);


/* Cancel Appointment */

router.patch(
    "/:id/cancel",
    authenticateToken,
    authorizeRoles(
        "student",
        "provider",
        "appointment_officer",
        "admin"
    ),
    cancelAppointment
);


/* Delete Cancelled Appointment */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "appointment_officer",
        "admin"
    ),
    deleteAppointment
);


module.exports = router;