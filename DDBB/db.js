'use strict';

const mysql = require('mysql2/promise');

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

let pool;

/* 
  Función que crea un pool de connecciones al DB (si no existe)
  y devuelve una connección 
*/
async function getDB() {
  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 10,
      host: MYSQL_HOST, //IP de mysql
      user: MYSQL_USER, //usuario mysql
      password: MYSQL_PASSWORD, // pwd usuario mysql
      database: MYSQL_DATABASE, // nombre DB
      timezone: 'Z',
    });
  }
  return await pool.getConnection();
}

module.exports = getDB;
