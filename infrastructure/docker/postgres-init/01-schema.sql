CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customers (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(20) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer','admin')), bvn VARCHAR(11) UNIQUE, address TEXT, date_of_birth DATE, is_verified BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS loans (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), customer_id UUID NOT NULL, amount DECIMAL(15,2) NOT NULL, interest_rate DECIMAL(5,2) NOT NULL, tenure_months INTEGER NOT NULL, monthly_repayment DECIMAL(15,2), total_repayment DECIMAL(15,2), purpose TEXT, status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','disbursed','active','completed','defaulted')), applied_at TIMESTAMP DEFAULT NOW(), approved_at TIMESTAMP, disbursed_at TIMESTAMP, completed_at TIMESTAMP, rejection_reason TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS credit_scores (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), customer_id UUID UNIQUE NOT NULL, score INTEGER NOT NULL CHECK (score BETWEEN 300 AND 850), rating VARCHAR(20) NOT NULL, max_loan_amount DECIMAL(15,2) NOT NULL, interest_rate DECIMAL(5,2) NOT NULL, factors JSONB, last_updated TIMESTAMP DEFAULT NOW(), created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS credit_assessments (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), loan_id UUID NOT NULL, customer_id UUID NOT NULL, score INTEGER NOT NULL, recommendation VARCHAR(20) NOT NULL, interest_rate DECIMAL(5,2), reason TEXT, assessed_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS disbursements (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), loan_id UUID UNIQUE NOT NULL, customer_id UUID NOT NULL, amount DECIMAL(15,2) NOT NULL, account_number VARCHAR(20) NOT NULL, bank_code VARCHAR(10) NOT NULL, bank_name VARCHAR(100) NOT NULL, reference VARCHAR(100) UNIQUE NOT NULL, status VARCHAR(20) DEFAULT 'pending', mock_bank_ref VARCHAR(100), failure_reason TEXT, initiated_at TIMESTAMP DEFAULT NOW(), completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS repayment_schedules (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), loan_id UUID NOT NULL, customer_id UUID NOT NULL, installment_no INTEGER NOT NULL, due_date DATE NOT NULL, amount_due DECIMAL(15,2) NOT NULL, principal DECIMAL(15,2) NOT NULL, interest DECIMAL(15,2) NOT NULL, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS payments (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), loan_id UUID NOT NULL, customer_id UUID NOT NULL, schedule_id UUID REFERENCES repayment_schedules(id), amount DECIMAL(15,2) NOT NULL, reference VARCHAR(100) UNIQUE NOT NULL, channel VARCHAR(30) DEFAULT 'mock_bank', status VARCHAR(20) DEFAULT 'pending', mock_bank_ref VARCHAR(100), failure_reason TEXT, paid_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS notifications (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), customer_id UUID NOT NULL, type VARCHAR(50) NOT NULL, channel VARCHAR(20) NOT NULL, subject VARCHAR(255), message TEXT NOT NULL, status VARCHAR(20) DEFAULT 'pending', metadata JSONB, sent_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS mock_accounts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), account_number VARCHAR(10) UNIQUE NOT NULL, account_name VARCHAR(200) NOT NULL, bank_code VARCHAR(10) NOT NULL, bank_name VARCHAR(100) NOT NULL, balance DECIMAL(15,2) DEFAULT 0.00, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW());

CREATE TABLE IF NOT EXISTS mock_transactions (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), reference VARCHAR(100) UNIQUE NOT NULL, type VARCHAR(20) NOT NULL, amount DECIMAL(15,2) NOT NULL, account_number VARCHAR(10) NOT NULL, bank_code VARCHAR(10), description TEXT, status VARCHAR(20) DEFAULT 'success', failure_reason TEXT, created_at TIMESTAMP DEFAULT NOW());

INSERT INTO mock_accounts (account_number, account_name, bank_code, bank_name, balance) VALUES ('0123456789','Test Customer One','044','Access Bank',500000.00),('9876543210','Test Customer Two','058','GTBank',250000.00),('1111111111','Test Customer Three','011','First Bank',750000.00),('2222222222','Test Customer Four','033','UBA',100000.00) ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
