const pool = require("../db");
const bcrypt = require("bcryptjs");


/* Create User */

async function createUser(req, res) {

    try {

        const {
            user_id,
            full_name,
            email,
            phone,
            password,
            role
        } = req.body;


        /* Validate Required Fields */

        if (
            !user_id ||
            !full_name ||
            !String(full_name).trim() ||
            !email ||
            !String(email).trim() ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                message:
                    "User ID, full name, email, password and role are required."
            });

        }


        /* Validate User ID */

        const userId =
            String(user_id).trim();

        if (!/^\d{14}$/.test(userId)) {

            return res.status(400).json({
                message:
                    "User ID must contain exactly 14 digits."
            });

        }


        /* Validate Role */

        const allowedRoles = [
            "student",
            "provider",
            "service_manager",
            "appointment_officer",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                message:
                    "Invalid user role."
            });

        }


        /* Validate Password */

        if (String(password).length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });

        }


        const userEmail =
            String(email)
                .trim()
                .toLowerCase();

        const userName =
            String(full_name).trim();


        /* Hash Password */

        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        /* Create User */

        const result = await pool.query(
            `
            INSERT INTO users
                (
                    user_id,
                    full_name,
                    email,
                    phone,
                    password_hash,
                    role
                )
            VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
            RETURNING
                id,
                user_id,
                full_name,
                email,
                phone,
                role,
                is_active,
                created_at,
                updated_at
            `,
            [
                userId,
                userName,
                userEmail,
                phone || null,
                passwordHash,
                role
            ]
        );


        res.status(201).json({
            message:
                "User created successfully.",
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Create user error:",
            error.message
        );


        /* Duplicate User ID / Email */

        if (error.code === "23505") {

            if (
                error.constraint ===
                "users_user_id_key"
            ) {

                return res.status(409).json({
                    message:
                        "A user with this User ID already exists."
                });

            }


            if (
                error.constraint ===
                "users_email_unique"
            ) {

                return res.status(409).json({
                    message:
                        "A user with this email already exists."
                });

            }


            return res.status(409).json({
                message:
                    "A user with the provided information already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to create user."
        });

    }

}


/* Get All Users */

async function getUsers(req, res) {

    try {

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                email,
                phone,
                role,
                is_active,
                created_at,
                updated_at
            FROM users
            ORDER BY
                id DESC
            `
        );


        res.status(200).json(
            result.rows
        );


    } catch (error) {

        console.error(
            "Get users error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve users."
        });

    }

}


/* Get One User */

async function getUserById(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                email,
                phone,
                role,
                is_active,
                created_at,
                updated_at
            FROM users
            WHERE id = $1
            `,
            [id]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }


        res.status(200).json(
            result.rows[0]
        );


    } catch (error) {

        console.error(
            "Get user error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve user."
        });

    }

}


/* Update User */

async function updateUser(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            user_id,
            full_name,
            email,
            phone,
            password,
            role,
            is_active
        } = req.body;


        /* Validate Required Fields */

        if (
            !user_id ||
            !full_name ||
            !String(full_name).trim() ||
            !email ||
            !String(email).trim() ||
            !role
        ) {

            return res.status(400).json({
                message:
                    "User ID, full name, email and role are required."
            });

        }


        /* Validate User ID */

        const userId =
            String(user_id).trim();

        if (!/^\d{14}$/.test(userId)) {

            return res.status(400).json({
                message:
                    "User ID must contain exactly 14 digits."
            });

        }


        /* Validate Role */

        const allowedRoles = [
            "student",
            "provider",
            "service_manager",
            "appointment_officer",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {

            return res.status(400).json({
                message:
                    "Invalid user role."
            });

        }


        const userEmail =
            String(email)
                .trim()
                .toLowerCase();

        const userName =
            String(full_name).trim();


        let result;


        /* Update With New Password */

        if (
            password &&
            String(password).length > 0
        ) {

            if (
                String(password).length < 6
            ) {

                return res.status(400).json({
                    message:
                        "Password must contain at least 6 characters."
                });

            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            result = await pool.query(
                `
                UPDATE users
                SET
                    user_id = $1,
                    full_name = $2,
                    email = $3,
                    phone = $4,
                    password_hash = $5,
                    role = $6,
                    is_active = COALESCE($7, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING
                    id,
                    user_id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    userId,
                    userName,
                    userEmail,
                    phone || null,
                    passwordHash,
                    role,
                    is_active,
                    id
                ]
            );

        } else {

            /* Update Without Changing Password */

            result = await pool.query(
                `
                UPDATE users
                SET
                    user_id = $1,
                    full_name = $2,
                    email = $3,
                    phone = $4,
                    role = $5,
                    is_active = COALESCE($6, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING
                    id,
                    user_id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    userId,
                    userName,
                    userEmail,
                    phone || null,
                    role,
                    is_active,
                    id
                ]
            );

        }


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "User not found."
            });

        }


        res.status(200).json({
            message:
                "User updated successfully.",
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Update user error:",
            error.message
        );


        /* Duplicate User ID / Email */

        if (error.code === "23505") {

            if (
                error.constraint ===
                "users_user_id_key"
            ) {

                return res.status(409).json({
                    message:
                        "A user with this User ID already exists."
                });

            }


            if (
                error.constraint ===
                "users_email_unique"
            ) {

                return res.status(409).json({
                    message:
                        "A user with this email already exists."
                });

            }


            return res.status(409).json({
                message:
                    "A user with the provided information already exists."
            });

        }


        res.status(500).json({
            message:
                "Failed to update user."
        });

    }

}


/* Deactivate User */

async function deleteUser(req, res) {

    try {

        const {
            id
        } = req.params;


        const result = await pool.query(
            `
            UPDATE users
            SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING
                id,
                user_id,
                full_name,
                email,
                phone,
                role,
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
                    "User not found."
            });

        }


        res.status(200).json({
            message:
                "User deactivated successfully.",
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Deactivate user error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to deactivate user."
        });

    }

}


module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};