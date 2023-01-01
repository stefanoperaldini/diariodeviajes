'use strict';

const jwt = require('jsonwebtoken');

const getDB = require('../../DDBB/db');
const { generateError } = require('../../utility');

// Script de postman:
//   var jsonData = pm.response.json();
//   pm.globals.set("token", jsonData.data.token);

const loginUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // leer email y pwd desde el body
    const { email, pwd } = req.body;

    if (!email || !pwd) {
      generateError(`Faltan datos`, 400);
    }

    // comprobar que el usuario no exista (con esta email y pwd)
    const [user] = await connection.query(
      `
      SELECT id, role, active
      FROM users
      WHERE email = ? AND password = SHA2(?, 512)
    `,
      [email, pwd]
    );

    if (user.length === 0) {
      generateError('Email o password no correctos', 401);
    }

    // doy error si el usuario no está validado
    if (!user[0].active) {
      generateError(
        'Usuario pendiente de validación. Comprueba el correo electonico.',
        401
      );
    }

    // JWT
    const info = {
      id: user[0].id,
      role: user[0].role,
    };

    // genero token
    // Ejemplo token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6Im5vcm1hbCIsImlhdCI6MTY3MTczOTAwOCwiZXhwIjoxNjcxODI1NDA4fQ.7Sj7YFIclDJi1PB8BfvcHd_LTNVXKlroTB8nqqKnLOU
    const token = jwt.sign(info, process.env.JWT_SECRET, { expiresIn: '1d' });

    // creo usuario en el DB
    res.status(201).send({
      status: 'ok',
      message: 'Login',
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = loginUser;
