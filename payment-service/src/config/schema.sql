CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS repayment_schedules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id           UUID NOT NULL,
  customer_id       UUID NOT NULL,
  installment_no    INTEGER NOT NULL,
  due_date          DATE NOT NULL,
  amount_due        DECIMAL(15,2) NOT NULL,
  principal         DECIMAL(15,2) NOT NULL,
  interest          DECIMAL(15,2) NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending','paid','overdue','partially_paid')),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id        UUID NOT NULL,
  customer_id    UUID NOT NULL,
  schedule_id    UUID REFERENCES repayment_schedules(id),
  amount         DECIMAL(15,2) NOT NULL,
  reference      VARCHAR(100) UNIQUE NOT NULL,
  channel        VARCHAR(30) DEFAULT 'mock_bank'
                 CHECK (channel IN ('mock_bank','card','transfer','ussd')),
  status         VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending','completed','failed','reversed')),
  mock_bank_ref  VARCHAR(100),
  failure_reason TEXT,
  paid_at        TIMESTAMP,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_loan_id     ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_loan_id    ON repayment_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_schedules_due_date   ON repayment_schedules(due_date);
