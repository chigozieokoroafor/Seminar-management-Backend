require("dotenv").config()
const { Sequelize } = require("sequelize")
const { createPool } = require("mysql2")

const isDevelopment = process.env.DEVELOPMENT == "true";

const conn_option = {
    database: process.env.DB_NAME ,
    username: process.env.DB_USER ,
    password: process.env.DB_PWD ,
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT ,
    dialect: 'mysql',
    logging: isDevelopment, // ensure this is a boolean
};
const conn = new Sequelize(conn_option)


const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PWD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    conn,
    pool
}