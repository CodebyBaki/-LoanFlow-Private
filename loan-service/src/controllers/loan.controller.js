const LoanModel = require('../models/loan.model');

exports.applyForLoan = async (req, res, next) => {
  try {
    const loan = await LoanModel.create({
      customer_id: req.user.userId,
      ...req.body,
    });
    res.status(201).json({ message: 'Loan application submitted', loan });
  } catch (err) {
    next(err);
  }
};

exports.getMyLoans = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const loans = await LoanModel.findByCustomer(req.user.userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.status(200).json({ loans, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await LoanModel.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    // customers can only see their own loans
    if (req.user.role !== 'admin' && loan.customer_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.status(200).json({ loan });
  } catch (err) {
    next(err);
  }
};

exports.getAllLoans = async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const loans = await LoanModel.findAll({ status, limit: parseInt(limit), offset: parseInt(offset) });
    res.status(200).json({ loans, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.reviewLoan = async (req, res, next) => {
  try {
    const loan = await LoanModel.findById(req.params.id);
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (!['pending', 'under_review'].includes(loan.status)) {
      return res.status(400).json({ error: `Loan cannot be reviewed in '${loan.status}' status` });
    }
    const { status, interest_rate, rejection_reason } = req.body;
    const updated = await LoanModel.updateStatus(req.params.id, {
      status,
      interest_rate,
      rejection_reason,
      approved_at: status === 'approved' ? new Date() : null,
    });
    res.status(200).json({ message: `Loan ${status}`, loan: updated });
  } catch (err) {
    next(err);
  }
};

exports.calculateRepayment = (req, res) => {
  const { amount, interest_rate, tenure_months } = req.query;
  if (!amount || !interest_rate || !tenure_months) {
    return res.status(400).json({ error: 'amount, interest_rate and tenure_months are required' });
  }
  const result = LoanModel.calculateRepayment(
    parseFloat(amount),
    parseFloat(interest_rate),
    parseInt(tenure_months)
  );
  res.status(200).json({ amount: parseFloat(amount), interest_rate: parseFloat(interest_rate), tenure_months: parseInt(tenure_months), ...result });
};
