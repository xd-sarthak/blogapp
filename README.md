# BlogApp

A modern, full-stack blog application built with a microservices architecture. This platform enables users to create, read, update, and manage blog posts with AI-powered content generation, authentication, comments, and more.

## 🏗️ Architecture Overview

This project follows a **microservices architecture** pattern with three main services:

- **Frontend Service**: Next.js application serving the user interface
- **Author Service**: Handles blog creation, updates, deletions, and AI-powered content generation
- **Blog Service**: Manages blog retrieval, comments, saved blogs, and caching
- **User Service**: Handles user authentication, profiles, and OAuth integration

Services communicate via REST APIs and use RabbitMQ for asynchronous message processing (cache invalidation).

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.3.1](https://nextjs.org/) (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com/) (Dialog, Avatar, Select, Label, Separator, Tooltip)
  - [Lucide React](https://lucide.dev/) (Icons)
- **Rich Text Editor**: [Jodit React](https://github.com/jodit/jodit-react) 5.2.19
- **State Management**: React Context API
- **HTTP Client**: Axios 1.9.0
- **Authentication**: Google OAuth via `@react-oauth/google`
- **Notifications**: React Hot Toast 2.5.2
- **Date Handling**: Moment.js 2.30.1

### Backend Services

#### Author Service
- **Runtime**: Node.js with Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: Neon (Serverless PostgreSQL)
- **Image Storage**: Cloudinary
- **Message Queue**: RabbitMQ (AMQP)
- **AI Integration**: Google Generative AI (`@google/genai`, `@google/generative-ai`)
- **File Upload**: Multer

#### Blog Service
- **Runtime**: Node.js with Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: Neon (Serverless PostgreSQL)
- **Caching**: Redis 4.7.0
- **Message Queue**: RabbitMQ (AMQP Consumer)
- **HTTP Client**: Axios

#### User Service
- **Runtime**: Node.js with Express.js 5.1.0
- **Language**: TypeScript 5.8.3
- **Database**: MongoDB with Mongoose 8.13.2
- **Image Storage**: Cloudinary
- **Authentication**: Google OAuth (`googleapis` 148.0.0)
- **File Upload**: Multer

### Infrastructure & Services
- **Message Broker**: RabbitMQ (AMQP Protocol)
- **Cache**: Redis
- **Database**: 
  - Neon PostgreSQL (for blogs, comments, saved blogs)
  - MongoDB (for users)
- **File Storage**: Cloudinary
- **AI**: Google Generative AI

## 📁 Project Structure

```
BlogApp/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── blog/        # Blog pages (view, edit, new, saved)
│   │   │   ├── blogs/       # Blog listing page
│   │   │   ├── login/       # Authentication page
│   │   │   ├── profile/     # User profile pages
│   │   │   └── layout.tsx   # Root layout
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Reusable UI components (Radix UI)
│   │   │   ├── BlogCard.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── sidebar.tsx
│   │   ├── context/         # React Context providers
│   │   │   └── AppContext.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── services/
│   ├── author/              # Author microservice
│   │   ├── src/
│   │   │   ├── controllers/ # Business logic
│   │   │   │   └── blog.ts
│   │   │   ├── middlewares/ # Express middlewares
│   │   │   │   ├── isAuth.ts
│   │   │   │   └── multer.ts
│   │   │   ├── routes/      # API routes
│   │   │   │   └── blog.ts
│   │   │   ├── utils/       # Utility functions
│   │   │   │   ├── db.ts    # Database connection (Neon)
│   │   │   │   ├── rabbitmq.ts
│   │   │   │   ├── dataUri.ts
│   │   │   │   └── TryCatch.ts
│   │   │   └── server.ts    # Express server setup
│   │   └── package.json
│   │
│   ├── blog/                # Blog microservice
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── blog.ts
│   │   │   ├── middleware/
│   │   │   │   └── isAuth.ts
│   │   │   ├── routes/
│   │   │   │   └── blog.ts
│   │   │   ├── utils/
│   │   │   │   ├── db.ts        # Database connection (Neon)
│   │   │   │   ├── consumer.ts  # RabbitMQ consumer
│   │   │   │   └── TryCatch.ts
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── user/                # User microservice
│       ├── src/
│       │   ├── controllers/
│       │   │   └── user.ts
│       │   ├── middleware/
│       │   │   ├── isAuth.ts
│       │   │   └── multer.ts
│       │   ├── model/
│       │   │   └── User.ts      # Mongoose schema
│       │   ├── routes/
│       │   │   └── user.ts
│       │   ├── utils/
│       │   │   ├── db.ts        # MongoDB connection
│       │   │   ├── GoogleConfig.ts
│       │   │   ├── dataUri.ts
│       │   │   └── TryCatch.ts
│       │   └── server.ts
│       └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB instance (local or cloud)
- PostgreSQL database (Neon recommended)
- Redis instance
- RabbitMQ server
- Cloudinary account
- Google Cloud Platform account (for OAuth and Generative AI)

### Environment Variables

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:4001
NEXT_PUBLIC_BLOG_SERVICE_URL=http://localhost:4002
NEXT_PUBLIC_AUTHOR_SERVICE_URL=http://localhost:4003
```

#### Author Service (`services/author/.env`)
```env
PORT=4003
DB_URL=your_neon_postgresql_connection_string
Cloud_Name=your_cloudinary_cloud_name
Cloud_Api_Key=your_cloudinary_api_key
Cloud_Api_Secret=your_cloudinary_api_secret
Rabbimq_Host=your_rabbitmq_host
Rabbimq_Username=your_rabbitmq_username
Rabbimq_Password=your_rabbitmq_password
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_genai_api_key
```

#### Blog Service (`services/blog/.env`)
```env
PORT=4002
DB_URL=your_neon_postgresql_connection_string
REDIS_URL=your_redis_connection_string
Rabbimq_Host=your_rabbitmq_host
Rabbimq_Username=your_rabbitmq_username
Rabbimq_Password=your_rabbitmq_password
JWT_SECRET=your_jwt_secret
```

#### User Service (`services/user/.env`)
```env
PORT=4001
MONGO_URI=your_mongodb_connection_string
Cloud_Name=your_cloudinary_cloud_name
Cloud_Api_Key=your_cloudinary_api_key
Cloud_Api_Secret=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
Google_Client_id=your_google_oauth_client_id
Google_client_secret=your_google_oauth_client_secret
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlogApp
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Author Service Dependencies**
   ```bash
   cd ../services/author
   npm install
   ```

4. **Install Blog Service Dependencies**
   ```bash
   cd ../blog
   npm install
   ```

5. **Install User Service Dependencies**
   ```bash
   cd ../user
   npm install
   ```

### Running the Application

#### Development Mode

1. **Start User Service** (Terminal 1)
   ```bash
   cd services/user
   npm run dev
   ```
   Service runs on port 4001

2. **Start Blog Service** (Terminal 2)
   ```bash
   cd services/blog
   npm run dev
   ```
   Service runs on port 4002

3. **Start Author Service** (Terminal 3)
   ```bash
   cd services/author
   npm run dev
   ```
   Service runs on port 4003

4. **Start Frontend** (Terminal 4)
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on http://localhost:3000

#### Production Build

For each service:
```bash
npm run build
npm start
```

## 📡 API Endpoints

### User Service (`http://localhost:4001/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/login` | Authenticate user with Google OAuth | No |
| GET | `/me` | Get current user profile | Yes |
| GET | `/user/:id` | Get user profile by ID | No |
| POST | `/user/update` | Update user information | Yes |
| POST | `/user/update/pic` | Update profile picture | Yes |

### Blog Service (`http://localhost:4002/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/blog/all` | Get all blogs | No |
| GET | `/blog/:id` | Get single blog by ID | No |
| POST | `/comment/:id` | Add comment to blog | Yes |
| GET | `/comment/:id` | Get all comments for a blog | No |
| DELETE | `/comment/:commentid` | Delete a comment | Yes |
| POST | `/save/:blogid` | Save blog to favorites | Yes |
| GET | `/blog/saved/all` | Get all saved blogs | Yes |

### Author Service (`http://localhost:4003/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/blog/new` | Create new blog post | Yes |
| POST | `/blog/:id` | Update existing blog post | Yes |
| DELETE | `/blog/:id` | Delete blog post | Yes |
| POST | `/ai/title` | Generate blog title using AI | No |
| POST | `/ai/descripiton` | Generate blog description using AI | No |
| POST | `/ai/blog` | Generate full blog content using AI | No |

## 🎨 High-Level Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                  http://localhost:3000                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│   User    │ │   Blog    │ │  Author   │
│  Service  │ │  Service  │ │  Service  │
│  :4001    │ │  :4002    │ │  :4003    │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │
      │             │             │
      ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ MongoDB  │  │ Neon DB  │  │ Neon DB  │
│          │  │ (Redis)  │  │          │
└──────────┘  └────┬─────┘  └─────┬────┘
                   │              │
                   │              │
                   ▼              ▼
            ┌──────────────────┐
            │    RabbitMQ      │
            │  (Message Queue) │
            └──────────────────┘
                   │
                   ▼
            ┌──────────────────┐
            │   Cloudinary     │
            │  (Image Storage) │
            └──────────────────┘
```

### Data Flow

1. **Blog Creation Flow**:
   - User creates blog → Frontend → Author Service
   - Author Service saves to PostgreSQL → Publishes cache invalidation message to RabbitMQ
   - Blog Service consumes message → Invalidates Redis cache → Rebuilds cache

2. **Blog Retrieval Flow**:
   - User requests blogs → Frontend → Blog Service
   - Blog Service checks Redis cache
   - Cache hit → Returns cached data
   - Cache miss → Queries PostgreSQL → Stores in Redis → Returns data

3. **Authentication Flow**:
   - User logs in with Google OAuth → Frontend → User Service
   - User Service verifies token with Google → Creates/Updates user in MongoDB
   - Returns JWT token to frontend

4. **AI Content Generation**:
   - User requests AI generation → Frontend → Author Service
   - Author Service calls Google Generative AI API
   - Returns generated content (title, description, or full blog)

### Database Schema

#### PostgreSQL (Neon) - Blogs, Comments, Saved Blogs

**blogs** table:
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR)
- `description` (VARCHAR)
- `blogcontent` (TEXT)
- `image` (VARCHAR) - Cloudinary URL
- `category` (VARCHAR)
- `author` (VARCHAR) - User ID
- `create_at` (TIMESTAMP)

**comments** table:
- `id` (SERIAL PRIMARY KEY)
- `comment` (VARCHAR)
- `userid` (VARCHAR)
- `username` (VARCHAR)
- `blogid` (VARCHAR)
- `create_at` (TIMESTAMP)

**savedblogs** table:
- `id` (SERIAL PRIMARY KEY)
- `userid` (VARCHAR)
- `blogid` (VARCHAR)
- `create_at` (TIMESTAMP)

#### MongoDB - Users

**users** collection:
- `name` (String, required)
- `email` (String, required, unique)
- `image` (String, required) - Profile picture URL
- `instagram` (String)
- `facebook` (String)
- `linkedin` (String)
- `bio` (String)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Caching Strategy

- **Redis** is used for caching blog listings to improve read performance
- Cache keys follow pattern: `blogs:{searchQuery}:{category}`
- Cache invalidation is handled asynchronously via RabbitMQ:
  - When a blog is created/updated/deleted, Author Service publishes invalidation message
  - Blog Service consumes the message and invalidates matching cache keys
  - Cache is rebuilt with fresh data from database
- Cache TTL: 3600 seconds (1 hour)

### Security

- JWT-based authentication for protected endpoints
- Google OAuth 2.0 for user authentication
- CORS enabled for cross-origin requests
- File upload validation via Multer middleware
- Environment variables for sensitive configuration

## 🔧 Development

### Project Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

**Services (Author, Blog, User):**
- `npm run dev` - Start development server with watch mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Consistent file structure across services

## 📝 Features

- ✅ User authentication with Google OAuth
- ✅ Create, read, update, delete blog posts
- ✅ Rich text editor for blog content
- ✅ Image upload to Cloudinary
- ✅ AI-powered content generation (titles, descriptions, full blogs)
- ✅ Comments on blog posts
- ✅ Save/favorite blogs
- ✅ User profiles with social links
- ✅ Blog categorization
- ✅ Responsive design
- ✅ Caching for improved performance
- ✅ Real-time cache invalidation via message queue

## 🚧 Future Enhancements

- Search functionality
- Blog filtering and sorting
- User follow system
- Email notifications
- Blog analytics
- Admin dashboard
- Multi-image support
- Markdown support
- Export blogs to PDF
- Rate limiting
- API documentation with Swagger/OpenAPI

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: Make sure to configure all environment variables before running the application. Each service requires specific configuration to connect to its dependencies (databases, message queues, cloud services).

