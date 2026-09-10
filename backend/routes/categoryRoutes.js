const express = require("express");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Service Category Routes */


/* Create Category */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    createCategory
);


/* Get All Categories */

router.get(
    "/",
    getCategories
);


/* Get One Category */

router.get(
    "/:id",
    getCategoryById
);


/* Update Category */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    updateCategory
);


/* Deactivate Category */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    deleteCategory
);


module.exports = router;