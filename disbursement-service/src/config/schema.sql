CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS disbursements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id         UUID UNIQUE NOT NULL,
  customer_id     UUID NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  account_number  VARCHAR(20) NOT NULL,
  bank_code       VARCHAR(10) NOT NULL,
  bank_name       VARCHAR(100) NOT NULL,
  reference       VARCHAR(100) UNIQUE NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  mock_bank_ref   VARCHAR(100),
  failure_reason  TEXT,
  initiated_at    TIMESTAMP DEFAULT NOW(),
  completed_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disbursements_loan_id     ON disbursements(loan_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_customer_id ON disbursements(customer_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status      ON disbursements(status);
