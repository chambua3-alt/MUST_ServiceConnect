const pool = require("../db");


/* Choose the earliest free slot in the service working window. */

function getWorkingSlotRange(workingHours) {

    const match = String(workingHours || "")
        .match(/(\d{1,2}:\d{2})\s*(?:-|to)\s*(\d{1,2}:\d{2})/i);

    return {
        start: match ? match[1] : "08:00",
        end: match ? match[2] : "16:00"
    };

}


function timeToMinutes(time) {

    const parts = String(time).split(":");

    return Number(parts[0]) * 60 + Number(parts[1]);

}


function minutesToTime(minutes) {

    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const remainder = String(minutes % 60).padStart(2, "0");

    return `${hours}:${remainder}:00`;

}


async function allocateAppointmentTime(
    serviceId,
    providerId,
    appointmentDate,
    excludeAppointmentId = null
) {

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(appointmentDate))) {
        const error = new Error(
            "Appointment date must use YYYY-MM-DD format."
        );
        error.status = 400;
        throw error;
    }

    const today = new Date()
        .toISOString()
        .split("T")[0];

    if (String(appointmentDate) < today) {
        const error = new Error(
            "Appointment date cannot be in the past."
        );
        error.status = 400;
        throw error;
    }

    const serviceResult = await pool.query(
        `
        SELECT
            s.working_hours
        FROM services s
        INNER JOIN provider_services ps
            ON ps.service_id = s.id
        INNER JOIN providers p
            ON p.id = ps.provider_id
        WHERE s.id = $1
          AND ps.provider_id = $2
          AND s.is_active = TRUE
          AND p.is_active = TRUE
          AND p.availability <> 'closed'
        `,
        [serviceId, providerId]
    );

    if (serviceResult.rows.length === 0) {
        const error = new Error(
            "The selected provider is not available for this service."
        );
        error.status = 400;
        throw error;
    }

    const range = getWorkingSlotRange(
        serviceResult.rows[0].working_hours
    );

    const start = timeToMinutes(range.start);
    const end = timeToMinutes(range.end);

    if (start >= end) {
        const error = new Error("The service working hours are invalid.");
        error.status = 409;
        throw error;
    }

    const values = [providerId, appointmentDate];
    let excludeSql = "";

    if (excludeAppointmentId) {
        values.push(excludeAppointmentId);
        excludeSql = "AND id <> $3";
    }

    const bookedResult = await pool.query(
        `
        SELECT appointment_time
        FROM appointments
        WHERE provider_id = $1
          AND appointment_date = $2
          AND status NOT IN ('rejected', 'cancelled')
          ${excludeSql}
        `,
        values
    );

    const bookedTimes = new Set(
        bookedResult.rows.map(function (appointment) {
            return String(appointment.appointment_time)
                .slice(0, 5);
        })
    );

    for (let minutes = start; minutes < end; minutes += 30) {

        const slot = minutesToTime(minutes);

        if (!bookedTimes.has(slot.slice(0, 5))) {
            return slot;
        }

    }

    const error = new Error(
        "No appointment time is available for the selected service on that date."
    );
    error.status = 409;
    throw error;

}


/* Create Appointment */

async function createAppointment(req, res) {

    try {

        const {
            service_id,
            provider_id,
            full_name,
            phone,
            email,
            reason,
            appointment_date,
        } = req.body;


        /* Student User ID From Authenticated Token */

        const user_id =
            req.user.userId;


        /* Validate Required Fields */

        if (
            !service_id ||
            !provider_id ||
            !full_name ||
            !String(full_name).trim() ||
            !phone ||
            !String(phone).trim() ||
            !email ||
            !String(email).trim() ||
            !reason ||
            !String(reason).trim() ||
            !appointment_date
        ) {

            return res.status(400).json({
                message:
                    "Service, provider, full name, phone, email, reason and appointment date are required."
            });

        }


        /* Validate Authenticated User */

        const userResult = await pool.query(
            `
            SELECT
                id,
                is_active,
                role
            FROM users
            WHERE id = $1
            `,
            [user_id]
        );


        if (
            userResult.rows.length === 0
        ) {

            return res.status(401).json({
                message:
                    "Authenticated student account was not found."
            });

        }


        if (
            !userResult.rows[0].is_active
        ) {

            return res.status(403).json({
                message:
                    "Student account is inactive."
            });

        }


        if (
            userResult.rows[0].role !== "student"
        ) {

            return res.status(403).json({
                message:
                    "Only students can create appointments."
            });

        }


        /* Validate Provider-Service Assignment */

        const assignmentResult = await pool.query(
            `
            SELECT
                ps.id
            FROM provider_services ps

            INNER JOIN providers p
                ON p.id = ps.provider_id

            INNER JOIN services s
                ON s.id = ps.service_id

            WHERE ps.provider_id = $1
              AND ps.service_id = $2
              AND p.is_active = TRUE
              AND s.is_active = TRUE
            `,
            [
                provider_id,
                service_id
            ]
        );


        if (
            assignmentResult.rows.length === 0
        ) {

            return res.status(400).json({
                message:
                    "The selected provider is not assigned to the selected service."
            });

        }


        let appointmentTime;

        try {

            appointmentTime = await allocateAppointmentTime(
                service_id,
                provider_id,
                appointment_date
            );

        } catch (error) {

            return res.status(error.status || 409).json({
                message: error.message
            });

        }


        /* Create Appointment */

        const result = await pool.query(
            `
            INSERT INTO appointments
                (
                    user_id,
                    service_id,
                    provider_id,
                    full_name,
                    phone,
                    email,
                    reason,
                    appointment_date,
                    appointment_time
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9
                )
            RETURNING
                id,
                user_id,
                service_id,
                provider_id,
                full_name,
                phone,
                email,
                reason,
                status,
                appointment_date,
                appointment_time,
                rejection_reason,
                created_at,
                updated_at
            `,
            [
                user_id,
                service_id,
                provider_id,
                String(full_name).trim(),
                String(phone).trim(),
                String(email).trim().toLowerCase(),
                String(reason).trim(),
                appointment_date,
                appointmentTime
            ]
        );


        res.status(201).json({
            message:
                "Appointment created successfully.",
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create appointment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to create appointment."
        });

    }

}


/* Get All Appointments */

async function getAppointments(req, res) {

    try {

        const result = await pool.query(
            `
            SELECT
                a.id,
                a.user_id,
                a.service_id,
                s.name AS service_name,
                c.name AS category_name,
                a.provider_id,
                p.provider_id AS provider_code,
                u.full_name AS provider_name,
                a.full_name AS student_name,
                a.phone,
                a.email,
                a.reason,
                a.status,
                a.appointment_date,
                a.appointment_time,
                a.rejection_reason,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN services s
                ON s.id = a.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            INNER JOIN providers p
                ON p.id = a.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            ORDER BY
                a.appointment_date DESC,
                a.appointment_time DESC,
                a.created_at DESC
            `
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get appointments error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve appointments."
        });

    }

}


/* Get One Appointment */

async function getAppointmentById(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                a.id,
                a.user_id,
                a.service_id,
                s.name AS service_name,
                c.name AS category_name,
                a.provider_id,
                p.provider_id AS provider_code,
                u.full_name AS provider_name,
                a.full_name AS student_name,
                a.phone,
                a.email,
                a.reason,
                a.status,
                a.appointment_date,
                a.appointment_time,
                a.rejection_reason,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN services s
                ON s.id = a.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            INNER JOIN providers p
                ON p.id = a.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            WHERE a.id = $1
            `,
            [id]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Appointment not found."
            });

        }


        const appointment =
            result.rows[0];


        /* Student Ownership Check */

        if (
            req.user.role === "student" &&
            String(appointment.user_id) !==
            String(req.user.userId)
        ) {

            return res.status(403).json({
                message:
                    "You do not have permission to view this appointment."
            });

        }


        /* Provider Ownership Check */

if (
    req.user.role === "provider"
) {

    const providerResult =
        await pool.query(
            `
            SELECT
                id
            FROM providers
            WHERE user_id = $1
              AND is_active = TRUE
            `,
            [req.user.userId]
        );


    if (
        providerResult.rows.length === 0
    ) {

        return res.status(404).json({
            message:
                "Provider account was not found."
        });

    }


    if (
        String(appointment.provider_id) !==
        String(providerResult.rows[0].id)
    ) {

        return res.status(403).json({
            message:
                "You do not have permission to view this appointment."
        });

    }

}


        res.status(200).json(
            appointment
        );


    } catch (error) {

        console.error(
            "Get appointment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve appointment."
        });

    }

}


/* Get Student Appointments */

async function getStudentAppointments(req, res) {

    try {

        const {
            user_id
        } = req.params;


        /* Student Can Only Access Own Appointments */

        if (
            req.user.role === "student" &&
            String(user_id) !==
            String(req.user.userId)
        ) {

            return res.status(403).json({
                message:
                    "You can only view your own appointments."
            });

        }


        const result = await pool.query(
            `
            SELECT
                a.id,
                a.user_id,
                a.service_id,
                s.name AS service_name,
                c.name AS category_name,
                a.provider_id,
                p.provider_id AS provider_code,
                u.full_name AS provider_name,
                a.full_name AS student_name,
                a.phone,
                a.email,
                a.reason,
                a.status,
                a.appointment_date,
                a.appointment_time,
                a.rejection_reason,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN services s
                ON s.id = a.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            INNER JOIN providers p
                ON p.id = a.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            WHERE a.user_id = $1

            ORDER BY
                a.appointment_date DESC,
                a.appointment_time DESC,
                a.created_at DESC
            `,
            [user_id]
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get student appointments error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve student appointments."
        });

    }

}


/* Get Provider Appointments */

async function getProviderAppointments(req, res) {

    try {

        const {
            provider_id
        } = req.params;


        /* Provider Can Only Access Own Appointments */

        if (
            req.user.role === "provider"
        ) {

            const providerResult =
                await pool.query(
                    `
                    SELECT
                        id
                    FROM providers
                    WHERE user_id = $1
                      AND is_active = TRUE
                    `,
                    [req.user.userId]
                );


            if (
                providerResult.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Provider account was not found."
                });

            }


            if (
                String(provider_id) !==
                String(providerResult.rows[0].id)
            ) {

                return res.status(403).json({
                    message:
                        "You can only view your own appointments."
                });

            }

        }


        const result = await pool.query(
            `
            SELECT
                a.id,
                a.user_id,
                a.service_id,
                s.name AS service_name,
                c.name AS category_name,
                a.provider_id,
                p.provider_id AS provider_code,
                u.full_name AS provider_name,
                a.full_name AS student_name,
                a.phone,
                a.email,
                a.reason,
                a.status,
                a.appointment_date,
                a.appointment_time,
                a.rejection_reason,
                a.created_at,
                a.updated_at

            FROM appointments a

            INNER JOIN services s
                ON s.id = a.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            INNER JOIN providers p
                ON p.id = a.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            WHERE a.provider_id = $1

            ORDER BY
                a.appointment_date ASC,
                a.appointment_time ASC,
                a.created_at ASC
            `,
            [provider_id]
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get provider appointments error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve provider appointments."
        });

    }

}


/* Update Appointment */

async function updateAppointment(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            reason,
            appointment_date
        } = req.body;


        /* Validate Required Fields */

        if (
            !reason ||
            !String(reason).trim() ||
            !appointment_date
        ) {

            return res.status(400).json({
                message:
                    "Reason and appointment date are required."
            });

        }


        /* Load the student's pending appointment */

        const currentResult = await pool.query(
            `
            SELECT
                service_id,
                provider_id,
                status
            FROM appointments
            WHERE id = $1
              AND user_id = $2
            `,
            [
                id,
                req.user.userId
            ]
        );


        if (
            currentResult.rows.length === 0 ||
            currentResult.rows[0].status !== "pending"
        ) {

            return res.status(404).json({
                message:
                    "Appointment not found, does not belong to you, or cannot be updated because it is no longer pending."
            });

        }


        let appointmentTime;

        try {

            appointmentTime = await allocateAppointmentTime(
                currentResult.rows[0].service_id,
                currentResult.rows[0].provider_id,
                appointment_date,
                id
            );

        } catch (error) {

            return res.status(error.status || 409).json({
                message: error.message
            });

        }


        /* Update Only Student's Own Pending Appointment */

        const result = await pool.query(
            `
            UPDATE appointments
            SET
                                reason = $1,
                                appointment_date = $2,
                                appointment_time = $3,
                updated_at = CURRENT_TIMESTAMP
                        WHERE id = $4
                            AND user_id = $5
              AND status = 'pending'
            RETURNING
                id,
                user_id,
                service_id,
                provider_id,
                full_name,
                phone,
                email,
                reason,
                status,
                appointment_date,
                appointment_time,
                rejection_reason,
                created_at,
                updated_at
            `,
            [
                String(reason).trim(),
                appointment_date,
                appointmentTime,
                id,
                req.user.userId
            ]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Appointment not found, does not belong to you, or cannot be updated because it is no longer pending."
            });

        }


        res.status(200).json({
            message:
                "Appointment updated successfully.",
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update appointment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to update appointment."
        });

    }

}


/* Update Appointment Status */

async function updateAppointmentStatus(
    req,
    res
) {

    try {

        const {
            id
        } = req.params;


        const {
            status,
            rejection_reason
        } = req.body;


        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
            "completed",
            "cancelled"
        ];


        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({
                message:
                    "Invalid appointment status."
            });

        }


        /* Rejection Reason */

        if (
            status === "rejected" &&
            (
                !rejection_reason ||
                !String(rejection_reason).trim()
            )
        ) {

            return res.status(400).json({
                message:
                    "A rejection reason is required when rejecting an appointment."
            });

        }


        /* Get Current Appointment */

        const appointmentResult =
            await pool.query(
                `
                SELECT
                    id,
                    status,
                    provider_id
                FROM appointments
                WHERE id = $1
                `,
                [id]
            );


        if (
            appointmentResult.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Appointment not found."
            });

        }


        const appointment =
            appointmentResult.rows[0];


        /* Provider Ownership Check */

        if (
            req.user.role === "provider"
        ) {

            const providerResult =
                await pool.query(
                    `
                    SELECT
                        id
                    FROM providers
                    WHERE user_id = $1
                      AND is_active = TRUE
                    `,
                    [req.user.userId]
                );


            if (
                providerResult.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Provider account was not found."
                });

            }


            if (
                String(appointment.provider_id) !==
                String(providerResult.rows[0].id)
            ) {

                return res.status(403).json({
                    message:
                        "You can only update appointments assigned to you."
                });

            }

        }


        /* Validate Status Transition */

        const currentStatus =
            appointment.status;


        const validTransitions = {

            pending: [
                "approved",
                "rejected",
                "cancelled"
            ],

            approved: [
                "completed",
                "cancelled"
            ],

            rejected: [
                "cancelled"
            ],

            completed: [],

            cancelled: []

        };


        if (
            !validTransitions[currentStatus]
                .includes(status)
        ) {

            return res.status(400).json({
                message:
                    `Appointment cannot change from ${currentStatus} to ${status}.`
            });

        }


        const result = await pool.query(
            `
            UPDATE appointments
            SET
                status = $1::TEXT,
                rejection_reason =
                    CASE
                        WHEN $1::TEXT = 'rejected'
                            THEN $2
                        ELSE NULL
                    END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
              AND status = $4
            RETURNING
                id,
                user_id,
                service_id,
                provider_id,
                full_name,
                phone,
                email,
                reason,
                status,
                appointment_date,
                appointment_time,
                rejection_reason,
                created_at,
                updated_at
            `,
            [
                status,
                rejection_reason
                    ? String(rejection_reason).trim()
                    : null,
                id,
                currentStatus
            ]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(409).json({
                message:
                    "Appointment status could not be updated because it may have changed."
            });

        }


        res.status(200).json({
            message:
                "Appointment status updated successfully.",
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update appointment status error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to update appointment status."
        });

    }

}


/* Cancel Appointment */

async function cancelAppointment(req, res) {

    try {

        const {
            id
        } = req.params;


        /* Ownership Conditions */

        let ownershipCondition = "";
        let queryParams = [id];


        if (
            req.user.role === "student"
        ) {

            ownershipCondition =
                "AND user_id = $2";

            queryParams.push(
                req.user.userId
            );

        }


        if (
            req.user.role === "provider"
        ) {

            const providerResult =
                await pool.query(
                    `
                    SELECT
                        id
                    FROM providers
                    WHERE user_id = $1
                      AND is_active = TRUE
                    `,
                    [req.user.userId]
                );


            if (
                providerResult.rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        "Provider account was not found."
                });

            }


            ownershipCondition =
                "AND provider_id = $2";

            queryParams.push(
                providerResult.rows[0].id
            );

        }


        const result = await pool.query(
            `
            UPDATE appointments
            SET
                status = 'cancelled',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              ${ownershipCondition}
              AND status IN (
                  'pending',
                  'approved',
                  'rejected'
              )
            RETURNING
                id,
                user_id,
                service_id,
                provider_id,
                full_name,
                phone,
                email,
                reason,
                status,
                appointment_date,
                appointment_time,
                rejection_reason,
                created_at,
                updated_at
            `,
            queryParams
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Appointment not found, does not belong to you, or cannot be cancelled."
            });

        }


        res.status(200).json({
            message:
                "Appointment cancelled successfully.",
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Cancel appointment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to cancel appointment."
        });

    }

}


/* Delete Appointment */

async function deleteAppointment(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            DELETE FROM appointments
            WHERE id = $1
              AND status = 'cancelled'
            RETURNING
                id,
                user_id,
                service_id,
                provider_id,
                full_name,
                phone,
                email,
                reason,
                status,
                appointment_date,
                appointment_time,
                rejection_reason,
                created_at,
                updated_at
            `,
            [id]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Only cancelled appointments can be deleted."
            });

        }


        res.status(200).json({
            message:
                "Appointment deleted successfully.",
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Delete appointment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to delete appointment."
        });

    }

}


module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    getStudentAppointments,
    getProviderAppointments,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment
};