'use strict';

const getDB = require('../../DDBB/db');
const { generateError } = require('../../utility');

const infoUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    const { oldPwd, newPwd } = req.body;

    // comprobamos que la antigua pwd sea correcta
    const [user] = await connection.query(
      `
          SELECT id
          FROM users
          WHERE id=? AND password=SHA2(?, 512)
      `,
      [req.userInfo.id, oldPwd]
    );

    // si no encuentro el usuario salgo con error
    if (user.length === 0) {
      generateError('Antigua password no correcta', 401);
    }

    // guardo en el DB la nueva pwd y la fecha del cambio en lastAuthUpdate
    await connection.query(
      `
        UPDATE users
        SET password=SHA2(?, 512), lastAuthUpdate=?
        WHERE id=?
    `,
      [newPwd, new Date(), req.userInfo.id]
    );

    res.send({
      status: 'ok',
      message: 'Password cambiada',
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = infoUser;
