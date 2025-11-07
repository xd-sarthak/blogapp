# Blog Application - Microservices Architecture

This project is a microservices-based blog application built with Node.js, TypeScript, and Express. The application consists of three main services: **User Service**, **Author Service**, and **Blog Service**, each handling specific domain responsibilities.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services](#services)
  - [User Service](#user-service)
  - [Author Service](#author-service)
  - [Blog Service](#blog-service)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Communication Flow](#communication-flow)

---

## Architecture Overview

The application follows a microservices architecture pattern with the following characteristics:

- **Service Separation**: Each service has its own database and is independently deployable
- **Message Queue**: RabbitMQ is used for asynchronous communication between services
- **Caching**: Redis is used for caching blog data to improve performance
- **Cloud Storage**: Cloudinary is used for image storage and management
- **Authentication**: JWT-based authentication shared across services

### Service Communication

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│ User Service│         │Author Service│         │Blog Service │
│  (MongoDB)  │         │ (PostgreSQL) │         │ (PostgreSQL)│
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                         │
       │                       │ RabbitMQ                │
       │                       │ (Cache Invalidation)    │
       │                       │                         │
       └───────────────────────┴─────────────────────────┘
                    │
                    │ HTTP (Axios)
                    │
       ┌────────────▼────────────┐
       │   Blog Service          │
       │   (Redis Cache)         │
       └─────────────────────────┘
```

---

## Services

### User Service

**Port**: Default 5000 (configurable via `PORT` environment variable)  
**Database**: MongoDB  
**Purpose**: Manages user authentication, profiles, and user-related operations.

#### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.0
- **Authentication**: JSON Web Token (JWT) 9.0.2
- **File Upload**: Multer 2.0.2
- **Cloud Storage**: Cloudinary 2.7.0
- **Utilities**: DataURI 4.1.0, CORS 2.8.5

#### Functionalities
1. **User Authentication**
   - Login/Registration via OAuth (Google) credentials
   - JWT token generation and validation
   - User profile retrieval

2. **User Profile Management**
   - Get current user profile
   - Get user profile by ID
   - Update user information (name, bio, social media links)
   - Update profile picture with Cloudinary integration

3. **Data Validation**
   - Email validation and sanitization
   - Input sanitization for security
   - File type and size validation for image uploads

#### Database Schema (MongoDB)
```typescript
User {
  name: string (required)
  email: string (required, unique)
  image: string (required)
  instagram: string (optional)
  facebook: string (optional)
  linkedin: string (optional)
  bio: string (optional)
  timestamps: true (createdAt, updatedAt)
}
```

---

### Author Service

**Port**: Default 5001 (configurable via `PORT` environment variable)  
**Database**: PostgreSQL (Neon Serverless)  
**Purpose**: Handles blog creation, updates, and deletion operations by authenticated authors.

#### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL via @neondatabase/serverless 1.0.2
- **Message Queue**: RabbitMQ (amqplib 0.10.9)
- **Authentication**: JSON Web Token (JWT) 9.0.2
- **File Upload**: Multer 2.0.2
- **Cloud Storage**: Cloudinary 2.7.0
- **Utilities**: DataURI 4.1.0, CORS 2.8.5

#### Functionalities
1. **Blog Management**
   - Create new blog posts with image upload
   - Update existing blog posts
   - Delete blog posts (with cascade deletion of comments and saved blogs)
   - Author authorization validation

2. **Image Handling**
   - Image upload to Cloudinary with retry logic
   - Image optimization and processing
   - Support for JPEG, PNG, and WebP formats
   - File size validation (5MB limit)

3. **Cache Invalidation**
   - Publishes cache invalidation messages to RabbitMQ
   - Ensures data consistency across services

#### Database Schema (PostgreSQL)
```sql
blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  blogcontent TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

comments (
  id SERIAL PRIMARY KEY,
  comment VARCHAR(255) NOT NULL,
  userid VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  blogid VARCHAR(255) NOT NULL,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

savedblogs (
  id SERIAL PRIMARY KEY,
  userid VARCHAR(255) NOT NULL,
  blogid VARCHAR(255) NOT NULL,
  create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

### Blog Service

**Port**: Default 5000 (configurable via `PORT` environment variable)  
**Database**: PostgreSQL (Neon Serverless)  
**Purpose**: Handles blog retrieval, searching, filtering, and caching operations for end users.

#### Tech Stack
- **Runtime**: Node.js with TypeScript (ES Modules)
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL via @neondatabase/serverless 1.0.2
- **Cache**: Redis 5.9.0
- **Message Queue**: RabbitMQ (amqplib 0.10.9)
- **HTTP Client**: Axios 1.13.2
- **Validation**: Zod 4.1.12
- **Utilities**: CORS 2.8.5

#### Functionalities
1. **Blog Retrieval**
   - Get all blogs with pagination support
   - Get single blog by ID with author information
   - Search blogs by query string (title and description)
   - Filter blogs by category
   - Combined search and filter operations

2. **Caching Strategy**
   - Redis caching for improved performance
   - Cache key patterns: `blogs:searchQuery:category`, `blog:blogId`
   - Cache TTL: 3600 seconds (1 hour)
   - Automatic cache invalidation via RabbitMQ consumer
   - Cache rebuilding after invalidation

3. **Service Integration**
   - Fetches author information from User Service via HTTP
   - Combines blog and author data in responses

4. **Cache Consumer**
   - Listens to RabbitMQ for cache invalidation messages
   - Automatically invalidates Redis cache keys
   - Rebuilds cache after invalidation

---

## Tech Stack

### Core Technologies
- **Node.js**: JavaScript runtime
- **TypeScript**: Type-safe JavaScript
- **Express.js**: Web framework
- **JWT**: Authentication and authorization

### Databases
- **MongoDB**: User data storage (User Service)
- **PostgreSQL (Neon)**: Blog data storage (Author & Blog Services)
- **Redis**: Caching layer (Blog Service)

### Message Queue
- **RabbitMQ**: Asynchronous communication and cache invalidation

### Cloud Services
- **Cloudinary**: Image storage and CDN

### Development Tools
- **Concurrently**: Run multiple commands simultaneously
- **Nodemon**: Auto-restart on file changes
- **TypeScript Compiler**: Type checking and compilation

---

## API Documentation

### User Service APIs

#### Base URL
```
http://localhost:5000/api/v1
```

#### 1. Login/Register User
**Endpoint**: `POST /login`  
**Description**: Authenticates user with OAuth credentials or creates a new user if not exists.

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "image": "https://example.com/profile.jpg"
}
```

**Response** (200 OK):
```json
{
  "message": "Login Success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "image": "https://example.com/profile.jpg",
    "instagram": "",
    "facebook": "",
    "linkedin": "",
    "bio": ""
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email, name, or image format
- `500 Internal Server Error`: Database or server error

---

#### 2. Get Current User Profile
**Endpoint**: `GET /me`  
**Description**: Retrieves the authenticated user's profile.  
**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "image": "https://example.com/profile.jpg",
  "instagram": "@johndoe",
  "facebook": "john.doe",
  "linkedin": "john-doe",
  "bio": "Software Developer"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

---

#### 3. Get User Profile by ID
**Endpoint**: `GET /user/:id`  
**Description**: Retrieves a user's profile by their user ID.  
**Authentication**: Not required

**Parameters**:
- `id` (path): MongoDB ObjectId of the user

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "user@example.com",
  "image": "https://example.com/profile.jpg"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid user ID format
- `404 Not Found`: User not found

---

#### 4. Update User Profile
**Endpoint**: `POST /user/update`  
**Description**: Updates the authenticated user's profile information.  
**Authentication**: Required (Bearer Token)

**Request Body** (all fields optional):
```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "instagram": "@newhandle",
  "facebook": "new.handle",
  "linkedin": "new-handle"
}
```

**Response** (200 OK):
```json
{
  "message": "User Updated",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe Updated",
    "bio": "Updated bio",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: No fields provided or invalid data
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: User not found

---

#### 5. Update Profile Picture
**Endpoint**: `POST /user/update/pic`  
**Description**: Updates the authenticated user's profile picture.  
**Authentication**: Required (Bearer Token)  
**Content-Type**: `multipart/form-data`

**Request**:
- `file` (file): Image file (JPEG, PNG, or WebP, max 5MB)

**Response** (200 OK):
```json
{
  "message": "User Profile pic updated",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "image": "https://res.cloudinary.com/.../profile.jpg",
    ...
  }
}
```

**Error Responses**:
- `400 Bad Request`: No file provided, invalid file type, or file too large
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Cloudinary upload failure

---

#### 6. Health Check
**Endpoint**: `GET /health-route`  
**Description**: Health check endpoint to verify service is running.

**Response** (200 OK):
```json
{
  "message": "ok"
}
```

---

### Author Service APIs

#### Base URL
```
http://localhost:5001/api/v1
```

#### 1. Create Blog
**Endpoint**: `POST /blog/new`  
**Description**: Creates a new blog post with image upload.  
**Authentication**: Required (Bearer Token)  
**Content-Type**: `multipart/form-data`

**Request**:
- `title` (form-data): Blog title (required)
- `description` (form-data): Blog description (required)
- `blogcontent` (form-data): Blog content/body (required)
- `category` (form-data): Blog category (required)
- `file` (file): Blog cover image (required, JPEG/PNG/WebP, max 5MB)

**Response** (200 OK):
```json
{
  "message": "Blog Created",
  "blog": {
    "id": 1,
    "title": "My First Blog",
    "description": "This is my first blog post",
    "blogcontent": "Full blog content here...",
    "image": "https://res.cloudinary.com/.../blog.jpg",
    "category": "Technology",
    "author": "507f1f77bcf86cd799439011",
    "create_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid file
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Database or Cloudinary error

---

#### 2. Update Blog
**Endpoint**: `PUT /blog/:id`  
**Description**: Updates an existing blog post. Only the author can update their blog.  
**Authentication**: Required (Bearer Token)  
**Content-Type**: `multipart/form-data`

**Parameters**:
- `id` (path): Blog ID

**Request** (all fields optional except those being updated):
- `title` (form-data): Updated blog title
- `description` (form-data): Updated blog description
- `blogcontent` (form-data): Updated blog content
- `category` (form-data): Updated blog category
- `file` (file): Updated blog cover image (optional)

**Response** (200 OK):
```json
{
  "message": "Blog Updated",
  "blog": {
    "id": 1,
    "title": "Updated Blog Title",
    "description": "Updated description",
    ...
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Missing token, invalid token, or not the author
- `404 Not Found`: Blog not found
- `500 Internal Server Error`: Database or Cloudinary error

---

#### 3. Delete Blog
**Endpoint**: `DELETE /blog/:id`  
**Description**: Deletes a blog post and all associated comments and saved blog entries. Only the author can delete their blog.  
**Authentication**: Required (Bearer Token)

**Parameters**:
- `id` (path): Blog ID

**Response** (200 OK):
```json
{
  "message": "Blog Deleted"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing token, invalid token, or not the author
- `404 Not Found`: Blog not found

---

### Blog Service APIs

#### Base URL
```
http://localhost:5000/api/v1
```

#### 1. Get All Blogs
**Endpoint**: `GET /blogs/all`  
**Description**: Retrieves all blogs with optional search and filter capabilities. Results are cached in Redis.  
**Authentication**: Not required

**Query Parameters**:
- `searchQuery` (optional): Search term to filter blogs by title or description (case-insensitive)
- `category` (optional): Filter blogs by category

**Examples**:
```
GET /blogs/all
GET /blogs/all?searchQuery=javascript
GET /blogs/all?category=Technology
GET /blogs/all?searchQuery=react&category=Technology
```

**Response** (200 OK):
```json
{
  "blogs": [
    {
      "id": 1,
      "title": "My First Blog",
      "description": "This is my first blog post",
      "blogcontent": "Full blog content...",
      "image": "https://res.cloudinary.com/.../blog.jpg",
      "category": "Technology",
      "author": "507f1f77bcf86cd799439011",
      "create_at": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

**Caching**: Results are cached in Redis with key pattern `blogs:searchQuery:category` for 1 hour.

---

#### 2. Get Single Blog
**Endpoint**: `GET /blogs/:id`  
**Description**: Retrieves a single blog post with author information. Results are cached in Redis.  
**Authentication**: Not required

**Parameters**:
- `id` (path): Blog ID

**Response** (200 OK):
```json
{
  "blog": {
    "id": 1,
    "title": "My First Blog",
    "description": "This is my first blog post",
    "blogcontent": "Full blog content...",
    "image": "https://res.cloudinary.com/.../blog.jpg",
    "category": "Technology",
    "author": "507f1f77bcf86cd799439011",
    "create_at": "2024-01-01T00:00:00.000Z"
  },
  "author": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "image": "https://example.com/profile.jpg"
  }
}
```

**Error Responses**:
- `404 Not Found`: Blog not found

**Caching**: Results are cached in Redis with key pattern `blog:blogId` for 1 hour.

**Service Integration**: This endpoint fetches author information from the User Service via HTTP.

---

## Environment Variables

### User Service

Create a `.env` file in `services/user/`:

```env
# Server Configuration
PORT=5000
CORS_ORIGIN=*

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/blog
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blog

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Author Service

Create a `.env` file in `services/author/`:

```env
# Server Configuration
PORT=5001

# PostgreSQL Configuration (Neon)
DB_URL=postgresql://username:password@host/database

# JWT Configuration
JWT_SECRET=your-secret-key-here

# RabbitMQ Configuration
RABBITMQ_HOST=localhost
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Blog Service

Create a `.env` file in `services/blog/`:

```env
# Server Configuration
PORT=5000

# PostgreSQL Configuration (Neon)
DB_URL=postgresql://username:password@host/database

# Redis Configuration
REDIS_URL=redis://localhost:6379
# Or Redis Cloud/Upstash:
# REDIS_URL=rediss://default:password@host:port

# RabbitMQ Configuration
RABBITMQ_HOSTT=localhost
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# User Service Configuration
USER_SERVICE_URL=http://localhost:5000

# JWT Configuration (for token verification if needed)
JWT_SECRET=your-secret-key-here
```

**Note**: Ensure all services use the same `JWT_SECRET` for token validation.

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- PostgreSQL (Neon Serverless recommended)
- Redis (local or cloud)
- RabbitMQ (local or cloud)
- Cloudinary account

### Installation Steps

1. **Clone the repository and navigate to services folder**:
```bash
cd services
```

2. **Install dependencies for each service**:

```bash
# User Service
cd user
npm install
cd ..

# Author Service
cd author
npm install
cd ..

# Blog Service
cd blog
npm install
cd ..
```

3. **Configure environment variables**:
   - Create `.env` files in each service directory
   - Add the required environment variables as specified above

4. **Start RabbitMQ** (if running locally):
```bash
# Using Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Or install RabbitMQ locally and start the service
```

5. **Start Redis** (if running locally):
```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:latest

# Or install Redis locally and start the service
```

6. **Start MongoDB** (if running locally):
```bash
# Using Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Or install MongoDB locally and start the service
```

7. **Build and start each service**:

**User Service**:
```bash
cd user
npm run build
npm start
# Or for development:
npm run dev
```

**Author Service**:
```bash
cd author
npm run build
npm start
# Or for development:
npm run dev
```

**Blog Service**:
```bash
cd blog
npm run build
npm start
# Or for development:
npm run dev
```

### Development Mode

Each service supports a development mode that watches for file changes:

```bash
npm run dev
```

This command:
- Compiles TypeScript in watch mode
- Restarts the server automatically on file changes using nodemon

---

## Communication Flow

### Cache Invalidation Flow

1. **Author creates/updates/deletes a blog**:
   - Author Service performs the database operation
   - Author Service publishes a cache invalidation message to RabbitMQ queue `cache-invalidation`
   - Message contains cache key patterns to invalidate (e.g., `["blogs:*", "blog:123"]`)

2. **Blog Service consumes the message**:
   - Blog Service's RabbitMQ consumer receives the invalidation message
   - Redis cache keys matching the patterns are deleted
   - Cache is rebuilt with fresh data from the database

### Service-to-Service Communication

1. **Blog Service → User Service**:
   - When fetching a single blog, Blog Service makes an HTTP GET request to User Service
   - Endpoint: `GET ${USER_SERVICE_URL}/api/v1/user/:authorId`
   - Returns author information to include in the blog response

### Authentication Flow

1. **User logs in via User Service**:
   - User Service validates credentials and creates/fetches user
   - JWT token is generated with user information
   - Token is returned to the client

2. **Client uses token for authenticated requests**:
   - Client includes token in `Authorization: Bearer <token>` header
   - Author Service and User Service validate the token using `isAuth` middleware
   - If valid, user information is attached to the request object

---

## Project Structure

```
services/
├── user/
│   ├── src/
│   │   ├── controller/
│   │   │   └── user.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── multer.ts
│   │   ├── models/
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   └── user.route.ts
│   │   ├── utils/
│   │   │   ├── db.ts
│   │   │   ├── dataUri.ts
│   │   │   └── TryCatch.ts
│   │   ├── index.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── author/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── blog.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   └── multer.ts
│   │   ├── routes/
│   │   │   └── blog.route.ts
│   │   ├── utils/
│   │   │   ├── db.ts
│   │   │   ├── dataUri.ts
│   │   │   ├── rabbitMQ.ts
│   │   │   └── TryCatch.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── blog/
    ├── src/
    │   ├── controllers/
    │   │   └── blog.controller.ts
    │   ├── middlewares/
    │   │   └── auth.middleware.ts
    │   ├── routes/
    │   │   └── blog.route.ts
    │   ├── utils/
    │   │   ├── consumer.ts
    │   │   ├── db.ts
    │   │   └── TryCatch.ts
    │   └── server.ts
    ├── package.json
    └── tsconfig.json
```

---

## Error Handling

All services use a centralized error handling utility (`TryCatch`) that wraps async route handlers to catch and handle errors consistently. Error responses follow a standard format:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Input Validation**: Email validation, input sanitization
3. **File Upload Security**: File type and size validation
4. **CORS Configuration**: Configurable cross-origin resource sharing
5. **SQL Injection Prevention**: Parameterized queries using Neon serverless
6. **NoSQL Injection Prevention**: Mongoose schema validation

---

## Performance Optimizations

1. **Redis Caching**: Blog data is cached to reduce database queries
2. **Cache Invalidation**: Automatic cache invalidation via RabbitMQ
3. **Image Optimization**: Cloudinary automatic image optimization
4. **Database Indexing**: MongoDB indexes on email field for faster lookups
5. **Connection Pooling**: Neon serverless handles connection pooling

---

## Future Enhancements

- [ ] Add pagination support for blog listings
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Implement comment and saved blog APIs in Blog Service
- [ ] Add comprehensive error logging and monitoring
- [ ] Implement API documentation with Swagger/OpenAPI
- [ ] Add unit and integration tests
- [ ] Implement CI/CD pipeline
- [ ] Add Docker containerization
- [ ] Implement service discovery and load balancing

---

## License

ISC

---

## Support

For issues and questions, please contact the development team or open an issue in the repository.

