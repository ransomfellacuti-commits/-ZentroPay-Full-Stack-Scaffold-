# ZentroPay Full-Stack Setup Guide

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/ransomfellacuti-commits/-ZentroPay-Full-Stack-Scaffold-.git
cd -ZentroPay-Full-Stack-Scaffold-

# 2. Copy environment file and configure
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Wait for database initialization (30 seconds)
sleep 30

# 5. Verify services are running
curl http://localhost:3000/health
curl http://localhost:3001

# 6. Access the applications:
# Backend API:      http://localhost:3000
# Admin Dashboard:  http://localhost:3001
# pgAdmin (DB UI):  http://localhost:5050
```

---

## 📁 Project Structure

```
zentropay/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── services/           # Business logic
│   │   └── app.js              # Express app setup
│   ├── Dockerfile              # Docker image for backend
│   ├── package.json            # Dependencies
│   └── .env.example            # Environment template
│
├── admin-dashboard/            # React admin panel
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API integration
│   │   ├── store/              # Redux state management
│   │   └── App.jsx             # Root component
│   ├── Dockerfile              # Docker image for frontend
│   ├── package.json            # Dependencies
│   └── .env.example            # Environment template
│
├── infrastructure/
│   ├── docker/
│   │   └── init.sql            # PostgreSQL initialization script
│   └── k8s/
│       └── deployment.yaml     # Kubernetes manifests
│
├── .github/
│   └── workflows/
│       ├── static.yml          # GitHub Pages deployment
│       └── ci-cd.yml           # CI/CD pipeline (optional)
��
├── docker-compose.yml          # Local development stack
├── .env.example                # Environment variables template
└── SETUP_GUIDE.md             # This file
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  is_active BOOLEAN,
  is_verified BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR,
  payment_method VARCHAR,
  stripe_payment_intent_id VARCHAR,
  flutterwave_transaction_ref VARCHAR,
  created_at TIMESTAMP
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR DEFAULT 'USD',
  created_at TIMESTAMP
);
```

---

## 🔐 Security Configuration

### Environment Variables by Stage

#### Development (.env)
```env
NODE_ENV=development
JWT_SECRET=dev-secret-key
STRIPE_SECRET=sk_test_xxx
DEBUG=true
CORS_ORIGIN=http://localhost:3001
```

#### Staging (.env.staging)
```env
NODE_ENV=staging
JWT_SECRET=${STAGING_JWT_SECRET}
STRIPE_SECRET=${STAGING_STRIPE_SECRET}
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://staging.zentropay.com
```

#### Production (.env.production)
```env
NODE_ENV=production
JWT_SECRET=${PRODUCTION_JWT_SECRET}
STRIPE_SECRET=${PRODUCTION_STRIPE_SECRET}
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://zentropay.com
LOG_LEVEL=warn
SENTRY_DSN=https://...
```

### Authentication Flow
1. User submits credentials
2. Backend validates and generates JWT
3. JWT includes: `{ userId, email, role, iat, exp }`
4. Client stores JWT in secure cookie (HttpOnly)
5. Each request includes JWT in Authorization header
6. Backend validates signature and expiration

### Password Security
- Bcrypt with 10 rounds (HASH_ROUNDS)
- Minimum 8 characters
- Must include uppercase, lowercase, number, symbol
- Salted and hashed before storage
- Never log or expose password hashes

---

## 🐳 Docker Compose Services

### PostgreSQL
- **Container**: `zentropay-postgres`
- **Port**: 5432
- **Volume**: `postgres_data` (persistent)
- **Init Script**: `infrastructure/docker/init.sql`
- **Health Check**: Every 10 seconds

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d zentropay
```

### Redis
- **Container**: `zentropay-redis`
- **Port**: 6379
- **Volume**: `redis_data` (persistent)
- **Use Cases**: Session storage, caching, rate limiting

```bash
# Connect to Redis
docker-compose exec redis redis-cli -a redispass
```

### pgAdmin
- **Container**: `zentropay-pgadmin`
- **Port**: 5050
- **URL**: http://localhost:5050
- **Credentials**: admin@zentropay.local / admin

### Backend API
- **Container**: `zentropay-backend`
- **Port**: 3000
- **Image**: Built from `./backend/Dockerfile`
- **Depends On**: PostgreSQL, Redis
- **Health Check**: Every 10 seconds

### Admin Dashboard
- **Container**: `zentropay-admin`
- **Port**: 3001
- **Image**: Built from `./admin-dashboard/Dockerfile`
- **Depends On**: Backend API

---

## 📡 API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Logout
POST /api/auth/logout

# Refresh Token
POST /api/auth/refresh
```

### User Management
```bash
# Get current user profile
GET /api/users/profile
Header: Authorization: Bearer <jwt-token>

# Update profile
PUT /api/users/profile
{
  "firstName": "Jane",
  "lastName": "Doe"
}

# Get users (admin only)
GET /api/users?page=1&limit=20
```

### Transactions
```bash
# Create transaction
POST /api/transactions
{
  "amount": 100.00,
  "currency": "USD",
  "paymentMethod": "card",
  "description": "Product purchase"
}

# Get transaction history
GET /api/transactions?status=completed&limit=20

# Get transaction details
GET /api/transactions/:id
```

### Wallets
```bash
# Get wallet balance
GET /api/wallets/balance

# Transfer to wallet
POST /api/wallets/transfer
{
  "recipientId": "uuid",
  "amount": 50.00,
  "currency": "USD"
}
```

---

## 💳 Payment Integration

### Stripe Setup
1. Create Stripe account at https://stripe.com
2. Get API keys from dashboard
3. Add to `.env`:
   ```env
   STRIPE_SECRET=sk_test_xxxxx
   STRIPE_PUBLIC=pk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. Set up webhook to receive payment events

### Flutterwave Setup
1. Create Flutterwave account at https://flutterwave.com
2. Get API credentials from dashboard
3. Add to `.env`:
   ```env
   FLUTTERWAVE_SECRET=FLWSECK_TEST-xxxxx
   FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
   ```

### Payment Flow
```
User initiates payment
     ↓
Backend creates payment intent with Stripe/Flutterwave
     ↓
Frontend displays payment form
     ↓
User completes payment
     ↓
Payment provider returns confirmation
     ↓
Backend updates transaction status
     ↓
Webhook updates wallet balance
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or minikube)
- kubectl configured
- Docker images pushed to registry (GHCR, Docker Hub)

### Deploy to Kubernetes
```bash
# Create namespace and deploy
kubectl apply -f infrastructure/k8s/deployment.yaml

# Verify deployment
kubectl get pods -n zentropay

# Check service status
kubectl get svc -n zentropay

# View logs
kubectl logs -n zentropay -l app=zentropay-backend -f

# Port forward for testing
kubectl port-forward -n zentropay svc/zentropay-backend 3000:3000
```

### Scaling
```bash
# Manual scale
kubectl scale deployment zentropay-backend -n zentropay --replicas=5

# Check HPA status
kubectl get hpa -n zentropay

# Describe HPA metrics
kubectl describe hpa zentropay-backend-hpa -n zentropay
```

### Configuration Management
```bash
# Update ConfigMap
kubectl set env configmap zentropay-config -n zentropay \
  LOG_LEVEL=debug

# Update Secret
kubectl create secret generic zentropay-secrets \
  --from-literal=JWT_SECRET=new-secret \
  -n zentropay --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to apply changes
kubectl rollout restart deployment zentropay-backend -n zentropay
```

---

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd admin-dashboard
npm test
```

### Integration Tests
```bash
# Run with real database
npm run test:integration
```

### E2E Tests
```bash
# Start services
docker-compose up -d

# Run Cypress tests
npm run test:e2e
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/health

# Using k6
k6 run infrastructure/tests/load.js
```

---

## 📊 Monitoring & Logging

### Application Logs
```bash
# View logs from all services
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Health Checks
```bash
# Backend health
curl http://localhost:3000/health

# Database connection
curl http://localhost:3000/api/health/db

# Redis connection
curl http://localhost:3000/api/health/redis
```

### Performance Metrics
- Response time monitoring via Sentry or New Relic
- Database query performance analysis
- Memory usage tracking
- CPU utilization monitoring

### Error Tracking
- Sentry integration for error tracking
- Email alerts for critical errors
- Slack notifications for deployments

---

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d zentropay -c "SELECT 1;"

# View logs
docker-compose logs postgres
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml and .env
```

### Memory Issues
```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit
# Docker Desktop Settings → Resources → Memory
```

### SSL/TLS Certificate Issues
```bash
# For development, disable SSL verification
export NODE_TLS_REJECT_UNAUTHORIZED=0

# For production, use Let's Encrypt with cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### JWT Token Expired
```bash
# Token expiration is set in JWT_EXPIRES_IN
# Default: 7 days
# Clear local storage and re-authenticate
```

---

## 📈 Performance Optimization

### Database
- Use connection pooling (min: 2, max: 10)
- Enable query caching with Redis
- Add indexes on frequently queried columns
- Use pagination for large result sets

### API
- Implement rate limiting (100 requests/15 minutes)
- Use gzip compression
- Cache responses with Redis
- Implement request deduplication

### Frontend
- Code splitting with React.lazy()
- Image optimization
- CSS/JS minification
- Service Worker for offline support

### Infrastructure
- Enable horizontal pod autoscaling
- Use CDN for static assets
- Implement database read replicas
- Use load balancing

---

## 🚢 Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL/TLS certificate installed
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured
- [ ] Security audit completed
- [ ] Load testing passed
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] Rollback plan documented

---

## 📚 Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Performance Guide](https://reactjs.org/docs/optimizing-performance.html)
- [PostgreSQL Optimization](https://www.postgresql.org/docs/current/performance.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## 💬 Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review application logs
3. Open an issue on GitHub
4. Contact the development team

**Last Updated**: 2026-05-06  
**Version**: 1.0.0
