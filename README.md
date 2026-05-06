# ZentroPay (Full Stack Scaffold)

Production-style fintech backend + admin dashboard.

## Stack

- **Backend:** NestJS
- **Frontend:** React + Tailwind CSS
- **Database:** PostgreSQL
- **Cache:** Redis
- **Deployment:** Docker + Kubernetes

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+) for local development
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)

### Run with Docker

```bash
docker-compose up --build
```

This will start all services:
- Backend API: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Local Development

#### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend (React)
```bash
cd admin
npm install
npm run dev
```

## Project Structure

```
├── backend/          # NestJS application
├── admin/            # React admin dashboard
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Features

- RESTful API with NestJS
- Authentication & Authorization
- Admin Dashboard
- Database Management
- Real-time capabilities with Redis
- Kubernetes-ready deployment

## License

MIT
