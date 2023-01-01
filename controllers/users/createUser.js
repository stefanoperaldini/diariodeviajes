'use strict';

const { v4: uuidv4 } = require('uuid');

const getDB = require('../../DDBB/db');
const { registrationSchema } = require('../../schemas');
const { generateError, sendMail, validate } = require('../../utility');

const createUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // leer email y pwd desde el body
    const { email, pwd } = req.body;

    // valido los datos del body
    // if (!email || !pwd) {
    //   generateError(`Faltan datos`, 400);
    // }

    // Validación con JOI
    await validate(registrationSchema, req.body);

    // comprobar que el usuario no exista
    const [existingUser] = await connection.query(
      `
      SELECT id, date
      FROM users
      WHERE email = ?
    `,
      [email]
    );

    if (existingUser.length > 0) {
      generateError(`Ya existe un usuario con este email`, 409);
    }

    // genero regCode
    const regCode = uuidv4();

    // envio un correo de validación usuario
    const bodyEmail = `
      Acabas de registrarte en Diario de Viajes.
      Pulsa este enlace para activar el usuario: ${process.env.PUBLIC_HOST}${regCode}
    `;

    sendMail(email, "Correo de validación de 'Diario de viajes'", bodyEmail);

    // creo el usuario en el BD como no validato
    await connection.query(
      `
      INSERT INTO users (email, password, regCode )
      VALUES (?, SHA2(?, 512), ?)
    `,
      [email, pwd, regCode]
    );

    // creo usuario en el DB
    res.status(201).send({
      status: 'ok',
      message: 'Usuario creato',
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = createUser;
