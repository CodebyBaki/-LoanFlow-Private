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
  assess: Joi.object({
    loan_id:     Joi.string().uuid().required(),
    customer_id: Joi.string().uuid().required(),
    amount:      Joi.number().positive().required(),
  }),

  updateScore: Joi.object({
    score: Joi.number().integer().min(300).max(850).required(),
  }),
};

module.exports = { validate, schemas };
