# My-Personal-Backend

Backend API for My Personal Dashboard built with Node.js, Express, and TypeScript.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing

## Getting Started

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

The server will start on `http://localhost:3000`

### Build

```bash
npm run build
# or
pnpm build
```

### Production

```bash
npm start
# or
pnpm start
```

## API Endpoints

### Users

- `POST /api/users/signup` - Create new user (sign up)
- `GET /api/users/:id` - Get user by ID

### Upload

- `POST /api/upload` - Upload image file (multipart/form-data with field name 'image')

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects?userId=1` - Get projects for a specific user
- `GET /api/projects/search?q=query&userId=1` - Search projects by name (optional userId filter)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id?userId=1` - Delete project

### Health Check

- `GET /health` - Server health status

## Project Structure

```
My-Personal-Backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models and storage
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── dist/                # Compiled JavaScript
└── package.json
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=143.198.95.222
DB_PORT=5432
DB_NAME=db
DB_USER=admin
DB_PASSWORD=ddd
DB_SSL=false

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9001
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=project-images
MINIO_PUBLIC_URL=http://localhost:9001
```

**Note:** 
- The database credentials are pre-configured. Make sure your PostgreSQL server is accessible and the database exists.
- MinIO is used for image storage. Update `MINIO_ENDPOINT` and `MINIO_PUBLIC_URL` to match your MinIO server address.
- `MINIO_PUBLIC_URL` should be the publicly accessible URL for MinIO (used for generating image URLs).

## Example API Requests

### Sign Up (Create User)

```bash
curl -X POST http://localhost:3000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "passwordHash": "hashed_password_here"
  }'
```

**Note:** In production, password should be hashed on the backend. For now, client sends passwordHash.

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "projectName": "My Project",
    "description": "Project description",
    "image": "https://example.com/image.jpg"
  }'
```

**Note:** `userId` and `projectName` are required. `image` and `description` are optional.

### Get All Projects

```bash
curl http://localhost:3000/api/projects
```

### Search Projects

```bash
# Search all projects
curl http://localhost:3000/api/projects/search?q=project

# Search projects for a specific user
curl http://localhost:3000/api/projects/search?q=project&userId=1
```

### Get Projects by User

```bash
# Get all projects for a specific user
curl http://localhost:3000/api/projects?userId=1
```

## Database Setup

The backend uses PostgreSQL. On first run, it will automatically:
- Create the `projects` table if it doesn't exist
- Create indexes for better search performance
- Set up triggers for automatic timestamp updates

### Database Schema

**Users Table:**
```sql
users (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Projects Table (1 user : many projects):**
```sql
projects (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name  VARCHAR(200) NOT NULL,
  image         TEXT,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

**Indexes:**
- `idx_projects_user_id` - For faster queries of user's projects
- `idx_projects_project_name` - For search functionality

## Future Enhancements

- [x] PostgreSQL database integration
- [ ] Authentication & Authorization
- [ ] Input validation with Zod
- [ ] Rate limiting
- [ ] Logging with Winston
- [ ] Unit tests
- [ ] Database migrations system
