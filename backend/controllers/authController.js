const pool = require("../db");
const jwt = require("jsonwebtoken");


/* Login User */

async function loginUser(req, res) {

    try {

        const {
            login,
            email,
            user_id,
            password
        } = req.body;

        const loginInput =
            login || email || user_id;


        /* Validate Required Fields */

        if (
            !loginInput ||
            !String(loginInput).trim() ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "User ID or email and password are required."
            });

        }


        const loginValue =
            String(loginInput).trim();


        /* Find User */

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                full_name,
                email,
                phone,
                password_hash,
                role,
                is_active
            FROM users
            WHERE
                LOWER(email) = LOWER($1)
                OR user_id::TEXT = $1
            LIMIT 1
            `,
            [loginValue]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(401).json({
                message:
                    "Invalid login credentials."
            });

        }


        const user =
            result.rows[0];


        /* Check Account Status */

        if (!user.is_active) {

            return res.status(403).json({
                message:
                    "Your account is inactive. Please contact the administrator."
            });

        }


        /* Verify PostgreSQL crypt() hashes, including bcrypt hashes. */

        const passwordResult = await pool.query(
            `SELECT crypt($1, $2) = $2 AS password_match`,
            [password, user.password_hash]
        );

        const passwordMatch =
            passwordResult.rows[0].password_match;


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid login credentials."
            });

        }


        /* Create JWT Token */

const token =
    jwt.sign(
        {
            userId: user.id,
            user_id: user.user_id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );


/* Remove Password Hash */

delete user.password_hash;


/* Login Response */

res.status(200).json({
    message:
        "Login successful.",
    token,
    user
});


    } catch (error) {

        console.error(
            "Login error:",
            error.message
        );


        res.status(500).json({
            message:
                "Login failed."
        });

    }

}


/* Get Current User */

async function getCurrentUser(req, res) {

    try {

        const {
            userId
        } = req.user;


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
              AND is_active = TRUE
            `,
            [userId]
        );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                message:
                    "User account not found."
            });

        }


        res.status(200).json({
            user: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Get current user error:",
            error.message
        );


        res.status(500).json({
            message:
                "Failed to retrieve current user."
        });

    }

}


module.exports = {
    loginUser,
    getCurrentUser
};