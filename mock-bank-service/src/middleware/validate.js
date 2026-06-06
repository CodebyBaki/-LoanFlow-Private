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
  transfer: Joi.object({
    reference:      Joi.string().required(),
    amount:         Joi.number().positive().required(),
    account_number: Joi.string().pattern(/^[0-9]{10}$/).required(),
    bank_code:      Joi.string().required(),
    bank_name:      Joi.string().required(),
  }),

  debit: Joi.object({
    reference:   Joi.string().required(),
    amount:      Joi.number().positive().required(),
    customer_id: Joi.string().uuid().required(),
  }),

  verify: Joi.object({
    account_number: Joi.string().pattern(/^[0-9]{10}$/).required(),
    bank_code:      Joi.string().required(),
  }),
};

module.exports = { validate, schemas };
