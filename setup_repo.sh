#!/bin/bash
set -e

echo "🚀 Setting up LoanFlow repo structure..."

# ── Services ──────────────────────────────────────────────────────────────────
SERVICES=(
  frontend-web
  api-gateway
  customer-service
  loan-service
  credit-service
  disbursement-service
  payment-service
  notification-service
  mock-bank-service
)

for svc in "${SERVICES[@]}"; do
  mkdir -p "$svc/src"
  # .gitkeep so empty src/ is tracked
  touch "$svc/src/.gitkeep"

  # Dockerfile
  cat > "$svc/Dockerfile" << EOF
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src/ ./src/
EXPOSE 3000
CMD ["node", "src/index.js"]
EOF

  # package.json
  svc_clean="${svc//-/_}"
  cat > "$svc/package.json" << EOF
{
  "name": "$svc",
  "version": "1.0.0",
  "description": "LoanFlow – $svc microservice",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "echo \\"No tests yet\\" && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

  # README per service
  cat > "$svc/README.md" << EOF
# $svc

## Overview
> _Describe what this service does — add this before your first commit._

## Team ownership
| Service | Team |
|---------|------|
| $svc | _Your team name here_ |

## Environment variables
| Variable | Description | Example |
|----------|-------------|---------|
| \`PORT\` | Port the service listens on | \`3000\` |
| \`NODE_ENV\` | Runtime environment | \`development\` |

> Add all required env vars here as you build.

## Running locally
\`\`\`bash
npm install
npm run dev
\`\`\`

## Docker
\`\`\`bash
docker build -t $svc .
docker run -p 3000:3000 $svc
\`\`\`

## API endpoints
| Method | Path | Description |
|--------|------|-------------|
| \`GET\` | \`/health\` | Health check |

> Document your endpoints here as you build.
EOF

done

# ── Infrastructure ─────────────────────────────────────────────────────────────
mkdir -p infrastructure/docker
mkdir -p infrastructure/kubernetes/{deployments,services,configmaps,hpa,ingress}
mkdir -p infrastructure/monitoring/{prometheus,grafana}
mkdir -p infrastructure/kafka
mkdir -p infrastructure/ci-cd

# docker-compose.yml
cat > infrastructure/docker/docker-compose.yml << 'EOF'
version: "3.9"
services:
  frontend-web:
    build: ../../frontend-web
    ports: ["3000:3000"]
  api-gateway:
    build: ../../api-gateway
    ports: ["8080:3000"]
  customer-service:
    build: ../../customer-service
  loan-service:
    build: ../../loan-service
  credit-service:
    build: ../../credit-service
  disbursement-service:
    build: ../../disbursement-service
  payment-service:
    build: ../../payment-service
  notification-service:
    build: ../../notification-service
  mock-bank-service:
    build: ../../mock-bank-service
EOF

touch infrastructure/docker/docker-compose.dev.yml

# K8s namespace file
cat > infrastructure/kubernetes/namespaces.yaml << 'EOF'
apiVersion: v1
kind: Namespace
metadata:
  name: loanflow
  labels:
    project: loanflow
    cohort: techcrush-group16
EOF

touch infrastructure/kubernetes/deployments/.gitkeep
touch infrastructure/kubernetes/services/.gitkeep
touch infrastructure/kubernetes/configmaps/.gitkeep
touch infrastructure/kubernetes/hpa/.gitkeep
touch infrastructure/kubernetes/ingress/.gitkeep
touch infrastructure/monitoring/prometheus/.gitkeep
touch infrastructure/monitoring/grafana/.gitkeep

# Kafka placeholder
cat > infrastructure/kafka/kafka-deployment.yaml << 'EOF'
# Kafka deployment manifest — Team 3 to complete
# Reference: https://strimzi.io/quickstarts/
EOF
touch infrastructure/kafka/zookeeper-deployment.yaml

touch infrastructure/ci-cd/aws-eks.yaml
touch infrastructure/ci-cd/azure-aks.yaml

# ── GitHub Actions ─────────────────────────────────────────────────────────────
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI – Build & Test

on:
  pull_request:
    branches: [develop, main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install & test each service
        run: |
          for dir in frontend-web api-gateway customer-service loan-service credit-service disbursement-service payment-service notification-service mock-bank-service; do
            echo "▶ $dir"
            cd $dir && npm install && npm test && cd ..
          done
EOF

touch .github/workflows/deploy-eks.yml
touch .github/workflows/deploy-aks.yml

# ── Docs ───────────────────────────────────────────────────────────────────────
mkdir -p docs

cat > docs/architecture.md << 'EOF'
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
EOF

cat > docs/api-contracts.md << 'EOF'
# API Contracts

> Each team documents their service endpoints here.
> Format: Method | Path | Request body | Response | Auth required

## api-gateway
_Team 1 to document_

## customer-service
_Team 2 to document_

## loan-service
_Team 2 to document_

## credit-service
_Team 2 to document_

## disbursement-service
_Team 3 to document_

## payment-service
_Team 3 to document_

## notification-service
_Team 4 to document_

## mock-bank-service
_Team 4 to document_
EOF

cat > docs/deployment-guide.md << 'EOF'
# Deployment Guide

## Local (Docker Compose)
\`\`\`bash
cd infrastructure/docker
docker-compose up --build
\`\`\`

## Kubernetes – Local (Minikube)
\`\`\`bash
minikube start
kubectl apply -f infrastructure/kubernetes/namespaces.yaml
kubectl apply -f infrastructure/kubernetes/deployments/
kubectl apply -f infrastructure/kubernetes/services/
\`\`\`

## AWS EKS
_Team 1 to complete – see infrastructure/ci-cd/aws-eks.yaml_

## Azure AKS
_Team 1 to complete – see infrastructure/ci-cd/azure-aks.yaml_
EOF

cat > docs/team-assignments.md << 'EOF'
# Team Assignments

| Team | Members | Services | Infra |
|------|---------|----------|-------|
| Team 1 | Abdulbaki Salawu (Lead), Ibrahim Madani | frontend-web, api-gateway | ci-cd, .github/workflows |
| Team 2 | Kenechi Nnaji, Dayisi Omotoye | customer-service, loan-service, credit-service | kubernetes/ |
| Team 3 | Sunday Nduka, Obodi Ogochukwu Collins | disbursement-service, payment-service | docker/, kafka/ |
| Team 4 | Kelechi Dike, Anita Chinenye Nwokem | notification-service, mock-bank-service | monitoring/ |

## Branch naming
\`\`\`
team1/frontend-web
team1/api-gateway
team2/customer-loan-credit
team3/disbursement-payment
team4/notification-mockbank
\`\`\`

## PR rules
- All PRs target **develop** branch
- Minimum 1 reviewer approval required
- Only Group Lead merges develop → main
EOF

# ── Root files ─────────────────────────────────────────────────────────────────
cat > README.md << 'EOF'
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
EOF

cat > .gitignore << 'EOF'
node_modules/
.env
.env.*
!.env.example
dist/
build/
*.log
.DS_Store
*.pem
*.key
*.crt
kubeconfig
EOF

echo ""
echo "✅ Folder structure created successfully!"
echo ""
echo "Next steps:"
echo "  git add ."
echo "  git commit -m 'chore: scaffold full repo structure for all teams'"
echo "  git push origin main"
