# 📄 TaskFlow — Team Task Manager Project

---

## 👤 Candidate Information

**Name:** Siddhartha Singh
**Email:** siddharthasingh1017@gmail.com

---

## 📌 Project Overview

**TaskFlow** is a full-stack collaborative task and project management web application designed to help teams efficiently manage projects, assign tasks, and track progress in a structured workflow environment.

The system is inspired by tools such as Trello and Asana and implements role-based access control to support collaboration between administrators and team members.

The application follows a **MERN-style architecture** with a React frontend and Node.js + Express backend, connected to MongoDB Atlas for persistent data storage.

---

## 🌐 Live Deployment

* **Frontend URL:** [https://invigorating-integrity-production-956f.up.railway.app/](https://invigorating-integrity-production-956f.up.railway.app/)
* **Backend API URL:** [https://team-task-manager-production-914d.up.railway.app](https://team-task-manager-production-914d.up.railway.app)

---

## 🎯 Key Objectives of the Project

* Build a scalable full-stack application using modern web technologies
* Implement secure authentication using JWT
* Design a role-based access control system
* Enable real-time task and project tracking
* Deploy a production-ready application on cloud infrastructure

---

## ✨ Core Features

### 🔐 Authentication System

* User registration and login system
* Secure password hashing using bcrypt
* JWT-based authentication
* Session persistence using local storage

---

### 📁 Project Management

* Create and manage multiple projects
* Assign roles (Admin / Member)
* Admin-controlled team management (add/remove members)
* Project-level collaboration support

---

### ✅ Task Management System

* workflow:

  * To Do
  * In Progress
  * Completed
* Task creation with:

  * Title, description, priority, due date
* Task assignment to team members
* Overdue task identification
* Role-based task permissions

---

### 📊 Dashboard Analytics

* Total task overview
* Task status distribution
* Team workload analysis
* Overdue task tracking

---

## 🔐 Role-Based Access Control

| Feature             | Admin | Member             |
| ------------------- | ----- | ------------------ |
| Create tasks        | ✔     | ✖                  |
| Delete tasks        | ✔     | ✖                  |
| Edit tasks          | ✔     | ✖                  |
| Update task status  | ✔     | ✔ (own tasks only) |
| Manage team members | ✔     | ✖                  |
| View dashboard      | ✔     | ✔                  |

---

## 🛠 Technology Stack

### Frontend

* React.js (Vite)
* React Router
* Axios
* Context API
* CSS (custom styling with variables)

### Backend

* Node.js
* Express.js
* MongoDB (Atlas)
* Mongoose
* JWT Authentication
* bcrypt.js
* CORS middleware

---

## 🏗 System Architecture

The system follows a **client-server architecture**:

* **Frontend Layer:** Handles UI, routing, and API calls
* **Backend Layer:** REST API handling authentication, business logic
* **Database Layer:** MongoDB Atlas for persistent storage

Communication between frontend and backend is handled via RESTful APIs secured using JWT authentication.

---

## ⚙️ Functional Modules

### 1. Authentication Module

Handles user signup, login, and token validation.

### 2. Project Module

Responsible for project creation, member management, and access control.

### 3. Task Module

Handles creation, assignment, updating, and deletion of tasks.

### 4. Dashboard Module

Aggregates system data for analytics and insights.

---

## 🚀 Deployment Details

* Frontend deployed on cloud hosting platform
* Backend deployed as REST API service
* Database hosted on MongoDB Atlas (cloud database)
* Environment variables used for secure configuration

---

## 📌 Key Technical Highlights

* Fully functional REST API architecture
* Secure authentication using JWT
* Role-based authorization system
* Modular and scalable backend structure
* Responsive and dynamic frontend UI
* Cloud-based deployment (production ready)

---

## 🧪 How to Run 

### Backend

```bash
cd server
npm install
npx nodemon index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📎 Conclusion

TaskFlow demonstrates a complete full-stack application covering authentication, authorization, database design, API development, and deployment. The project showcases practical implementation of real-world team collaboration features and scalable backend architecture.
