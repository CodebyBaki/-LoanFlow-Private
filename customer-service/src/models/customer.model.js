const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const CustomerModel = {
  async create({ first_name, last_name, email, phone, password, bvn, address, date_of_birth }) {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO customers
        (first_name, last_name, email, phone, password_hash, bvn, address, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at`,
      [first_name, last_name, email, phone, password_hash, bvn || null, address || null, date_of_birth || null]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM customers WHERE email = $1 AND is_active = true',
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role, bvn,
              address, date_of_birth, is_verified, is_active, created_at, updated_at
       FROM customers WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return null;
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];
    const { rows } = await pool.query(
      `UPDATE customers SET ${setClause}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, first_name, last_name, email, phone, role, address, date_of_birth, updated_at`,
      values
    );
    return rows[0];
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  async findAll({ limit = 20, offset = 0 }) {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, email, phone, role, is_verified, is_active, created_at
       FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },
};

module.exports = CustomerModel;
