'use strict';

const Joi = require('joi');

const registrationSchema = Joi.object().keys({
  email: Joi.string()
    .required()
    .email()
    .max(100)
    .error(new Error('Correo no especificado o no valido')),
  pwd: Joi.string()
    .required()
    .min(6)
    .max(20)
    .error(new Error('Password no especificada o no valida')),
});

module.exports = { registrationSchema };
