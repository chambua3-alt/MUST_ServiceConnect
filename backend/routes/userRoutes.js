const express = require("express");

const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* User Routes */


/* Create User */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    createUser
);


/* Get All Users */

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    getUsers
);


/* Get One User */

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    getUserById
);


/* Update User */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    updateUser
);


/* Deactivate User */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "admin"
    ),
    deleteUser
);


module.exports = router;