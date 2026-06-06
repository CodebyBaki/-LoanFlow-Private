CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS credit_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID UNIQUE NOT NULL,
  score           INTEGER NOT NULL CHECK (score BETWEEN 300 AND 850),
  rating          VARCHAR(20) NOT NULL CHECK (rating IN ('poor','fair','good','very_good','excellent')),
  max_loan_amount DECIMAL(15,2) NOT NULL,
  interest_rate   DECIMAL(5,2) NOT NULL,
  factors         JSONB,
  last_updated    TIMESTAMP DEFAULT NOW(),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id         UUID NOT NULL,
  customer_id     UUID NOT NULL,
  score           INTEGER NOT NULL,
  recommendation  VARCHAR(20) NOT NULL CHECK (recommendation IN ('approve','reject','manual_review')),
  interest_rate   DECIMAL(5,2),
  reason          TEXT,
  assessed_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_scores_customer      ON credit_scores(customer_id);
CREATE INDEX IF NOT EXISTS idx_credit_assessments_loan     ON credit_assessments(loan_id);
CREATE INDEX IF NOT EXISTS idx_credit_assessments_customer ON credit_assessments(customer_id);
