'use strict';

// script que ejecutaremos, desde la root del proyecto (donde está el .env), con:
// node ./DDBB/initDB.js

require('dotenv').config();

const getDB = require('./db');

let connection;

async function main() {
  try {
    connection = await getDB();

    // ELIMINO LAS TABLAS
    console.log('Elimino tablas....');
    await connection.query(`DROP TABLE IF EXISTS photos`);
    await connection.query(`DROP TABLE IF EXISTS votes`);
    await connection.query(`DROP TABLE IF EXISTS entries`);
    await connection.query(`DROP TABLE IF EXISTS users`);

    // CREO LAS TABLAS
    console.log('Creando tablas....');
    await connection.query(`
            CREATE TABLE users (
                id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(512) NOT NULL,
                name VARCHAR(100),
                avatar VARCHAR(100),
                active BOOLEAN DEFAULT false,
                role ENUM("admin", "normal") DEFAULT "normal" NOT NULL,
                regCode CHAR(36),
                deleted BOOLEAN DEFAULT false,
                lastAuthUpdate DATETIME,
                recoverCode CHAR(36)
            );
    `);
    await connection.query(`
            CREATE TABLE entries (
                id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                place VARCHAR(100) NOT NULL,
                description TEXT,
                user_id INT UNSIGNED NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
    `);

    await connection.query(`
            CREATE TABLE photos (
                id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                photo VARCHAR(100) NOT NULL,
                entry_id INT UNSIGNED NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES entries(id)
            );
    `);

    await connection.query(`
        CREATE TABLE votes (
            id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            vote TINYINT NOT NULL CHECK (vote IN (1,2,3,4,5)),
            user_id INT UNSIGNED NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            entry_id INT UNSIGNED NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id),
            UNIQUE (user_id, entry_id)
        );
    `);

    // Creo desde código el usuario admin
    console.log('Creo usuario admin');
    await connection.query(`
                INSERT INTO users(email, password, name, active, role)
                VALUES (
                    "${process.env.USER_ADMIN_EMAIL}",
                    SHA2("${process.env.USER_ADMIN_PWD}", 512),
                    "${process.env.USER_ADMIN_NAME}",
                    true, 
                    "admin"
                )
        `);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

main();
