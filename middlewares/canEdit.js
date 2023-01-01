'use strict';

const getDB = require('../DDBB/db');
const { generateError } = require('../utility');

/* 
  Middleware que comprueba si puedo editar la entrada (si soy admin o es mia)
*/
const canEdit = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // guardo el id de la entry
    const { id } = req.params;

    const [entry] = await connection.query(
      `
        SELECT user_id
        FROM entries
        WHERE id=?
      `,
      [id]
    );

    // salgo con error si el usuario logueado no es el mismo que creó la entry o no tiene role de admin
    if (req.userInfo.id !== entry[0].user_id && req.userInfo.role !== 'admin') {
      generateError('No tienes los permisos sobre esta entry', 401);
    }

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = canEdit;
