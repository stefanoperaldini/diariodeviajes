'use strict';

const jwt = require('jsonwebtoken');
const getDB = require('../DDBB/db');

const { generateError } = require('../utility');

/* 
  Middleware check JWT
*/
const isUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();
    const { authorization } = req.headers;

    // Compruebo que la petición tenga en el header el token
    if (!authorization) {
      generateError('Falta cabecera de autorización', 401);
    }

    let tokenInfo;
    try {
      // verifico token (si modificado o caducado lanza error)
      tokenInfo = jwt.verify(authorization, process.env.JWT_SECRET);
    } catch (error) {
      generateError('Token no valido', 401);
    }

    // console.log('tokenInfo:', tokenInfo); // { id: 2, role: 'normal', iat: 1658943520, exp: 1659029920 }

    // Comprobamos que el token sea valido respecto a lastAuthUpdate
    const [user] = await connection.query(
      `
      SELECT lastAuthUpdate
      FROM users
      WHERE id=?
      `,
      [tokenInfo.id]
    );

    const lastAuthUpdate = new Date(user[0].lastAuthUpdate);
    const timestampCreateToken = new Date(tokenInfo.iat * 1000);
    // console.log(
    //   'lastAuthUpdate, timestampCreateToken',
    //   lastAuthUpdate,
    //   timestampCreateToken
    // );

    if (timestampCreateToken < lastAuthUpdate) {
      generateError('Token caducado', 401);
    }

    // añado a la req las informaciones del usuario que hace la petición (payload token)
    req.userInfo = tokenInfo;

    next();
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = isUser;
