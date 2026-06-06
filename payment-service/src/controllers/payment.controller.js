const axios = require('axios');
const PaymentModel = require('../models/payment.model');

const MOCK_BANK_URL    = process.env.MOCK_BANK_SERVICE_URL    || 'http://mock-bank-service:3000';
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000';

const notifyCustomer = async (customer_id, type, data) => {
  try {
    await axios.post(`${NOTIFICATION_URL}/api/notifications/send`, { customer_id, type, data });
  } catch (err) {
    console.error(`[NOTIFY ERROR] ${err.message}`);
  }
};

exports.generateSchedule = async (req, res, next) => {
  try {
    const schedule = await PaymentModel.generateSchedule(req.body);
    res.status(201).json({ message: 'Repayment schedule generated', schedule });
  } catch (err) {
    next(err);
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await PaymentModel.getSchedule(req.params.loanId);
    if (!schedule.length) return res.status(404).json({ error: 'No schedule found for this loan' });
    res.status(200).json({ schedule });
  } catch (err) {
    next(err);
  }
};

exports.makePayment = async (req, res, next) => {
  try {
    const { loan_id, schedule_id, amount, channel } = req.body;
    const customer_id = req.user.userId;

    // Create payment record
    const payment = await PaymentModel.create({ loan_id, customer_id, schedule_id, amount, channel });

    // Call mock bank
    let bankResponse;
    try {
      bankResponse = await axios.post(`${MOCK_BANK_URL}/api/mock-bank/debit`, {
        reference: payment.reference,
        amount,
        customer_id,
      });
    } catch (err) {
      await PaymentModel.updateStatus(payment.id, {
        status: 'failed',
        failure_reason: err.message,
      });
      return res.status(502).json({ error: 'Payment processing failed', details: err.message });
    }

    // Mark payment complete
    const updated = await PaymentModel.updateStatus(payment.id, {
      status:        'completed',
      mock_bank_ref: bankResponse.data?.transaction_id,
      paid_at:       new Date(),
    });

    // Mark schedule installment paid
    if (schedule_id) {
      await PaymentModel.markSchedulePaid(schedule_id);
    }

    // Notify customer
    await notifyCustomer(customer_id, 'PAYMENT_RECEIVED', {
      amount,
      reference: payment.reference,
      loan_id,
    });

    res.status(201).json({ message: 'Payment successful', payment: updated });
  } catch (err) {
    next(err);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const payments = await PaymentModel.findByCustomer(req.user.userId, {
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ payments, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentsByLoan = async (req, res, next) => {
  try {
    const payments = await PaymentModel.findByLoan(req.params.loanId);
    res.status(200).json({ payments });
  } catch (err) {
    next(err);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const payments = await PaymentModel.findAll({
      status, limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ payments, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};
