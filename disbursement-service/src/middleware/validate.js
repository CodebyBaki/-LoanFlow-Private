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
  initiate: Joi.object({
    loan_id:        Joi.string().uuid().required(),
    customer_id:    Joi.string().uuid().required(),
    amount:         Joi.number().positive().required(),
    account_number: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Account number must be 10 digits',
    }),
    bank_code: Joi.string().required(),
    bank_name: Joi.string().required(),
  }),
};

module.exports = { validate, schemas };
