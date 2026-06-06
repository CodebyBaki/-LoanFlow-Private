CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS loans (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL,
  amount            DECIMAL(15,2) NOT NULL,
  interest_rate     DECIMAL(5,2) NOT NULL,
  tenure_months     INTEGER NOT NULL,
  monthly_repayment DECIMAL(15,2),
  total_repayment   DECIMAL(15,2),
  purpose           TEXT,
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','under_review','approved','rejected','disbursed','active','completed','defaulted')),
  applied_at        TIMESTAMP DEFAULT NOW(),
  approved_at       TIMESTAMP,
  disbursed_at      TIMESTAMP,
  completed_at      TIMESTAMP,
  rejection_reason  TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status      ON loans(status);
