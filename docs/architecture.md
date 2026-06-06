# LoanFlow – Architecture Overview

## Services map
| Service | Responsibility | Team |
|---------|---------------|------|
| frontend-web | React SPA – customer UI | Team 1 – Abdulbaki, Ibrahim |
| api-gateway | Single entry point, routing, auth enforcement | Team 1 – Abdulbaki, Ibrahim |
| customer-service | Customer profile & KYC | Team 2 – Kenechi, Dayisi |
| loan-service | Loan application & lifecycle | Team 2 – Kenechi, Dayisi |
| credit-service | Credit scoring & eligibility | Team 2 – Kenechi, Dayisi |
| disbursement-service | Loan fund disbursement | Team 3 – Sunday, Obodi |
| payment-service | Repayment processing | Team 3 – Sunday, Obodi |
| notification-service | Email / SMS / push alerts | Team 4 – Kelechi, Anita |
| mock-bank-service | Simulated bank API for testing | Team 4 – Kelechi, Anita |

## Cloud targets
- **AWS EKS** (primary)
- **Azure AKS** (secondary / DR)

## Communication
- Synchronous: REST via api-gateway
- Asynchronous: Kafka topics (disbursement → notification, payment → notification)
