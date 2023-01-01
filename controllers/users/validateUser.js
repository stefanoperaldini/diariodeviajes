'use strict';

const getDB = require('../../DDBB/db');
const { generateError } = require('../../utility');

const validateUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // CÓDIGO
    const { registrationCode } = req.params;

    // console.log(req.params);
    // console.log(registrationCode);

    // comprobamos que exista un usuario con este regCode
    const [user] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE regCode = ?
    `,
      [registrationCode]
    );

    // si no existe: error
    if (user.length === 0) {
      generateError('Ningún usuario con este código de validación', 404);
    }

    // activo el usuario y borro regCode
    await connection.query(
      `
      UPDATE users
      SET active=true, regCode=NULL
      WHERE regCode = ?
    `,
      [registrationCode]
    );

    // creo usuario en el DB
    res.status(200).send({
      status: 'ok',
      message: 'Usuario validado',
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = validateUser;
