const pool = require("../db");


/* Create Service */

async function createService(req, res) {

    try {

        const {
            category_id,
            name,
            special_name,
            location,
            status,
            availability,
            working_hours,
            information
        } = req.body;


        /* Validate Required Fields */

        if (
            !category_id ||
            !name ||
            !String(name).trim() ||
            !location ||
            !String(location).trim()
        ) {

            return res.status(400).json({
                message:
                    "Category, service name and location are required."
            });

        }


        /* Validate Category */

        const categoryResult = await pool.query(
            `
            SELECT
                id
            FROM service_categories
            WHERE id = $1
              AND is_active = TRUE
            `,
            [category_id]
        );


        if (categoryResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "The selected service category does not exist or is inactive."
            });

        }


        const serviceName =
            String(name).trim();

        const serviceLocation =
            String(location).trim();


        /* Create Service */

        const result = await pool.query(
            `
            INSERT INTO services
                (
                    category_id,
                    name,
                    special_name,
                    location,
                    status,
                    availability,
                    working_hours,
                    information
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    COALESCE($5, 'closed'),
                    $6,
                    $7,
                    $8
                )
            RETURNING
                id,
                category_id,
                name,
                special_name,
                location,
                status,
                availability,
                working_hours,
                information AS description,
                is_active,
                created_at,
                updated_at
            `,
            [
                category_id,
                serviceName,
                special_name || null,
                serviceLocation,
                status || null,
                availability || null,
                working_hours || null,
                information || null
            ]
        );


        res.status(201).json({
            message:
                "Service created successfully.",
            service: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create service error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "A service with this name already exists in the selected category."
            });

        }


        res.status(500).json({
            message:
                "Failed to create service."
        });

    }

}


/* Get All Services */

async function getServices(req, res) {

    try {

        const {
            category_id
        } = req.query;


        let query = `
            SELECT
                s.id,
                s.category_id,
                c.name AS category_name,
                s.name,
                s.special_name,
                s.location,
                s.status,
                s.availability,
                s.working_hours,
                s.information AS description,
                s.is_active,
                s.created_at,
                s.updated_at
            FROM services s
            INNER JOIN service_categories c
                ON c.id = s.category_id
            WHERE s.is_active = TRUE
        `;


        const values = [];


        /* Filter By Category */

        if (category_id) {

            query += `
                AND s.category_id = $1
            `;

            values.push(category_id);

        }


        query += `
            ORDER BY
                c.name ASC,
                s.name ASC
        `;


        const result = await pool.query(
            query,
            values
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get services error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve services."
        });

    }

}


/* Get One Service */

async function getServiceById(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                s.id,
                s.category_id,
                c.name AS category_name,
                s.name,
                s.special_name,
                s.location,
                s.status,
                s.availability,
                s.working_hours,
                s.information AS description,
                s.is_active,
                s.created_at,
                s.updated_at
            FROM services s
            INNER JOIN service_categories c
                ON c.id = s.category_id
            WHERE s.id = $1
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Service not found."
            });

        }


        res.status(200).json(
            result.rows[0]
        );


    } catch (error) {

        console.error(
            "Get service error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve service."
        });

    }

}


/* Update Service */

async function updateService(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            category_id,
            name,
            special_name,
            location,
            status,
            availability,
            working_hours,
            information,
            is_active
        } = req.body;


        /* Validate Required Fields */

        if (
            !category_id ||
            !name ||
            !String(name).trim() ||
            !location ||
            !String(location).trim()
        ) {

            return res.status(400).json({
                message:
                    "Category, service name and location are required."
            });

        }


        /* Validate Category */

        const categoryResult = await pool.query(
            `
            SELECT
                id
            FROM service_categories
            WHERE id = $1
              AND is_active = TRUE
            `,
            [category_id]
        );


        if (categoryResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "The selected service category does not exist or is inactive."
            });

        }


        const serviceName =
            String(name).trim();

        const serviceLocation =
            String(location).trim();


        /* Update Service */

        const result = await pool.query(
            `
            UPDATE services
            SET
                category_id = $1,
                name = $2,
                special_name = $3,
                location = $4,
                status = COALESCE($5, status),
                availability = $6,
                working_hours = $7,
                information = $8,
                is_active = COALESCE($9, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING
                id,
                category_id,
                name,
                special_name,
                location,
                status,
                availability,
                working_hours,
                information AS description,
                is_active,
                created_at,
                updated_at
            `,
            [
                category_id,
                serviceName,
                special_name || null,
                serviceLocation,
                status || null,
                availability || null,
                working_hours || null,
                information || null,
                is_active,
                id
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Service not found."
            });

        }


        res.status(200).json({
            message:
                "Service updated successfully.",
            service: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update service error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "A service with this name already exists in the selected category."
            });

        }


        res.status(500).json({
            message:
                "Failed to update service."
        });

    }

}


/* Delete / Deactivate Service */

async function deleteService(req, res) {

    try {

        const {
            id
        } = req.params;


        /*
         * Services are referenced by appointments
         * and provider assignments.
         * Deactivate instead of physically deleting.
         */

        const result = await pool.query(
            `
            UPDATE services
            SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING
                id,
                category_id,
                name,
                special_name,
                location,
                status,
                availability,
                working_hours,
                information AS description,
                is_active,
                created_at,
                updated_at
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Service not found."
            });

        }


        res.status(200).json({
            message:
                "Service deactivated successfully.",
            service: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Delete service error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to deactivate service."
        });

    }

}


module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
};