CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL,
  type        VARCHAR(50) NOT NULL,
  channel     VARCHAR(20) NOT NULL CHECK (channel IN ('email','sms','push','in_app')),
  subject     VARCHAR(255),
  message     TEXT NOT NULL,
  status      VARCHAR(20) DEFAULT 'pending'
              CHECK (status IN ('pending','sent','failed','delivered')),
  metadata    JSONB,
  sent_at     TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type        ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status      ON notifications(status);
