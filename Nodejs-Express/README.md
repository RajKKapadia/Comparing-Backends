# Bookmark Shortener API

A Node.js Express-based URL shortener and bookmark management service with user authentication, built using TypeScript, PostgreSQL, and Drizzle ORM.

## Features

- **User Authentication**: JWT-based registration and login system
- **URL Shortening**: Generate unique short codes for long URLs
- **Bookmark Management**: Create, read, and delete bookmarks with metadata
- **Security**: Rate limiting, CORS, Helmet security headers, and request validation
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Visit Tracking**: Track click counts for shortened URLs

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with HMAC-SHA256 password hashing
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: Zod for request validation
- **Package Manager**: pnpm

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password

### Bookmarks

- `POST /bookmarks` - Create a new bookmark (authenticated)
- `GET /bookmarks` - Get user's bookmarks (authenticated)
- `GET /bookmarks/:bookmark_id` - Get specific bookmark (authenticated)
- `DELETE /bookmarks/:bookmark_id` - Delete bookmark (authenticated)

### URL Redirection

- `GET /:short_code` - Redirect to original URL and increment visit count

### Health Check

- `GET /health` - Service health status

## Database Schema

### Users Table
```sql
users (
  id: serial primary key,
  email: varchar(255) unique not null,
  password: varchar(255) not null,
  salt: varchar(64) not null,
  created_at: timestamp default now(),
  updated_at: timestamp default now()
)
```

### Bookmarks Table
```sql
bookmarks (
  id: serial primary key,
  user_id: integer references users(id) on delete cascade,
  title: varchar(255) not null,
  original_url: text not null,
  short_code: varchar(10) unique not null,
  visit_count: integer default 0,
  is_active: boolean default true,
  created_at: timestamp default now(),
  updated_at: timestamp default now()
)
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Nodejs-Express
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/bookmark_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   ```

4. **Database Setup**
   ```bash
   # Generate migration files
   pnpm run db:generate
   
   # Apply migrations to database
   pnpm run db:migrate
   
   # Optional: Open Drizzle Studio for database management
   pnpm run db:studio
   ```

### Development

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

## API Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Create a bookmark
```bash
curl -X POST http://localhost:3000/bookmarks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Google",
    "url": "https://www.google.com"
  }'
```

### Get user bookmarks
```bash
curl -X GET http://localhost:3000/bookmarks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Access shortened URL
```bash
# This will redirect to the original URL
curl -L http://localhost:3000/abc123
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Password Security**: HMAC-SHA256 hashing with random salt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request body validation and sanitization
- **CORS Protection**: Cross-origin resource sharing configuration
- **Security Headers**: Helmet middleware for security headers
- **Soft Deletes**: Bookmarks are deactivated rather than permanently deleted

## Project Structure

```
src/
├── controllers/          # Request handlers and business logic
│   ├── authController.ts    # User registration and login
│   ├── bookmarkController.ts # Bookmark CRUD operations
│   └── redirectController.ts # URL redirection logic
├── drizzle/             # Database configuration and schema
│   ├── db.ts               # Database connection
│   ├── schema.ts           # Database table definitions
│   └── migrations/         # Database migration files
├── middleware/          # Express middleware
│   └── auth.ts             # JWT authentication middleware
├── routes/              # API route definitions
│   ├── auth.ts             # Authentication routes
│   ├── bookmarks.ts        # Bookmark routes
│   └── index.ts            # Route aggregation
├── utils/               # Utility functions
│   ├── jwt.ts              # JWT token utilities
│   └── shortCode.ts        # Short code generation and validation
└── index.ts             # Application entry point
```

## Development Notes

- **Type Safety**: Full TypeScript integration with Drizzle ORM for compile-time type checking
- **Database Migrations**: Version-controlled schema changes using Drizzle Kit
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Logging**: Console logging for debugging and monitoring
- **Code Organization**: Modular architecture with separation of concerns

## Production Considerations

- Set up proper environment variables for production
- Use a production-grade PostgreSQL instance
- Configure proper CORS origins for your frontend
- Set up logging and monitoring
- Consider implementing request/response caching
- Add comprehensive test coverage
- Set up CI/CD pipeline for automated deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License