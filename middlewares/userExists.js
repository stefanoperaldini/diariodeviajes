'use strict';

const getDB = require('../DDBB/db');
const { generateError } = require('../utility');

/* 
  Middleware que comprueba que el usuario pasado por path param exista 
*/
const userExists = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    const { id } = req.params;

    const [user] = await connection.query(
      `
        SELECT id
        FROM users
        WHERE id=?
      `,
      [id]
    );

    //console.log(user);
    if (user.length === 0) {
      generateError('Usuario no presente', 404);
    }

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = userExists;
