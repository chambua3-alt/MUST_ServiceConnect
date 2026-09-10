const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => {
        console.log("Connected to Neon PostgreSQL successfully!");
    })
    .catch((error) => {
        console.error("Database connection failed:", error.message);
    });

module.exports = pool;