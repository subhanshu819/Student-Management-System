# Student Management System — Backend API

Node.js + Express + Mongoose REST API for Apex University Student Management System.

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js                # Centralized environment variable loader & validation
│   │   └── db.js                 # Mongoose connection manager & health status
│   ├── controllers/
│   │   └── studentController.js  # CRUD and statistics business logic
│   ├── middleware/
│   │   ├── errorHandler.js       # Centralized error handler (Mongoose cast, validation, duplicate key)
│   │   ├── notFoundHandler.js    # 404 Route Not Found handler
│   │   └── validateStudent.js    # Request body & ObjectId validation middleware
│   ├── models/
│   │   └── Student.js            # Mongoose Student Schema with indexes and toJSON transform
│   ├── routes/
│   │   ├── healthRoutes.js       # Health-check route (GET /api/health)
│   │   ├── studentRoutes.js      # Student CRUD routes
│   │   └── index.js              # Combined API router
│   ├── utils/
│   │   ├── AppError.js           # Custom operational error class
│   │   └── seedData.js           # Database seeding script for mock students
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # Server entry point & graceful shutdown
├── .env.example                  # Environment configuration template
├── .env                          # Local environment file (DO NOT commit secrets)
└── package.json
```

## Setup & Configuration

### 1. Configure MongoDB Atlas Connection
Copy `.env.example` to `.env` (already created) and update `MONGODB_URI` with your MongoDB Atlas cluster connection string:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/student_management_db?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
```

> **Security Note**: Never commit actual database passwords or credentials to version control. Keep `.env` in `.gitignore`.

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Seed Database (Optional)
Once your MongoDB Atlas connection string is configured in `.env`:
```bash
npm run seed
```

### 4. Run Automated Test Suite
Run the 16 security and role restriction tests:
```bash
npm test
```

### 5. Run Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## Authentication & Authorization Model

### Roles
- **`admin`**: Full access to all endpoints, student roster, statistics, and create/update/delete operations.
- **`student`**: Restricted access. Public registration strictly creates `student` accounts. Students may view and update **only their own** linked record; they are strictly forbidden from viewing all students, accessing other students' records, or deleting records.

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account (forces `role: 'student'`) |
| `POST` | `/api/auth/login` | Public | Login with email and password, returns JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Student Endpoints (Protected by JWT)
| Method | Endpoint | Required Role / Ownership | Description |
|---|---|---|---|
| `GET` | `/api/students` | `admin` | View all students (search, filter, pagination) |
| `GET` | `/api/students/:id` | `admin` OR `student` (own record only) | View student profile by ID |
| `POST` | `/api/students` | `admin` | Register / Create new student record via admin portal |
| `PUT` | `/api/students/:id` | `admin` OR `student` (own record only) | Update student record (restricted fields protected) |
| `DELETE` | `/api/students/:id` | `admin` | Delete student record permanently |
| `GET` | `/api/students/stats/summary` | `admin` | Aggregate dashboard statistics |

### Health Check
- `GET /api/health` — Checks API server health, uptime, and MongoDB connectivity.

---

## Sample Requests & Responses

### 1. Register (Public Registration)
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Priyanshu Verma",
  "email": "p.verma24@apex.edu.in",
  "password": "SecurePassword123!",
  "rollNumber": "24CS1082",
  "role": "admin"
}
```
*Response (`role` is forced to `student`):*
```json
{
  "success": true,
  "message": "Student account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "673f1f77bcf86cd799439099",
    "fullName": "Priyanshu Verma",
    "email": "p.verma24@apex.edu.in",
    "role": "student",
    "rollNumber": "24CS1082"
  }
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "p.verma24@apex.edu.in",
  "password": "SecurePassword123!"
}
```

### 3. Authenticated Request
Include the JWT token in the `Authorization` header:
```http
GET /api/students/673f1f77bcf86cd799439099
Authorization: Bearer <your_jwt_token>
```
