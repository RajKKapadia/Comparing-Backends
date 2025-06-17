# Bookmark URL Shortener

A Go web application built with Gin, PostgreSQL, and Ent that allows users to create and manage shortened URLs for their bookmarks.

## Features

- User authentication with JWT
- Bookmark creation and management
- URL shortening with unique codes
- Visit tracking for shortened URLs
- RESTful API

## Setup

1. Install dependencies:
   ```bash
   go mod tidy
   ```

2. Set up PostgreSQL database `bookmark_shortener_go` and update `.env` file

3. Generate Ent code:
   ```bash
   go run -mod=mod entgo.io/ent/cmd/ent generate ./ent/schema
   ```

   ```bash
   go generate ./ent
   ```

4. Run migrations:
   ```bash
   go run cmd/migrate/main.go
   ```

5. Start the server:
   ```bash
   go run main.go
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/token` - Login and get access token

### Bookmarks
- `POST /bookmarks/` - Create a new bookmark
- `GET /bookmarks/` - Get all user bookmarks
- `GET /bookmarks/{bookmark_id}` - Get a specific bookmark
- `DELETE /bookmarks/{bookmark_id}` - Delete a bookmark

### URL Redirects
- `GET /{short_code}` - Redirect to original URL and increment visit count
