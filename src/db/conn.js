const { Sequelize } = require("sequelize")
const { createPool } = require("mysql2")

const isDevelopment = process.env.DEVELOPMENT == "true";

const conn_option = {
    database: isDevelopment ? process.env.DB_NAME : process.env.MYSQL_ADDON_DB,
    username: isDevelopment ? process.env.DB_USER : process.env.MYSQL_ADDON_USER,
    password: isDevelopment ? process.env.DB_PWD : process.env.MYSQL_ADDON_PASSWORD,
    host: isDevelopment ? process.env.DB_HOST : process.env.MYSQL_ADDON_HOST,
    port: isDevelopment ? process.env.DB_PORT : process.env.MYSQL_ADDON_PORT,
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