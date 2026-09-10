const express = require("express");

const {
    createProvider,
    getProviders,
    getProviderById,
    updateProviderAvailability,
    updateProvider,
    deleteProvider
} = require("../controllers/providerController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Provider Routes */


/* Create Provider */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    createProvider
);


/* Get All Providers */

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "provider",
        "service_manager",
        "appointment_officer",
        "admin"
    ),
    getProviders
);


/* Get One Provider */

router.get(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "provider",
        "service_manager",
        "appointment_officer",
        "admin"
    ),
    getProviderById
);


/* Update Provider Availability */

router.patch(
    "/:id/availability",
    authenticateToken,
    authorizeRoles(
        "provider",
        "service_manager",
        "admin"
    ),
    updateProviderAvailability
);


/* Update Provider */

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    updateProvider
);


/* Deactivate Provider */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    deleteProvider
);


module.exports = router;