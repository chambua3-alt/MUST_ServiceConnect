const express = require("express");

const {
    createAssignment,
    getAssignments,
    getAssignmentsByProvider,
    getAssignmentsByService,
    deleteAssignment
} = require("../controllers/assignmentController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* Provider-Service Assignment Routes */


/* Create Assignment */

router.post(
    "/",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    createAssignment
);


/* Get All Assignments */

router.get(
    "/",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    getAssignments
);


/* Get Assignments By Provider */

router.get(
    "/provider/:provider_id",
    authenticateToken,
    authorizeRoles(
        "provider",
        "service_manager",
        "admin"
    ),
    getAssignmentsByProvider
);


/* Get Assignments By Service */

router.get(
    "/service/:service_id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    getAssignmentsByService
);


/* Remove Assignment */

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles(
        "service_manager",
        "admin"
    ),
    deleteAssignment
);


module.exports = router;