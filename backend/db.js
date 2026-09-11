const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on("error", function (error) {
    console.error(
        "Unexpected database pool error:",
        error.message
    );
});

pool.query("SELECT 1")
    .then(() => {
        console.log("Connected to Neon PostgreSQL successfully!");
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });

module.exports = pool;