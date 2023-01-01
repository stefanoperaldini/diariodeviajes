'use strict';

const getDB = require('../../DDBB/db');
const { generateError } = require('../../utility');

const voteEntry = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // cojo id entry
    const { id } = req.params;
    const userId = req.userInfo.id;

    // cojo el voto
    const { vote } = req.body;

    if (!vote || vote > 5 || vote < 1) {
      generateError('Voto no valido', 400);
    }

    // comprobar si estoy votando mi entry
    const [entry] = await connection.query(
      `
      SELECT user_id
      FROM entries
      WHERE id=?
    `,
      [id]
    );

    // console.log(entry[0].user_id);
    // console.log(req.userInfo.id);

    if (entry[0].user_id === userId) {
      generateError('No puedes votar tu propia entrada', 403);
    }

    // compruebo que el usuario no votara anteriormente la entrada
    const [existingVote] = await connection.query(
      `
      SELECT id
      FROM votes
      WHERE user_id = ? AND entry_id = ?
    `,
      [userId, id]
    );

    if (existingVote.length > 0) {
      generateError('Ya votaste la entrada', 403);
    }

    // añado voto en la tabla
    await connection.query(
      `
      INSERT INTO votes (vote, user_id, entry_id) 
      VALUES (?,?,?)
    `,
      [vote, userId, id]
    );

    // Devuelvo la nueva media de votos
    const [media] = await connection.query(
      `
      SELECT AVG(v.vote) AS mediaVotos
      FROM entries AS e
      LEFT JOIN votes AS v ON (v.entry_id = e.id)
      WHERE e.id = ?
    `,
      [id]
    );

    // console.log(media);

    res.status(200).send({
      status: 'ok',
      message: 'Entry votada',
      data: { mediaVotos: media[0].mediaVotos },
    });
  } catch (error) {
    // throw error;
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = voteEntry;
