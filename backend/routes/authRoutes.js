const express = require("express");

const {
    registerStudent,
    loginUser,
    getCurrentUser
} = require("../controllers/authController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


const router = express.Router();


/* Authentication Routes */


/* Login */

router.post(
    "/login",
    loginUser
);


/* Public Student Registration */

router.post(
    "/register",
    registerStudent
);


/* Get Current Logged-In User */

router.get(
    "/me",
    authenticateToken,
    getCurrentUser
);


module.exports = router;