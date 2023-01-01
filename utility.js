'use strict';

const sgEmail = require('@sendgrid/mail');
const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs/promises');

// configuro SendGrid
sgEmail.setApiKey(process.env.SENDGRID_API_KEY);

/* 
  Función de gestion de los errores
*/
const generateError = (message, code = 500) => {
  const error = new Error(message);
  error.httpStatus = code;
  throw error;
};

/* 
  Función de envio email 
*/
const sendMail = async (to, subject, body) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM,
      subject,
      text: body,
      html: `
        <div>
            <h1>${subject}</h1>
            <p>${body}</p>
        </div>
        `,
    };
    await sgEmail.send(msg);
  } catch (error) {
    generateError('Error en invio email');
  }
};

/* 
  Función que guarda la foto en el disco 
*/
const savePhoto = async (dataPhoto) => {
  // creo la imagen con sharp a partir del buffer
  const img = sharp(dataPhoto.data);

  // genero un nombre unico para la image
  const photoNameUniq = `${uuid.v4()}_${dataPhoto.name}`;

  // guardo la imagen en el directorio de los ficheros estaticos
  await img.toFile(
    path.join(__dirname, process.env.UPLOADS_DIRECTORY, photoNameUniq)
  );

  return photoNameUniq;
};

/* 
  Función que borra un fichero en el directorio de uploads 
*/
async function deletePhoto(photo) {
  const photoPath = path.join(__dirname, process.env.UPLOADS_DIRECTORY, photo);

  await fs.unlink(photoPath);
}

/* 
  Función que crea el directorio ficheros estaticos si no existe
*/
async function createStaticDir(staticDirPath) {
  try {
    await fs.access(staticDirPath);
  } catch (error) {
    await fs.mkdir(staticDirPath);
  }
}

async function validate(schema, data) {
  try {
    await schema.validateAsync(data);
  } catch (error) {
    error.httpStatus = 400;
    throw error;
  }
}

module.exports = {
  generateError,
  sendMail,
  savePhoto,
  deletePhoto,
  createStaticDir,
  validate,
};
