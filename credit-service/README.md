# credit-service

## Overview
> _Describe what this service does — add this before your first commit._

## Team ownership
| Service | Team |
|---------|------|
| credit-service | _Your team name here_ |

## Environment variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the service listens on | `3000` |
| `NODE_ENV` | Runtime environment | `development` |

> Add all required env vars here as you build.

## Running locally
```bash
npm install
npm run dev
```

## Docker
```bash
docker build -t credit-service .
docker run -p 3000:3000 credit-service
```

## API endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |

> Document your endpoints here as you build.
