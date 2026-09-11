const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


/* Public Student Registration */

async function registerStudent(req, res) {

    try {

        const {
            user_id,
            full_name,
            email,
            phone,
            password
        } = req.body;

        if (
            !user_id ||
            !/^\d{14}$/.test(String(user_id).trim()) ||
            !full_name ||
            !String(full_name).trim() ||
            !email ||
            !String(email).trim() ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Student ID, full name, email and password are required."
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `
            INSERT INTO users
                (user_id, full_name, email, phone, password_hash, role)
            VALUES
                ($1, $2, $3, $4, $5, 'student')
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
                String(user_id).trim(),
                String(full_name).trim(),
                String(email).trim().toLowerCase(),
                phone ? String(phone).trim() : null,
                passwordHash
            ]
        );

        res.status(201).json({
            message: "Student account created successfully.",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Student registration error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                message:
                    "A user with that Student ID or email already exists."
            });
        }

        res.status(500).json({
            message: "Failed to create student account."
        });
    }

}


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


        /* Verify the bcrypt hash created during registration. */

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );


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
    registerStudent,
    loginUser,
    getCurrentUser
};