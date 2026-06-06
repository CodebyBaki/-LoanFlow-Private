CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS mock_accounts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number VARCHAR(10) UNIQUE NOT NULL,
  account_name   VARCHAR(200) NOT NULL,
  bank_code      VARCHAR(10) NOT NULL,
  bank_name      VARCHAR(100) NOT NULL,
  balance        DECIMAL(15,2) DEFAULT 0.00,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mock_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference       VARCHAR(100) UNIQUE NOT NULL,
  type            VARCHAR(20) NOT NULL CHECK (type IN ('credit','debit')),
  amount          DECIMAL(15,2) NOT NULL,
  account_number  VARCHAR(10) NOT NULL,
  bank_code       VARCHAR(10),
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'success'
                  CHECK (status IN ('success','failed','reversed')),
  failure_reason  TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_transactions_reference      ON mock_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_mock_transactions_account_number ON mock_transactions(account_number);

-- Seed some test accounts
INSERT INTO mock_accounts (account_number, account_name, bank_code, bank_name, balance)
VALUES
  ('0123456789', 'Test Customer One',   '044', 'Access Bank',   500000.00),
  ('9876543210', 'Test Customer Two',   '058', 'GTBank',        250000.00),
  ('1111111111', 'Test Customer Three', '011', 'First Bank',    750000.00),
  ('2222222222', 'Test Customer Four',  '033', 'UBA',           100000.00)
ON CONFLICT DO NOTHING;
