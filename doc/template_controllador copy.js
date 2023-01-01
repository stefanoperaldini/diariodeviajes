'use strict';

const getDB = require('../../DDBB/db');

const miControllador = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // CÓDIGO

    // creo usuario en el DB
    res.status(200).send({
      status: 'ok',
      message: 'miControllador',
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = miControllador;
