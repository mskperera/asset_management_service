const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.CONNECTION_MAIN_DB_HOST,
  user: process.env.CONNECTION_MAIN_DB_USERNAME,
  password: process.env.CONNECTION_MAIN_DB_PASSWORD,
  database: process.env.CONNECTION_MAIN_DB_NAME,
  port: process.env.CONNECTION_MAIN_DB_SERVER_PORT,
});

module.exports = pool;
