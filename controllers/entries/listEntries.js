'use strict';

const getDB = require('../../DDBB/db');

const listEntries = async (req, res, next) => {
  let connection;

  try {
    // pido la connession
    connection = await getDB();

    // Tendremos que gestionar los filtros y media votos
    const { search, order, direction } = req.query;

    const validetorOrderFields = ['place', 'date', 'votes'];
    const orderBy = validetorOrderFields.includes(order) ? order : 'date';

    const validateDirectionFields = ['ASC', 'DESC'];
    const orderDirection = validateDirectionFields.includes(direction)
      ? direction
      : 'DESC';

    console.log(req.query);

    let entries;

    if (search) {
      // voy a leer las entradas en el DB
      [entries] = await connection.query(
        `
      SELECT e.id, e.date, e.place, e.description, e.user_id, u.email, AVG(IFNULL(v.vote, 0)) AS votes
      FROM entries AS e
      LEFT JOIN users AS u ON (u.id = e.user_id)
      LEFT JOIN votes AS v ON (v.entry_id = e.id)
      WHERE e.place LIKE ? OR e.description LIKE ?
      GROUP BY e.id
      ORDER BY ${orderBy} ${orderDirection} 
      `,
        [`%${search}%`, `%${search}%`]
      );
    } else {
      // voy a leer las entradas en el DB
      [entries] = await connection.query(`
        SELECT e.id, e.date, e.place, e.description, e.user_id, u.email, AVG(IFNULL(v.vote, 0)) AS votes
        FROM entries AS e
        LEFT JOIN users AS u ON (u.id = e.user_id)
        LEFT JOIN votes AS v ON (v.entry_id = e.id)
        GROUP BY e.id
        ORDER BY ${orderBy} ${orderDirection}
  `);
    }

    let entriesWithPhotos = [];

    if (entries.length > 0) {
      const arrayIDs = entries.map((entry) => {
        return entry.id;
      });
      // console.log(arrayIDs);

      const [photos] = await connection.query(`
        SELECT *
        FROM photos
        WHERE entry_id IN (${arrayIDs.join(',')})
      `);

      console.log(photos);

      // juntamos entries con photos
      entriesWithPhotos = entries.map((entry) => {
        const photoEntry = photos.filter((photo) => {
          return photo.entry_id === entry.id;
        });
        return {
          ...entry,
          photo: photoEntry,
        };
      });

      // console.log(JSON.stringify(entriesWithPhotos));
    }

    // creo usuario en el DB
    res.status(200).send({
      status: 'ok',
      message: 'Listado entries',
      data: entriesWithPhotos,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = listEntries;
