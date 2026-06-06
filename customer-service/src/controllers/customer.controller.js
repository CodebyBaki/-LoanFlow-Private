const CustomerModel = require('../models/customer.model');

exports.getProfile = async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.params.id || req.user.userId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json({ customer });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await CustomerModel.update(req.user.userId, req.body);
    if (!updated) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json({ message: 'Profile updated', customer: updated });
  } catch (err) {
    next(err);
  }
};

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const customers = await CustomerModel.findAll({ limit: parseInt(limit), offset: parseInt(offset) });
    res.status(200).json({ customers, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};
