const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

const schemas = {
  register: Joi.object({
    first_name:    Joi.string().min(2).max(100).required(),
    last_name:     Joi.string().min(2).max(100).required(),
    email:         Joi.string().email().required(),
    phone:         Joi.string().pattern(/^[0-9]{11}$/).required().messages({
      'string.pattern.base': 'Phone must be 11 digits',
    }),
    password:      Joi.string().min(8).required(),
    bvn:           Joi.string().pattern(/^[0-9]{11}$/).optional(),
    address:       Joi.string().optional(),
    date_of_birth: Joi.date().max('now').optional(),
  }),
  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  updateProfile: Joi.object({
    first_name:    Joi.string().min(2).max(100).optional(),
    last_name:     Joi.string().min(2).max(100).optional(),
    phone:         Joi.string().pattern(/^[0-9]{11}$/).optional(),
    address:       Joi.string().optional(),
    date_of_birth: Joi.date().max('now').optional(),
  }),
};

module.exports = { validate, schemas };
