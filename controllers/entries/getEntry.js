'use strict';

const getDB = require('../../DDBB/db');

const getEntry = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // recojo el id de la entry desde path params
    const { id } = req.params;
    const [entry] = await connection.query(
      `
      SELECT e.id, e.date, e.place, e.description, e.user_id, u.email , AVG(v.vote) AS modiaVotos
      FROM entries AS e
      LEFT JOIN users AS u ON (u.id = e.user_id)
      LEFT JOIN votes AS v ON (v.entry_id = e.id)
      WHERE e.id = ?
    `,
      [id]
    );

    // console.log(entry);
    const [photos] = await connection.query(
      `
      SELECT id, photo, date
      FROM photos
      WHERE entry_id = ?
    `,
      [id]
    );

    // creo usuario en el DB
    res.status(200).send({
      status: 'ok',
      message: 'Detalle entry',
      data: {
        ...entry[0],
        photos: photos,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = getEntry;
