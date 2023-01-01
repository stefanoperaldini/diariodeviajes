'use strict';

const getDB = require('../DDBB/db');
const { generateError } = require('../utility');

/* 
  Middleware que comprueba que la entry pasada por path param exista 
*/
const entryExists = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // guardo el id de la entry
    const { id } = req.params;

    const [entry] = await connection.query(
      `
        SELECT id
        FROM entries
        WHERE id=?
      `,
      [id]
    );

    //console.log(user);
    if (entry.length === 0) {
      generateError('Entry no presente', 404);
    }

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = entryExists;
