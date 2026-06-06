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
  applyLoan: Joi.object({
    amount:        Joi.number().positive().min(10000).max(10000000).required(),
    tenure_months: Joi.number().integer().min(1).max(60).required(),
    purpose:       Joi.string().min(5).max(500).required(),
  }),

  reviewLoan: Joi.object({
    status:           Joi.string().valid('approved', 'rejected').required(),
    interest_rate:    Joi.number().positive().max(100).when('status', {
                        is: 'approved', then: Joi.required()
                      }),
    rejection_reason: Joi.string().when('status', {
                        is: 'rejected', then: Joi.required()
                      }),
  }),
};

module.exports = { validate, schemas };
