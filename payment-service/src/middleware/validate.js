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
  makePayment: Joi.object({
    loan_id:     Joi.string().uuid().required(),
    schedule_id: Joi.string().uuid().optional(),
    amount:      Joi.number().positive().required(),
    channel:     Joi.string().valid('mock_bank','card','transfer','ussd').default('mock_bank'),
  }),

  generateSchedule: Joi.object({
    loan_id:           Joi.string().uuid().required(),
    customer_id:       Joi.string().uuid().required(),
    amount:            Joi.number().positive().required(),
    interest_rate:     Joi.number().positive().required(),
    tenure_months:     Joi.number().integer().min(1).max(60).required(),
    disbursement_date: Joi.date().required(),
  }),
};

module.exports = { validate, schemas };
