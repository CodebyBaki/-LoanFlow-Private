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
