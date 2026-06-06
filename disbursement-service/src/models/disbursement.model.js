const pool = require('../config/db');
const { v4: uuidv4 } = require('crypto');

const generateReference = () =>
  `DSBMT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const DisbursementModel = {
  async create({ loan_id, customer_id, amount, account_number, bank_code, bank_name }) {
    const reference = generateReference();
    const { rows } = await pool.query(
      `INSERT INTO disbursements
        (loan_id, customer_id, amount, account_number, bank_code, bank_name, reference)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [loan_id, customer_id, amount, account_number, bank_code, bank_name, reference]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM disbursements WHERE id = $1', [id]);
    return rows[0];
  },

  async findByLoanId(loan_id) {
    const { rows } = await pool.query('SELECT * FROM disbursements WHERE loan_id = $1', [loan_id]);
    return rows[0];
  },

  async findByCustomer(customer_id, { limit = 20, offset = 0 }) {
    const { rows } = await pool.query(
      'SELECT * FROM disbursements WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [customer_id, limit, offset]
    );
    return rows;
  },

  async findAll({ status, limit = 20, offset = 0 }) {
    if (status) {
      const { rows } = await pool.query(
        'SELECT * FROM disbursements WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [status, limit, offset]
      );
      return rows;
    }
    const { rows } = await pool.query(
      'SELECT * FROM disbursements ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  },

  async updateStatus(id, { status, mock_bank_ref, failure_reason, completed_at }) {
    const { rows } = await pool.query(
      `UPDATE disbursements SET
        status         = COALESCE($1, status),
        mock_bank_ref  = COALESCE($2, mock_bank_ref),
        failure_reason = COALESCE($3, failure_reason),
        completed_at   = COALESCE($4, completed_at),
        updated_at     = NOW()
       WHERE id = $5 RETURNING *`,
      [status, mock_bank_ref || null, failure_reason || null, completed_at || null, id]
    );
    return rows[0];
  },
};

module.exports = DisbursementModel;
