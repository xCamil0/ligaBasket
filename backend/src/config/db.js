/**
 * db.js — Configuración del pool de conexiones a PostgreSQL.
 * Usa variables de entorno para credenciales.
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Error conectando a la DB:', err.stack);
    } else {
        console.log('Base de Datos conectada y lista');
    }
});

module.exports = pool;