const templates = {
  LOAN_DISBURSED: (data) => ({
    subject: '🎉 Your Loan Has Been Disbursed – LoanFlow',
    message: `Dear Customer,\n\nGreat news! Your loan of ₦${Number(data.amount).toLocaleString()} has been successfully disbursed to your ${data.bank_name} account ending in ${String(data.account_number).slice(-4)}.\n\nReference: ${data.reference}\n\nThank you for choosing LoanFlow.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  PAYMENT_RECEIVED: (data) => ({
    subject: '✅ Payment Received – LoanFlow',
    message: `Dear Customer,\n\nWe have received your repayment of ₦${Number(data.amount).toLocaleString()} for loan ID: ${data.loan_id}.\n\nReference: ${data.reference}\n\nThank you for staying on track with your repayments.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  LOAN_APPROVED: (data) => ({
    subject: '✅ Loan Application Approved – LoanFlow',
    message: `Dear Customer,\n\nCongratulations! Your loan application of ₦${Number(data.amount).toLocaleString()} has been approved at ${data.interest_rate}% interest rate.\n\nYour funds will be disbursed shortly.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  LOAN_REJECTED: (data) => ({
    subject: '❌ Loan Application Update – LoanFlow',
    message: `Dear Customer,\n\nWe regret to inform you that your loan application has not been approved at this time.\n\nReason: ${data.reason}\n\nYou may reapply after 30 days or contact support for assistance.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  PAYMENT_DUE: (data) => ({
    subject: '⚠️ Loan Repayment Due Soon – LoanFlow',
    message: `Dear Customer,\n\nThis is a reminder that your loan repayment of ₦${Number(data.amount).toLocaleString()} is due on ${data.due_date}.\n\nPlease ensure sufficient funds are available to avoid penalties.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  PAYMENT_OVERDUE: (data) => ({
    subject: '🚨 Overdue Loan Repayment – LoanFlow',
    message: `Dear Customer,\n\nYour loan repayment of ₦${Number(data.amount).toLocaleString()} was due on ${data.due_date} and has not been received.\n\nPlease make payment immediately to avoid additional charges.\n\nBest regards,\nThe LoanFlow Team`,
  }),

  WELCOME: (data) => ({
    subject: '👋 Welcome to LoanFlow!',
    message: `Dear ${data.first_name},\n\nWelcome to LoanFlow! Your account has been created successfully.\n\nYou can now apply for loans, track repayments, and manage your profile.\n\nBest regards,\nThe LoanFlow Team`,
  }),
};

const getTemplate = (type, data) => {
  const templateFn = templates[type];
  if (!templateFn) {
    return {
      subject: `LoanFlow Notification – ${type}`,
      message: `You have a new notification: ${JSON.stringify(data)}`,
    };
  }
  return templateFn(data);
};

module.exports = { getTemplate };
