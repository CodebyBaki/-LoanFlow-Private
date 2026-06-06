const nodemailer = require('nodemailer');
const NotificationModel = require('../models/notification.model');
const { getTemplate } = require('../templates');

// Nodemailer transporter (use SMTP in production)
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.ethereal.email',
  port:   process.env.SMTP_PORT   || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendEmail = async (to, subject, text) => {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { messageId: `mock-${Date.now()}` };
  }
  return transporter.sendMail({
    from:    process.env.SMTP_FROM || 'noreply@loanflow.com',
    to, subject, text,
  });
};

exports.send = async (req, res, next) => {
  try {
    const { customer_id, type, data, channel = 'email', email } = req.body;
    const { subject, message } = getTemplate(type, data || {});

    // Save to DB
    const notification = await NotificationModel.create({
      customer_id,
      type,
      channel,
      subject,
      message,
      metadata: data,
    });

    // Send via channel
    let sent = false;
    if (channel === 'email' && email) {
      try {
        await sendEmail(email, subject, message);
        sent = true;
      } catch (err) {
        console.error(`[EMAIL ERROR] ${err.message}`);
      }
    } else {
      // For SMS/push: log for now, integrate provider later
      console.log(`[${channel.toUpperCase()}] customer_id: ${customer_id} | type: ${type}`);
      sent = true;
    }

    const updated = await NotificationModel.updateStatus(notification.id, {
      status:  sent ? 'sent' : 'failed',
      sent_at: sent ? new Date() : null,
    });

    res.status(201).json({ message: 'Notification sent', notification: updated });
  } catch (err) {
    next(err);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const notifications = await NotificationModel.findByCustomer(req.user.userId, {
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ notifications, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const notifications = await NotificationModel.findAll({
      status, type, limit: parseInt(limit), offset: parseInt(offset),
    });
    res.status(200).json({ notifications, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};
