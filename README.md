# 🏦 LoanFlow – Kubernetes-Based Microservices Platform

**TechCrush DevOps Cohort | Group 16 Capstone Project**

## Overview
LoanFlow is a cloud-native loan application platform built on Kubernetes microservices.  
Deployed on both **AWS EKS** and **Azure AKS**, it demonstrates auto-scaling, service discovery, rolling updates, and load balancing.

## Architecture
9 microservices orchestrated via Kubernetes — see [docs/architecture.md](docs/architecture.md)

## Teams
| Team | Members | Ownership |
|------|---------|-----------|
| Team 1 | Abdulbaki Salawu (Lead), Ibrahim Madani | frontend-web, api-gateway, CI/CD |
| Team 2 | Kenechi Nnaji, Dayisi Omotoye | customer-service, loan-service, credit-service |
| Team 3 | Sunday Nduka, Obodi Ogochukwu Collins | disbursement-service, payment-service |
| Team 4 | Kelechi Dike, Anita Chinenye Nwokem | notification-service, mock-bank-service |

## Stack
- **Runtime**: Node.js + Express
- **Containers**: Docker
- **Orchestration**: Kubernetes (AWS EKS + Azure AKS)
- **CI/CD**: GitHub Actions
- **Messaging**: Apache Kafka
- **Monitoring**: Prometheus + Grafana

## Getting started
1. Clone the repo
2. Check [docs/team-assignments.md](docs/team-assignments.md) for your service
3. Checkout your team branch
4. Read your service README.md
5. Start building!

## Links
- [Architecture](docs/architecture.md)
- [API Contracts](docs/api-contracts.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Team Assignments](docs/team-assignments.md)
