const pool = require('../config/db');

const getRating = (score) => {
  if (score >= 800) return { rating: 'excellent', interest_rate: 8,  max_loan_amount: 10000000 };
  if (score >= 740) return { rating: 'very_good', interest_rate: 12, max_loan_amount: 5000000  };
  if (score >= 670) return { rating: 'good',      interest_rate: 18, max_loan_amount: 2000000  };
  if (score >= 580) return { rating: 'fair',      interest_rate: 24, max_loan_amount: 500000   };
  return              { rating: 'poor',      interest_rate: 30, max_loan_amount: 100000   };
};

const CreditModel = {
  async getScore(customer_id) {
    const { rows } = await pool.query(
      'SELECT * FROM credit_scores WHERE customer_id = $1',
      [customer_id]
    );
    return rows[0];
  },

  async createOrUpdateScore(customer_id, score, factors = {}) {
    const { rating, interest_rate, max_loan_amount } = getRating(score);
    const { rows } = await pool.query(
      `INSERT INTO credit_scores
        (customer_id, score, rating, interest_rate, max_loan_amount, factors)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (customer_id) DO UPDATE SET
        score = $2, rating = $3, interest_rate = $4,
        max_loan_amount = $5, factors = $6, last_updated = NOW()
       RETURNING *`,
      [customer_id, score, rating, interest_rate, max_loan_amount, JSON.stringify(factors)]
    );
    return rows[0];
  },

  async assess(loan_id, customer_id, amount) {
    // Get or generate credit score
    let creditScore = await this.getScore(customer_id);
    if (!creditScore) {
      // Generate a score for new customers (300–750 range)
      const generatedScore = Math.floor(Math.random() * 450) + 300;
      creditScore = await this.createOrUpdateScore(customer_id, generatedScore, {
        note: 'Auto-generated for new customer',
      });
    }

    const { rating, interest_rate, max_loan_amount } = getRating(creditScore.score);

    let recommendation, reason;
    if (creditScore.score < 580) {
      recommendation = 'reject';
      reason = `Credit score ${creditScore.score} is below minimum threshold of 580`;
    } else if (amount > max_loan_amount) {
      recommendation = 'manual_review';
      reason = `Requested amount ₦${amount.toLocaleString()} exceeds limit of ₦${max_loan_amount.toLocaleString()} for ${rating} rating`;
    } else {
      recommendation = 'approve';
      reason = `Credit score ${creditScore.score} (${rating}) qualifies for this loan`;
    }

    const { rows } = await pool.query(
      `INSERT INTO credit_assessments
        (loan_id, customer_id, score, recommendation, interest_rate, reason)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [loan_id, customer_id, creditScore.score, recommendation, interest_rate, reason]
    );

    return { assessment: rows[0], credit_score: creditScore };
  },

  async getAssessmentByLoan(loan_id) {
    const { rows } = await pool.query(
      'SELECT * FROM credit_assessments WHERE loan_id = $1 ORDER BY assessed_at DESC LIMIT 1',
      [loan_id]
    );
    return rows[0];
  },

  getRating,
};

module.exports = CreditModel;
