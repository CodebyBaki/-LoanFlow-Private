const pool = require('../config/db');

const FAILURE_RATE = 0.05; // 5% chance of simulated failure

const BankModel = {
  async findAccount(account_number) {
    const { rows } = await pool.query(
      'SELECT * FROM mock_accounts WHERE account_number = $1 AND is_active = true',
      [account_number]
    );
    return rows[0];
  },

  async getAllAccounts() {
    const { rows } = await pool.query(
      'SELECT id, account_number, account_name, bank_code, bank_name, balance, created_at FROM mock_accounts'
    );
    return rows;
  },

  async credit(account_number, amount, reference, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update balance
      const { rows: accountRows } = await client.query(
        'UPDATE mock_accounts SET balance = balance + $1 WHERE account_number = $2 RETURNING *',
        [amount, account_number]
      );

      if (!accountRows.length) throw new Error('Account not found');

      // Record transaction
      const { rows: txRows } = await client.query(
        `INSERT INTO mock_transactions
          (reference, type, amount, account_number, description, status)
         VALUES ($1, 'credit', $2, $3, $4, 'success') RETURNING *`,
        [reference, amount, account_number, description || 'Loan disbursement']
      );

      await client.query('COMMIT');
      return { transaction: txRows[0], account: accountRows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async debit(account_number, amount, reference, description) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: accountRows } = await client.query(
        'SELECT * FROM mock_accounts WHERE account_number = $1 FOR UPDATE',
        [account_number]
      );

      if (!accountRows.length) throw new Error('Account not found');
      if (accountRows[0].balance < amount) throw new Error('Insufficient funds');

      await client.query(
        'UPDATE mock_accounts SET balance = balance - $1 WHERE account_number = $2',
        [amount, account_number]
      );

      const { rows: txRows } = await client.query(
        `INSERT INTO mock_transactions
          (reference, type, amount, account_number, description, status)
         VALUES ($1, 'debit', $2, $3, $4, 'success') RETURNING *`,
        [reference, amount, account_number, description || 'Loan repayment']
      );

      await client.query('COMMIT');
      return { transaction: txRows[0], account: accountRows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getTransactions({ account_number, limit = 20, offset = 0 }) {
    if (account_number) {
      const { rows } = await pool.query(
        'SELECT * FROM mock_transactions WHERE account_number = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [account_number, limit, offset]
      );
      return rows;
    }
    const { rows } = await pool.query(
      'SELECT * FROM mock_transactions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return rows;
  },

  async getTransactionByReference(reference) {
    const { rows } = await pool.query(
      'SELECT * FROM mock_transactions WHERE reference = $1',
      [reference]
    );
    return rows[0];
  },

  simulateFailure() {
    return Math.random() < FAILURE_RATE;
  },
};

module.exports = BankModel;
