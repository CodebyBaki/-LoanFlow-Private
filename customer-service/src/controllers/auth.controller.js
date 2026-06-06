const jwt = require('jsonwebtoken');
const CustomerModel = require('../models/customer.model');

const JWT_SECRET  = process.env.JWT_SECRET  || 'loanflow-dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

const generateToken = (customer) =>
  jwt.sign(
    { userId: customer.id, email: customer.email, role: customer.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

exports.register = async (req, res, next) => {
  try {
    const existing = await CustomerModel.findByEmail(req.body.email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const customer = await CustomerModel.create(req.body);
    const token = generateToken(customer);
    res.status(201).json({ message: 'Registration successful', customer, token });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email or phone already exists' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const customer = await CustomerModel.findByEmail(email);
    if (!customer) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await CustomerModel.verifyPassword(password, customer.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = generateToken(customer);
    const { password_hash, ...safeCustomer } = customer;
    res.status(200).json({ message: 'Login successful', customer: safeCustomer, token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const customer = await CustomerModel.findById(req.user.userId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.status(200).json({ customer });
  } catch (err) {
    next(err);
  }
};
