'use strict';

const getDB = require('../../DDBB/db');
const { deletePhoto } = require('../../utility');

const deleteEntry = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    const { id } = req.params;

    // Seleccionar las fotos relacionadas y borrar los ficheros de disco
    const [photos] = await connection.query(
      `SELECT photo 
       FROM photos 
        WHERE entry_id=?`,
      [id]
    );

    // Borramos las posibles fotos de la tabla entries_photos
    await connection.query(`DELETE FROM photos WHERE entry_id=?`, [id]);

    // ... y del disco
    for (const item of photos) {
      await deletePhoto(item.photo);
    }

    // Borrar los posibles votos de la tabla votes
    await connection.query(
      `
      DELETE FROM votes WHERE entry_id=?
    `,
      [id]
    );

    // Borrar la entrada de la tabla entries
    await connection.query(`DELETE FROM entries WHERE id=?`, [id]);

    // Mandar confirmación
    res.send({
      status: 'ok',
      message: `La entrada con id ${id} y todos sus elementos relacionados fueron borrados del sistema`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = deleteEntry;
