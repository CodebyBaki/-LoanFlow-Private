const pool = require('../config/db');

const calculateRepayment = (amount, interestRate, tenureMonths) => {
  const monthlyRate = interestRate / 100 / 12;
  const monthly = monthlyRate === 0
    ? amount / tenureMonths
    : (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return {
    monthly_repayment: parseFloat(monthly.toFixed(2)),
    total_repayment:   parseFloat((monthly * tenureMonths).toFixed(2)),
  };
};

const LoanModel = {
  async create({ customer_id, amount, tenure_months, purpose }) {
    const interest_rate = 18; // default rate; credit-service overrides on approval
    const { monthly_repayment, total_repayment } = calculateRepayment(amount, interest_rate, tenure_months);
    const { rows } = await pool.query(
      `INSERT INTO loans
        (customer_id, amount, interest_rate, tenure_months, monthly_repayment, total_repayment, purpose)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [customer_id, amount, interest_rate, tenure_months, monthly_repayment, total_repayment, purpose]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM loans WHERE id = $1', [id]);
    return rows[0];
  },

  async findByCustomer(customer_id, { limit = 20, offset = 0 }) {
    const { rows } = await pool.query(
      'SELECT * FROM loans WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [customer_id, limit, offset]
    );
    return rows;
  },

  async findAll({ status, limit = 20, offset = 0 }) {
    const base = 'SELECT * FROM loans';
    if (status) {
      const { rows } = await pool.query(
        `${base} WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [status, limit, offset]
      );
      return rows;
    }
    const { rows } = await pool.query(
      `${base} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  async updateStatus(id, { status, interest_rate, rejection_reason, approved_at, disbursed_at, completed_at }) {
    const { rows } = await pool.query(
      `UPDATE loans SET
        status = COALESCE($1, status),
        interest_rate = COALESCE($2, interest_rate),
        rejection_reason = COALESCE($3, rejection_reason),
        approved_at  = COALESCE($4, approved_at),
        disbursed_at = COALESCE($5, disbursed_at),
        completed_at = COALESCE($6, completed_at),
        updated_at   = NOW()
       WHERE id = $7 RETURNING *`,
      [status, interest_rate || null, rejection_reason || null,
       approved_at || null, disbursed_at || null, completed_at || null, id]
    );
    return rows[0];
  },

  calculateRepayment,
};

module.exports = LoanModel;
