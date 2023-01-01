'use strict';

const getDB = require('../../DDBB/db');
const { generateError, savePhoto } = require('../../utility');

const createEntry = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // voy a leer en el body place y description
    const { place, description } = req.body;

    // error si no tengo place
    if (!place) {
      generateError('El campo "place" es obigatorio', 400);
    }

    // añado entry al DB
    const [result] = await connection.query(
      `
        INSERT INTO entries (place, description, user_id)
        VALUES (?,?,?)
    `,
      [place, description, req.userInfo.id]
    );

    const { insertId } = result;

    // console.log(req.files);
    // gestiono las fotos
    if (req.files && Object.keys(req.files).length > 0) {
      // tengo fotos!!! Gestiono solo las primeras 3 (limite max de fotos para un post)
      for (let photosData of Object.values(req.files).slice(0, 3)) {
        // guardo cada foto en el directorio de ficheros estaticos
        const photoName = await savePhoto(photosData);
        // insert de la foto en el DB
        await connection.query(
          `
            INSERT INTO photos (photo, entry_id)
            VALUES(?,?)
        `,
          [photoName, insertId]
        );
      }
    }

    // creo usuario en el DB
    res.status(201).send({
      status: 'ok',
      message: `Entry creada (${insertId})`,
      data: {
        id: insertId,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = createEntry;
