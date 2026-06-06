const pool = require('../config/db');

const NotificationModel = {
  async create({ customer_id, type, channel, subject, message, metadata }) {
    const { rows } = await pool.query(
      `INSERT INTO notifications
        (customer_id, type, channel, subject, message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_id, type, channel, subject, message, JSON.stringify(metadata || {})]
    );
    return rows[0];
  },

  async updateStatus(id, { status, sent_at }) {
    const { rows } = await pool.query(
      `UPDATE notifications SET status = $1, sent_at = $2 WHERE id = $3 RETURNING *`,
      [status, sent_at || null, id]
    );
    return rows[0];
  },

  async findByCustomer(customer_id, { limit = 20, offset = 0 }) {
    const { rows } = await pool.query(
      `SELECT * FROM notifications WHERE customer_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [customer_id, limit, offset]
    );
    return rows;
  },

  async findAll({ status, type, limit = 20, offset = 0 }) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];
    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (type)   { params.push(type);   query += ` AND type = $${params.length}`;   }
    params.push(limit, offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(query, params);
    return rows;
  },
};

module.exports = NotificationModel;
