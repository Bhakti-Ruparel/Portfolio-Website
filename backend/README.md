# Task Manager — Backend

A beginner-friendly REST API built with **Node.js**, **Express.js**, and **MongoDB** (via Mongoose).  
Created for Full-Stack Development Practical 4–5.

---

## Technologies Used

| Package    | Purpose                                      |
|------------|----------------------------------------------|
| Node.js    | JavaScript runtime (v18+)                    |
| Express.js | HTTP server and routing framework            |
| MongoDB    | NoSQL database (hosted on MongoDB Atlas)     |
| Mongoose   | ODM — maps JS objects ↔ MongoDB documents    |
| dotenv     | Loads `.env` variables into `process.env`    |
| cors       | Allows the React frontend to call this API   |
| nodemon    | Auto-restarts the server on file save (dev)  |

---

## Project Structure

```
backend/
├── models/
│   └── Task.js          ← Mongoose schema + model
├── routes/
│   └── taskRoutes.js    ← All CRUD route handlers
├── .env                 ← Secret config (NOT in Git)
├── .gitignore
├── package.json
├── server.js            ← App entry point
└── README.md
```

---

## Installation

```bash
# 1. Go into the backend folder
cd backend

# 2. Install all dependencies
npm install
```

---

## MongoDB Setup (Atlas)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in (or create a free account).
2. Create a free **M0** cluster.
3. Under **Database Access** → Add a user with a username and password.
4. Under **Network Access** → Add IP address `0.0.0.0/0` (allows all IPs during development).
5. Click **Connect** → **Drivers** → copy the connection string.  
   It looks like:  
   `mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority`

---

## Environment Variables

Open `.env` and replace the placeholder with your real connection string:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
```

> ⚠️ Never commit `.env` to Git — it is already listed in `.gitignore`.

---

## Starting the Server

```bash
# Development mode (auto-restart on save)
npm run dev

# Production mode
npm start
```

Expected console output:
```
✅  MongoDB connected successfully
🚀  Server running on http://localhost:5000
```

---

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint       | Description          | Success Status |
|--------|----------------|----------------------|----------------|
| GET    | /tasks         | Get all tasks        | 200            |
| GET    | /tasks/:id     | Get one task by ID   | 200            |
| POST   | /tasks         | Create a new task    | 201            |
| PUT    | /tasks/:id     | Update a task by ID  | 200            |
| DELETE | /tasks/:id     | Delete a task by ID  | 200            |

### Response Format

Every response follows this shape:

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Explanation of what went wrong" }
```

---

## Postman Testing Guide

### 1. GET /tasks — Get all tasks
- **Method:** GET  
- **URL:** `http://localhost:5000/tasks`  
- **Body:** none  
- **Expected:** Array of all tasks (empty array `[]` if none exist yet)

---

### 2. POST /tasks — Create a task
- **Method:** POST  
- **URL:** `http://localhost:5000/tasks`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "title": "Learn React",
  "description": "Complete React practical",
  "completed": false
}
```
- **Expected:** Status 201 + the saved task object with a `_id` field  
- **In MongoDB:** A new document appears in the `tasks` collection

---

### 3. GET /tasks/:id — Get one task
- **Method:** GET  
- **URL:** `http://localhost:5000/tasks/<paste _id from step 2>`  
- **Body:** none  
- **Expected:** Status 200 + that single task object

---

### 4. PUT /tasks/:id — Update a task
- **Method:** PUT  
- **URL:** `http://localhost:5000/tasks/<_id>`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**
```json
{
  "title": "Learn React and Node",
  "description": "Complete full-stack practical",
  "completed": true
}
```
- **Expected:** Status 200 + the updated task object  
- **In MongoDB:** The document now shows the new title/description and `completed: true`

---

### 5. DELETE /tasks/:id — Delete a task
- **Method:** DELETE  
- **URL:** `http://localhost:5000/tasks/<_id>`  
- **Body:** none  
- **Expected:** Status 200 + `{ "success": true, "message": "Task deleted successfully" }`  
- **In MongoDB:** The document is permanently removed from the `tasks` collection

---

### Error cases to test

| Scenario                         | What to send                         | Expected response        |
|----------------------------------|--------------------------------------|--------------------------|
| Missing title on POST            | `{}` or `{ "description": "x" }`    | 400 + "Title is required" |
| Wrong ID format                  | `/tasks/abc123`                      | 400 + "Invalid task ID format" |
| Valid ID that doesn't exist in DB| `/tasks/6657f3c2a1b2c3d4e5f60099`   | 404 + "Task not found"   |

---

## Request Flow (for viva)

```
React Frontend (port 5173)
        │  HTTP request (fetch / axios)
        ▼
Express Server (server.js — port 5000)
        │  cors() allows cross-origin requests
        │  express.json() parses the request body
        ▼
Route Handler (routes/taskRoutes.js)
        │  validates the request
        │  calls Mongoose methods
        ▼
Mongoose (models/Task.js)
        │  translates JS calls into MongoDB queries
        ▼
MongoDB Atlas (cloud database)
        │  executes the query, returns documents
        ▼
Route Handler
        │  formats { success, data } response
        ▼
React Frontend receives JSON
```
