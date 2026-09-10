const pool = require("../db");


/* Create Provider-Service Assignment */

async function createAssignment(req, res) {

    try {

        const {
            provider_id,
            service_id
        } = req.body;


        /* Validate Required Fields */

        if (
            !provider_id ||
            !service_id
        ) {

            return res.status(400).json({
                message:
                    "Provider ID and Service ID are required."
            });

        }


        /* Validate Provider */

        const providerResult = await pool.query(
            `
            SELECT
                id,
                provider_id,
                is_active
            FROM providers
            WHERE id = $1
              AND is_active = TRUE
            `,
            [provider_id]
        );


        if (
            providerResult.rows.length === 0
        ) {

            return res.status(400).json({
                message:
                    "The selected provider does not exist or is inactive."
            });

        }


        /* Validate Service */

        const serviceResult = await pool.query(
            `
            SELECT
                id,
                name,
                is_active
            FROM services
            WHERE id = $1
              AND is_active = TRUE
            `,
            [service_id]
        );


        if (
            serviceResult.rows.length === 0
        ) {

            return res.status(400).json({
                message:
                    "The selected service does not exist or is inactive."
            });

        }


        /* Create Assignment */

        const result = await pool.query(
            `
            INSERT INTO provider_services
                (
                    provider_id,
                    service_id
                )
            VALUES
                (
                    $1,
                    $2
                )
            RETURNING
                id,
                provider_id,
                service_id,
                assigned_at
            `,
            [
                provider_id,
                service_id
            ]
        );


        res.status(201).json({
            message:
                "Provider assigned to service successfully.",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create assignment error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "This provider is already assigned to this service."
            });

        }


        res.status(500).json({
            message:
                "Failed to assign provider to service."
        });

    }

}


/* Get All Provider-Service Assignments */

async function getAssignments(req, res) {

    try {

        const result = await pool.query(
            `
            SELECT
                ps.id,
                ps.provider_id,
                p.provider_id AS provider_code,
                p.user_id,
                u.full_name AS provider_name,
                ps.service_id,
                s.name AS service_name,
                c.name AS category_name,
                p.availability AS provider_status,
                p.is_active AS provider_active,
                s.is_active AS service_active,
                ps.assigned_at
            FROM provider_services ps

            INNER JOIN providers p
                ON p.id = ps.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            INNER JOIN services s
                ON s.id = ps.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            ORDER BY
                u.full_name ASC,
                s.name ASC
            `
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get assignments error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve provider assignments."
        });

    }

}


/* Get Assignments By Provider */

async function getAssignmentsByProvider(
    req,
    res
) {

    try {

        const {
            provider_id
        } = req.params;


        let query = `
            SELECT
                ps.id,
                ps.provider_id,
                p.provider_id AS provider_code,
                p.user_id,
                u.full_name AS provider_name,
                ps.service_id,
                s.name AS service_name,
                c.name AS category_name,
                s.location,
                s.status AS service_status,
                s.availability AS service_availability,
                p.availability AS provider_status,
                ps.assigned_at
            FROM provider_services ps

            INNER JOIN providers p
                ON p.id = ps.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            INNER JOIN services s
                ON s.id = ps.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            WHERE ps.provider_id = $1
        `;

        let queryParams = [
            provider_id
        ];


        /* Provider Ownership */

        if (
            req.user.role === "provider"
        ) {

            query += `
                AND p.user_id = $2
            `;

            queryParams.push(
                req.user.userId
            );

        }


        query += `
            ORDER BY
                s.name ASC
        `;


        const result = await pool.query(
            query,
            queryParams
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get provider assignments error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve provider assignments."
        });

    }

}


/* Get Assignments By Service */

async function getAssignmentsByService(
    req,
    res
) {

    try {

        const {
            service_id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                ps.id,
                ps.provider_id,
                p.provider_id AS provider_code,
                p.user_id,
                u.full_name AS provider_name,
                ps.service_id,
                s.name AS service_name,
                c.name AS category_name,
                p.availability AS provider_status,
                p.is_active AS provider_active,
                ps.assigned_at
            FROM provider_services ps

            INNER JOIN providers p
                ON p.id = ps.provider_id

            INNER JOIN users u
                ON u.id = p.user_id

            INNER JOIN services s
                ON s.id = ps.service_id

            INNER JOIN service_categories c
                ON c.id = s.category_id

            WHERE ps.service_id = $1

            ORDER BY
                u.full_name ASC
            `,
            [service_id]
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get service providers error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve service providers."
        });

    }

}


/* Delete Provider-Service Assignment */

async function deleteAssignment(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            DELETE FROM provider_services
            WHERE id = $1
            RETURNING
                id,
                provider_id,
                service_id,
                assigned_at
            `,
            [id]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Provider-service assignment not found."
            });

        }


        res.status(200).json({
            message:
                "Provider assignment removed successfully.",
            assignment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Delete assignment error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to remove provider assignment."
        });

    }

}


module.exports = {
    createAssignment,
    getAssignments,
    getAssignmentsByProvider,
    getAssignmentsByService,
    deleteAssignment
};