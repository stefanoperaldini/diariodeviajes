'use strict';

const getDB = require('../../DDBB/db');

const infoUser = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    const { id } = req.params;

    // CÓDIGO
    //console.log('Usuario petición:', req.userInfo.id);
    //console.log('Usuario info:', id);

    // voy a leer las info del usuario
    const [user] = await connection.query(
      `
      SELECT id, date, email, name, avatar, role
      FROM users
      WHERE id=?
    `,
      [id]
    );

    //console.log(user);
    // if (user.length === 0) {
    //   generateError('Usuario no presente', 404);
    // }

    const info = {
      name: user[0].name,
      avatar: user[0].avatar,
    };

    // si el usuario de lo que pido info coincide con lo del token o
    // el usuario del token es admin: devuelvo todas las info
    if (req.userInfo.id === Number(id) || req.userInfo.role === 'admin') {
      info.id = user[0].id;
      info.date = user[0].date;
      info.email = user[0].email;
      info.role = user[0].role;
    }

    // creo usuario en el DB
    res.status(200).send({
      status: 'ok',
      message: 'Informaciones usuario',
      data: info,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = infoUser;
