const pool = require('../config/db');

const generateReference = () =>
  `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const PaymentModel = {
  async generateSchedule({ loan_id, customer_id, amount, interest_rate, tenure_months, disbursement_date }) {
    const monthlyRate = interest_rate / 100 / 12;
    const emi = monthlyRate === 0
      ? amount / tenure_months
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure_months)) /
        (Math.pow(1 + monthlyRate, tenure_months) - 1);

    let balance = amount;
    const schedules = [];
    const startDate = new Date(disbursement_date);

    for (let i = 1; i <= tenure_months; i++) {
      const interest  = parseFloat((balance * monthlyRate).toFixed(2));
      const principal = parseFloat((emi - interest).toFixed(2));
      balance = parseFloat((balance - principal).toFixed(2));

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedules.push([
        loan_id, customer_id, i,
        dueDate.toISOString().split('T')[0],
        parseFloat(emi.toFixed(2)),
        principal,
        interest,
      ]);
    }

    // Bulk insert
    const values = schedules.map(
      (s, idx) => `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4}, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
    ).join(', ');

    const flat = schedules.flat();
    const { rows } = await pool.query(
      `INSERT INTO repayment_schedules
        (loan_id, customer_id, installment_no, due_date, amount_due, principal, interest)
       VALUES ${values} RETURNING *`,
      flat
    );
    return rows;
  },

  async getSchedule(loan_id) {
    const { rows } = await pool.query(
      'SELECT * FROM repayment_schedules WHERE loan_id = $1 ORDER BY installment_no',
      [loan_id]
    );
    return rows;
  },

  async create({ loan_id, customer_id, schedule_id, amount, channel }) {
    const reference = generateReference();
    const { rows } = await pool.query(
      `INSERT INTO payments (loan_id, customer_id, schedule_id, amount, reference, channel)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [loan_id, customer_id, schedule_id || null, amount, reference, channel || 'mock_bank']
    );
    return rows[0];
  },

  async updateStatus(id, { status, mock_bank_ref, failure_reason, paid_at }) {
    const { rows } = await pool.query(
      `UPDATE payments SET
        status         = COALESCE($1, status),
        mock_bank_ref  = COALESCE($2, mock_bank_ref),
        failure_reason = COALESCE($3, failure_reason),
        paid_at        = COALESCE($4, paid_at),
        updated_at     = NOW()
       WHERE id = $5 RETURNING *`,
      [status, mock_bank_ref || null, failure_reason || null, paid_at || null, id]
    );
    return rows[0];
  },

  async markSchedulePaid(schedule_id) {
    await pool.query(
      `UPDATE repayment_schedules SET status = 'paid' WHERE id = $1`,
      [schedule_id]
    );
  },

  async findByCustomer(customer_id, { limit = 20, offset = 0 }) {
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [customer_id, limit, offset]
    );
    return rows;
  },

  async findByLoan(loan_id) {
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE loan_id = $1 ORDER BY created_at DESC',
      [loan_id]
    );
    return rows;
  },

  async findAll({ status, limit = 20, offset = 0 }) {
    if (status) {
      const { rows } = await pool.query(
        'SELECT * FROM payments WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [status, limit, offset]
      );
      return rows;
    }
    const { rows } = await pool.query(
      'SELECT * FROM payments ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  },
};

module.exports = PaymentModel;
