const axios = require('axios');
const DisbursementModel = require('../models/disbursement.model');

const MOCK_BANK_URL = process.env.MOCK_BANK_SERVICE_URL || 'http://mock-bank-service:3000';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000';

const notifyCustomer = async (customer_id, type, data) => {
  try {
    await axios.post(`${NOTIFICATION_URL}/api/notifications/send`, { customer_id, type, data });
  } catch (err) {
    console.error(`[NOTIFY ERROR] ${err.message}`);
  }
};

exports.initiate = async (req, res, next) => {
  try {
    const { loan_id, customer_id, amount, account_number, bank_code, bank_name } = req.body;

    // Check not already disbursed
    const existing = await DisbursementModel.findByLoanId(loan_id);
    if (existing) {
      return res.status(409).json({ error: 'Disbursement already exists for this loan' });
    }

    // Create disbursement record
    const disbursement = await DisbursementModel.create({
      loan_id, customer_id, amount, account_number, bank_code, bank_name,
    });

    // Call mock bank to process transfer
    let bankResponse;
    try {
      bankResponse = await axios.post(`${MOCK_BANK_URL}/api/mock-bank/transfer`, {
        reference:      disbursement.reference,
        amount,
        account_number,
        bank_code,
        bank_name,
      });
    } catch (err) {
      await DisbursementModel.updateStatus(disbursement.id, {
        status: 'failed',
        failure_reason: err.message,
      });
      return res.status(502).json({ error: 'Bank transfer failed', details: err.message });
    }

    // Update disbursement as completed
    const updated = await DisbursementModel.updateStatus(disbursement.id, {
      status:        'completed',
      mock_bank_ref: bankResponse.data?.transaction_id,
      completed_at:  new Date(),
    });

    // Notify customer
    await notifyCustomer(customer_id, 'LOAN_DISBURSED', {
      amount,
      account_number,
      bank_name,
      reference: disbursement.reference,
    });

    res.status(201).json({ message: 'Disbursement successful', disbursement: updated });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const disbursement = await DisbursementModel.findById(req.params.id);
    if (!disbursement) return res.status(404).json({ error: 'Disbursement not found' });
    if (req.user.role !== 'admin' && disbursement.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.status(200).json({ disbursement });
  } catch (err) {
    next(err);
  }
};

exports.getByLoan = async (req, res, next) => {
  try {
    const disbursement = await DisbursementModel.findByLoanId(req.params.loanId);
    if (!disbursement) return res.status(404).json({ error: 'Disbursement not found for this loan' });
    res.status(200).json({ disbursement });
  } catch (err) {
    next(err);
  }
};

exports.getMyDisbursements = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const disbursements = await DisbursementModel.findByCustomer(req.user.userId, {
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ disbursements, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const disbursements = await DisbursementModel.findAll({
      status, limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ disbursements, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};
