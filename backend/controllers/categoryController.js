const pool = require("../db");


/* Create Service Category */

async function createCategory(req, res) {

    try {

        const {
            name,
            description
        } = req.body;


        /* Validate Name */

        if (
            !name ||
            !String(name).trim()
        ) {

            return res.status(400).json({
                message: "Category name is required."
            });

        }


        const categoryName =
            String(name).trim();


        /* Create Category */

        const result = await pool.query(
            `
            INSERT INTO service_categories
                (name, description)
            VALUES
                ($1, $2)
            RETURNING
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
            `,
            [
                categoryName,
                description || null
            ]
        );


        res.status(201).json({
            message: "Service category created successfully.",
            category: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create category error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "A service category with this name already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to create service category."
        });

    }

}


/* Get All Service Categories */

async function getCategories(req, res) {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
            FROM service_categories
            ORDER BY name ASC
            `
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get categories error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve service categories."
        });

    }

}


/* Get One Service Category */

async function getCategoryById(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
            FROM service_categories
            WHERE id = $1
            `,
            [id]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Service category not found."
            });

        }


        res.status(200).json(
            result.rows[0]
        );


    } catch (error) {

        console.error(
            "Get category error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve service category."
        });

    }

}


/* Update Service Category */

async function updateCategory(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            name,
            description,
            is_active
        } = req.body;


        if (
            !name ||
            !String(name).trim()
        ) {

            return res.status(400).json({
                message:
                    "Category name is required."
            });

        }


        const categoryName =
            String(name).trim();


        const result = await pool.query(
            `
            UPDATE service_categories
            SET
                name = $1,
                description = $2,
                is_active = COALESCE($3, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING
                id,
                name,
                description,
                is_active,
                created_at,
                updated_at
            `,
            [
                categoryName,
                description || null,
                is_active,
                id
            ]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Service category not found."
            });

        }


        res.status(200).json({
            message:
                "Service category updated successfully.",
            category: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update category error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "A service category with this name already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to update service category."
        });

    }

}


/* Delete / Deactivate Service Category */

async function deleteCategory(req, res) {

    try {

        const {
            id
        } = req.params;


        /*
         * Services depend on categories.
         * Therefore, deactivate the category
         * instead of physically deleting it.
         */

        const result = await pool.query(
            `
            UPDATE service_categories
            SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING
                id,
                name,
                description,
                is_active,
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
                    "Service category not found."
            });

        }


        res.status(200).json({
            message:
                "Service category deactivated successfully.",
            category: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Delete category error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to deactivate service category."
        });

    }

}


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};