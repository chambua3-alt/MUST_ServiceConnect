const express = require("express");

const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require("../controllers/serviceController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Service Routes */


/* Create Service */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    createService
);


/* Get All Services / Filter By Category */

router.get(
    "/",
    getServices
);


/* Get One Service */

router.get(
    "/:id",
    getServiceById
);


/* Update Service */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    updateService
);


/* Deactivate Service */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    deleteService
);


module.exports = router;