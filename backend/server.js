const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const authRoutes =
    require("./routes/authRoutes");

const userRoutes =
    require("./routes/userRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");

const serviceRoutes =
    require("./routes/serviceRoutes");

const providerRoutes =
    require("./routes/providerRoutes");

const assignmentRoutes =
    require("./routes/assignmentRoutes");

const appointmentRoutes =
    require("./routes/appointmentRoutes");

const reportRoutes =
    require("./routes/reportRoutes");


const app = express();

const PORT = process.env.PORT || 5000;

/* JWT Configuration Check */

if (!process.env.JWT_SECRET) {

    console.error(
        "JWT_SECRET is not configured."
    );

    process.exit(1);

}


/* Middleware */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


/* API Routes */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/service-categories",
    categoryRoutes
);

app.use(
    "/api/services",
    serviceRoutes
);

app.use(
    "/api/providers",
    providerRoutes
);

app.use(
    "/api/assignments",
    assignmentRoutes
);

app.use(
    "/api/appointments",
    appointmentRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);


/* Test Route */

app.get("/", function (req, res) {

    res.json({
        message: "MUST ServiceConnect API is running."
    });

});


/* Database Test Route */

app.get("/api/test-db", async function (req, res) {

    try {

        const result = await pool.query(
            "SELECT NOW() AS current_time"
        );

        res.json({
            message: "Database connection successful.",
            time: result.rows[0].current_time
        });

    } catch (error) {

        console.error(
            "Database test error:",
            error.message
        );

        res.status(500).json({
            message: "Database connection failed.",
            error: error.message
        });

    }

});


/* 404 Handler */

app.use(function (req, res) {

    res.status(404).json({
        message: "API route not found."
    });

});


/* Global Error Handler */

app.use(function (error, req, res, next) {

    console.error(
        "Server error:",
        error.message
    );

    res.status(500).json({
        message: "Internal server error."
    });

});


/* Start Server */

app.listen(PORT, function () {

    console.log(
        `MUST ServiceConnect API running on port ${PORT}`
    );

});