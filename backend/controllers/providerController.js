const pool = require("../db");


/* Create Provider */

async function createProvider(req, res) {

    try {

        const {
            user_id,
            provider_id,
            availability
        } = req.body;


        /* Validate Required Fields */

        if (
            !user_id ||
            !provider_id ||
            !String(provider_id).trim()
        ) {

            return res.status(400).json({
                message:
                    "User ID and Provider ID are required."
            });

        }


        /* Validate User */

        const userResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                email,
                phone,
                role,
                is_active
            FROM users
            WHERE id = $1
              AND role = 'provider'
            `,
            [user_id]
        );


        if (userResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "The selected user does not exist or is not a provider."
            });

        }


        if (!userResult.rows[0].is_active) {

            return res.status(400).json({
                message:
                    "The selected provider user account is inactive."
            });

        }


        const providerId =
            String(provider_id).trim();


        /* Validate Availability */

        const allowedAvailability = [
            "available",
            "busy",
            "away",
            "closed"
        ];

        const providerAvailability =
            availability || "away";


        if (
            !allowedAvailability.includes(
                providerAvailability
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid provider availability."
            });

        }


        /* Create Provider */

        const result = await pool.query(
            `
            INSERT INTO providers
                (
                    user_id,
                    provider_id,
                    availability
                )
            VALUES
                (
                    $1,
                    $2,
                    $3
                )
            RETURNING
                id,
                user_id,
                provider_id,
                is_active,
                availability,
                created_at,
                updated_at
            `,
            [
                user_id,
                providerId,
                providerAvailability
            ]
        );


        res.status(201).json({
            message:
                "Provider created successfully.",
            provider: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create provider error:",
            error.message
        );


        if (error.code === "23505") {

            if (
                error.constraint ===
                "providers_user_id_key"
            ) {

                return res.status(409).json({
                    message:
                        "This user is already registered as a provider."
                });

            }


            if (
                error.constraint ===
                "providers_provider_id_key"
            ) {

                return res.status(409).json({
                    message:
                        "A provider with this Provider ID already exists."
                });

            }


            return res.status(409).json({
                message:
                    "A provider with the provided information already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to create provider."
        });

    }

}


/* Get All Providers */

async function getProviders(req, res) {

    try {

        let query = `
            SELECT
                p.id,
                p.user_id,
                p.provider_id,
                u.full_name,
                u.email,
                u.phone,
                p.availability,
                p.is_active,
                p.created_at,
                p.updated_at
            FROM providers p
            INNER JOIN users u
                ON u.id = p.user_id
        `;

        let queryParams = [];


        /* Provider Ownership */

        if (
            req.user.role === "provider"
        ) {

            query += `
                WHERE p.user_id = $1
            `;

            queryParams.push(
                req.user.userId
            );

        }


        query += `
            ORDER BY
                u.full_name ASC
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
            "Get providers error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve providers."
        });

    }

}

/* Get One Provider */

async function getProviderById(req, res) {

    try {

        const {
            id
        } = req.params;


        let query = `
            SELECT
                p.id,
                p.user_id,
                p.provider_id,
                u.full_name,
                u.email,
                u.phone,
                p.availability,
                p.is_active,
                p.created_at,
                p.updated_at
            FROM providers p
            INNER JOIN users u
                ON u.id = p.user_id
            WHERE p.id = $1
        `;

        let queryParams = [id];


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


        const result = await pool.query(
            query,
            queryParams
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Provider not found."
            });

        }


        res.status(200).json(
            result.rows[0]
        );


    } catch (error) {

        console.error(
            "Get provider error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve provider."
        });

    }

}

/* Update Provider */

async function updateProvider(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            provider_id,
            availability,
            is_active
        } = req.body;


        /* Validate Provider ID */

        if (
            !provider_id ||
            !String(provider_id).trim()
        ) {

            return res.status(400).json({
                message:
                    "Provider ID is required."
            });

        }


        const providerId =
            String(provider_id).trim();


        /* Validate Availability */

        const allowedAvailability = [
            "available",
            "busy",
            "away",
            "closed"
        ];


        if (
            availability &&
            !allowedAvailability.includes(
                availability
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid provider availability."
            });

        }


        const result = await pool.query(
            `
            UPDATE providers
            SET
                provider_id = $1,
                availability =
                    COALESCE($2, availability),
                is_active =
                    COALESCE($3, is_active),
                updated_at =
                    CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING
                id,
                user_id,
                provider_id,
                is_active,
                availability,
                created_at,
                updated_at
            `,
            [
                providerId,
                availability || null,
                is_active,
                id
            ]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Provider not found."
            });

        }


        res.status(200).json({
            message:
                "Provider updated successfully.",
            provider: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update provider error:",
            error.message
        );


        if (error.code === "23505") {

            return res.status(409).json({
                message:
                    "A provider with this Provider ID already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to update provider."
        });

    }

}


/* Update Provider Availability */

async function updateProviderAvailability(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            availability
        } = req.body;


        const allowedAvailability = [
            "available",
            "busy",
            "away",
            "closed"
        ];


        if (
            !availability ||
            !allowedAvailability.includes(
                availability
            )
        ) {

            return res.status(400).json({
                message:
                    "A valid availability status is required."
            });

        }


        /* Provider Ownership */

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
                String(id) !==
                String(providerResult.rows[0].id)
            ) {

                return res.status(403).json({
                    message:
                        "You can only update your own availability."
                });

            }

        }


        const result = await pool.query(
            `
            UPDATE providers
            SET
                availability = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
              AND is_active = TRUE
            RETURNING
                id,
                user_id,
                provider_id,
                is_active,
                availability,
                created_at,
                updated_at
            `,
            [
                availability,
                id
            ]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "Provider not found."
            });

        }


        res.status(200).json({
            message:
                "Provider availability updated successfully.",
            provider: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update provider availability error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to update provider availability."
        });

    }

}

/* Deactivate Provider */

async function deleteProvider(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            UPDATE providers
            SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING
                id,
                user_id,
                provider_id,
                is_active,
                availability,
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
                    "Provider not found."
            });

        }


        res.status(200).json({
            message:
                "Provider deactivated successfully.",
            provider: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Deactivate provider error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to deactivate provider."
        });

    }

}


module.exports = {
    createProvider,
    getProviders,
    getProviderById,
    updateProvider,
    updateProviderAvailability,
    deleteProvider
};