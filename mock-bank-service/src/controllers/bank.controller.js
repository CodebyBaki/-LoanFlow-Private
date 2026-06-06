const BankModel = require('../models/bank.model');

exports.transfer = async (req, res, next) => {
  try {
    const { reference, amount, account_number, bank_code, bank_name } = req.body;

    // Check for duplicate reference
    const existing = await BankModel.getTransactionByReference(reference);
    if (existing) {
      return res.status(409).json({ error: 'Duplicate transaction reference' });
    }

    // Simulate occasional bank failure
    if (BankModel.simulateFailure()) {
      return res.status(502).json({
        error: 'Bank network error – please retry',
        code: 'BANK_NETWORK_ERROR',
      });
    }

    // Find or create account (for accounts not in DB, we still credit them)
    let account = await BankModel.findAccount(account_number);

    if (!account) {
      // For unknown accounts, simulate success without DB credit
      const transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      return res.status(200).json({
        message:        'Transfer successful',
        transaction_id,
        reference,
        amount,
        account_number,
        bank_name,
        status:         'success',
      });
    }

    const { transaction } = await BankModel.credit(
      account_number, amount, reference,
      `LoanFlow disbursement – ${bank_name}`
    );

    res.status(200).json({
      message:        'Transfer successful',
      transaction_id: transaction.id,
      reference:      transaction.reference,
      amount:         transaction.amount,
      account_number,
      bank_name,
      status:         'success',
    });
  } catch (err) {
    next(err);
  }
};

exports.debit = async (req, res, next) => {
  try {
    const { reference, amount, customer_id } = req.body;

    const existing = await BankModel.getTransactionByReference(reference);
    if (existing) {
      return res.status(409).json({ error: 'Duplicate transaction reference' });
    }

    if (BankModel.simulateFailure()) {
      return res.status(502).json({
        error: 'Bank network error – please retry',
        code: 'BANK_NETWORK_ERROR',
      });
    }

    // Use first test account for debits in mock environment
    const testAccount = '0123456789';
    const { transaction } = await BankModel.debit(
      testAccount, amount, reference, 'LoanFlow repayment'
    );

    res.status(200).json({
      message:        'Debit successful',
      transaction_id: transaction.id,
      reference:      transaction.reference,
      amount:         transaction.amount,
      status:         'success',
    });
  } catch (err) {
    if (err.message === 'Insufficient funds') {
      return res.status(400).json({ error: 'Insufficient funds in account' });
    }
    next(err);
  }
};

exports.verifyAccount = async (req, res, next) => {
  try {
    const { account_number, bank_code } = req.body;
    const account = await BankModel.findAccount(account_number);

    if (!account || account.bank_code !== bank_code) {
      return res.status(404).json({ error: 'Account not found or bank code mismatch' });
    }

    res.status(200).json({
      account_number: account.account_number,
      account_name:   account.account_name,
      bank_name:      account.bank_name,
      bank_code:      account.bank_code,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await BankModel.getAllAccounts();
    res.status(200).json({ accounts });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { account_number, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const transactions = await BankModel.getTransactions({
      account_number,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.status(200).json({ transactions, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionByRef = async (req, res, next) => {
  try {
    const transaction = await BankModel.getTransactionByReference(req.params.reference);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
};
