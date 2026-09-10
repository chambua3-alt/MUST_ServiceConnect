const jwt = require("jsonwebtoken");
const pool = require("../db");


/* Authenticate JWT Token */

async function authenticateToken(req, res, next) {

    try {

        const authHeader =
            req.headers.authorization;


        /* Check Authorization Header */

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                message:
                    "Authentication token is required."
            });

        }


        /* Extract Token */

        const token =
            authHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({
                message:
                    "Authentication token is required."
            });

        }


        /* Verify Token */

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        /* Verify User Account */

        const userResult =
            await pool.query(
                `
                SELECT
                    id,
                    user_id,
                    role,
                    is_active
                FROM users
                WHERE id = $1
                `,
                [decoded.userId]
            );


        if (
            userResult.rows.length === 0
        ) {

            return res.status(401).json({
                message:
                    "User account was not found."
            });

        }


        const user =
            userResult.rows[0];


        /* Check Account Status */

        if (
            !user.is_active
        ) {

            return res.status(403).json({
                message:
                    "Your account is inactive."
            });

        }


        /* Attach Current User Information */

        req.user = {
            userId: user.id,
            user_id: user.user_id,
            role: user.role
        };


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        if (
            error.name === "TokenExpiredError"
        ) {

            return res.status(401).json({
                message:
                    "Authentication token has expired."
            });

        }


        if (
            error.name === "JsonWebTokenError"
        ) {

            return res.status(401).json({
                message:
                    "Invalid authentication token."
            });

        }


        res.status(401).json({
            message:
                "Authentication failed."
        });

    }

}


module.exports = {
    authenticateToken
};