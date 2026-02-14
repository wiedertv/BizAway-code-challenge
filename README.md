# Trip Planner API

BizAway Tech Challenge - Enterprise-grade trip search and management API built with NestJS.

## Features

- 🔍 **Trip Search**: Search trips with multiple sort strategies (fastest, cheapest)
- 💾 **Trip Management**: Save and retrieve favorite trips
- 🔒 **Security**: Helmet security headers, CORS protection, rate limiting
- 🏥 **Health Checks**: Liveness, readiness, and detailed health monitoring
- 📊 **Observability**: Distributed tracing with request IDs, structured logging
- 🛡️ **Error Handling**: Global exception filter with standardized error responses
- 📝 **API Documentation**: Interactive Swagger/OpenAPI documentation

## Architecture

This project follows **Clean Architecture** principles with:
- **Domain Layer**: Entities and repository interfaces
- **Application Layer**: Services, DTOs, controllers
- **Infrastructure Layer**: Repository implementations, external API integrations
- **Shared Layer**: Filters, interceptors, middlewares, validators

## Project Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration
```

## Environment Variables

```bash
# Server
PORT=3000

# External API
TRIPS_API_KEY=your_api_key_here
TRIPS_API_BASE_URL=https://api.example.com

# Database
MONGODB_URI=mongodb://localhost:27017/trip-planner
USE_IN_MEMORY_DB=true  # Use in-memory MongoDB for development

# Security
CORS_ORIGINS=*  # or comma-separated: http://localhost:3000,https://example.com

# Rate Limiting
RATE_LIMIT_TTL=60   # seconds
RATE_LIMIT_MAX=100  # requests per TTL window
```

## Run the Application

```bash
# Development mode with watch
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

## API Endpoints

### Trip Search
```bash
GET /trips/search?origin=SYD&destination=GRU&sort_by=cheapest
```

### Health Checks

```bash
# Liveness probe - is the app running?
GET /health/live

# Readiness probe - is the app ready to serve traffic?
GET /health/ready

# Detailed health - comprehensive system status
GET /health/detailed
```

### API Documentation
```
http://localhost:3000/api
```

## Health Check Details

- **Liveness** (`/health/live`): Basic check that the application is running
- **Readiness** (`/health/ready`): Verifies database connectivity and memory usage
- **Detailed** (`/health/detailed`): Complete system health including:
  - Database (MongoDB) connectivity
  - Memory heap and RSS usage
  - Disk storage availability
  - External API connectivity

## Security Features

### Helmet Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)

### CORS
- Configurable origins
- Credentials support
- Custom headers support

### Rate Limiting
- 100 requests per minute per IP (configurable)
- Applied globally to all endpoints
- Configurable via environment variables

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Code Quality

```bash
# Linting
pnpm run lint

# Format code
pnpm run format
```

## License

UNLICENSED - BizAway Tech Challenge
