# Task Management API

A comprehensive RESTful API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB** featuring full CRUD operations, JWT authentication, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Role-based access control (User/Admin)
  - Protected routes

- **Project Management**
  - Create, Read, Update, Delete projects
  - Project status tracking (planning, active, on-hold, completed, cancelled)
  - Budget management
  - Tag-based filtering
  - Project statistics

- **Task Management**
  - Full CRUD operations for tasks
  - Task assignment to users
  - Priority levels (low, medium, high, urgent)
  - Status tracking (todo, in-progress, review, done)
  - Time tracking (estimated vs actual hours)
  - Advanced filtering and pagination

- **Technical Features**
  - TypeScript for type safety
  - MongoDB with Mongoose ODM
  - Input validation
  - Error handling middleware
  - CORS enabled
  - Environment-based configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd task-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

5. **Run the application**
   
   Development mode (with hot reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm run build
   npm start
   ```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user profile | Private |
| PUT | `/updatedetails` | Update user details | Private |
| PUT | `/updatepassword` | Update password | Private |

### Project Routes (`/api/projects`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all projects (with filters) | Private |
| POST | `/` | Create new project | Private |
| GET | `/:id` | Get single project | Private |
| PUT | `/:id` | Update project | Private |
| DELETE | `/:id` | Delete project | Private |
| GET | `/:id/stats` | Get project statistics | Private |

### Task Routes (`/api/tasks`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all tasks (with filters) | Private |
| POST | `/` | Create new task | Private |
| GET | `/my-tasks` | Get tasks assigned to current user | Private |
| GET | `/:id` | Get single task | Private |
| PUT | `/:id` | Update task | Private |
| DELETE | `/:id` | Delete task | Private |

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Example Requests

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Project
```json
POST /api/projects
Headers: Authorization: Bearer <token>
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "planning",
  "startDate": "2024-02-01",
  "endDate": "2024-06-30",
  "budget": 50000,
  "tags": ["web", "design", "frontend"]
}
```

### Create Task
```json
POST /api/tasks
Headers: Authorization: Bearer <token>
{
  "title": "Design homepage mockup",
  "description": "Create initial mockup for the homepage",
  "project": "project_id_here",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-02-15",
  "estimatedHours": 8,
  "tags": ["design", "ui"]
}
```

## 🔍 Query Parameters

### Projects
- `status` - Filter by status (planning, active, on-hold, completed, cancelled)
- `tags` - Filter by tags (comma-separated)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Tasks
- `project` - Filter by project ID
- `status` - Filter by status (todo, in-progress, review, done)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assignedTo` - Filter by assigned user ID
- `tags` - Filter by tags (comma-separated)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field (default: -createdAt)

## 🏗️ Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── projectController.ts # Project CRUD operations
│   │   └── taskController.ts    # Task CRUD operations
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   └── errorHandler.ts      # Error handling
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── Project.ts           # Project model
│   │   └── Task.ts              # Task model
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth routes
│   │   ├── projectRoutes.ts     # Project routes
│   │   └── taskRoutes.ts        # Task routes
│   └── server.ts                # App entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── tsconfig.json                # TypeScript config
└── README.md
```

## 🧪 Testing with Postman

1. Import the `postman_collection.json` file into Postman
2. Set up environment variables in Postman:
   - `baseUrl`: http://localhost:5000
   - `token`: (will be set automatically after login)
3. Start with the Register/Login requests
4. The token will be automatically saved for subsequent requests

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prod` - Build and run production server

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token expiration
- Environment variable protection
- Input validation
- MongoDB injection prevention
- CORS configuration

## 📄 License

ISC

## 👨‍💻 Author

Built for job assessment - showcasing Node.js, Express, TypeScript, and MongoDB expertise.

---

**Note**: Remember to change the `JWT_SECRET` in production and never commit your `.env` file to version control.
