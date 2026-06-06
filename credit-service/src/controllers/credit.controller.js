const CreditModel = require('../models/credit.model');

exports.assessLoan = async (req, res, next) => {
  try {
    const { loan_id, customer_id, amount } = req.body;
    const result = await CreditModel.assess(loan_id, customer_id, amount);
    res.status(200).json({
      message: 'Credit assessment complete',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyScore = async (req, res, next) => {
  try {
    const score = await CreditModel.getScore(req.user.userId);
    if (!score) {
      return res.status(404).json({ error: 'No credit score found. Apply for a loan to generate one.' });
    }
    res.status(200).json({ credit_score: score });
  } catch (err) {
    next(err);
  }
};

exports.getScoreByCustomer = async (req, res, next) => {
  try {
    const score = await CreditModel.getScore(req.params.customerId);
    if (!score) return res.status(404).json({ error: 'Credit score not found for this customer' });
    res.status(200).json({ credit_score: score });
  } catch (err) {
    next(err);
  }
};

exports.updateScore = async (req, res, next) => {
  try {
    const { score } = req.body;
    const updated = await CreditModel.createOrUpdateScore(
      req.params.customerId,
      score,
      { updated_by: 'admin', note: 'Manual score update' }
    );
    res.status(200).json({ message: 'Credit score updated', credit_score: updated });
  } catch (err) {
    next(err);
  }
};

exports.getLoanAssessment = async (req, res, next) => {
  try {
    const assessment = await CreditModel.getAssessmentByLoan(req.params.loanId);
    if (!assessment) return res.status(404).json({ error: 'No assessment found for this loan' });
    res.status(200).json({ assessment });
  } catch (err) {
    next(err);
  }
};
