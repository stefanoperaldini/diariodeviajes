'use strict';

const getDB = require('../../DDBB/db');
const { generateError } = require('../../utility');

const modifyEntry = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // id entry
    const { id } = req.params;

    // Comprobar que los datos mínimos vienen en el body
    const { place, description } = req.body;

    if (!place || !description) {
      generateError('Faltan campos', 400);
    }

    // actualizo entry
    await connection.query(
      `UPDATE entries SET place=?, description=? WHERE id=?`,
      [place, description, id]
    );

    // Devolver una respuesta
    res.send({
      status: 'ok',
      message: 'Entry modificada',
      data: {
        id,
        place,
        description,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = modifyEntry;
