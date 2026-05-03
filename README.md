Task Flow 🚀
A Full Stack Team Task Management Application
Task Flow is a modern full stack project management and collaboration platform where teams can create projects, manage tasks, assign work, and track progress efficiently. The application is designed to improve productivity and simplify team collaboration using a clean and responsive user interface.

📌 Features
🔐 Authentication System


User Signup and Login


JWT-based Authentication


Protected Routes


Secure API Access



📁 Project Management


Create New Projects


View All Projects


Manage Project Details


Organize Team Workflow



✅ Task Management


Create Tasks


Update Task Status


Track Progress


Task Categorization


Manage Deadlines and Workflow



📊 Dashboard


User Dashboard


Project Overview


Task Statistics


Real-Time Project Tracking



🎨 Frontend Features


Responsive UI Design


Modern React Components


Context API State Management


Clean User Experience


Reusable Components



🛠️ Tech Stack
Frontend


React.js


Vite


Axios


CSS



Backend


Node.js


Express.js


JWT Authentication


REST API



Database


MongoDB Atlas


Mongoose



Deployment


GitHub


Railway



📂 Project Structure
TaskFlow/│├── frontend/│   ├── src/│   │   ├── api/│   │   ├── assets/│   │   ├── components/│   │   ├── context/│   │   ├── pages/│   │   ├── styles/│   │   ├── App.jsx│   │   └── main.jsx│   ││   ├── .env│   ├── package.json│   └── vite.config.js│├── server/│   ├── middleware/│   ├── routes/│   ├── .env│   ├── index.js│   ├── initDB.js│   └── package.json│└── README.md

⚙️ Installation Guide
1️⃣ Clone Repository
git clone https://github.com/yourusername/task-flow.git

2️⃣ Navigate Into Project
cd task-flow

🔧 Backend Setup
Go to Server Folder
cd server

Install Dependencies
npm install

Create .env File
PORT=5000MONGO_URI=your_mongodb_connection_stringJWT_SECRET=your_secret_keyCLIENT_URL=http://localhost:5173

Start Backend Server
npm start
OR
node index.js

🎨 Frontend Setup
Open New Terminal
cd frontend

Install Dependencies
npm install

Create .env File
VITE_API_URL=http://localhost:5000

Run Frontend
npm run dev

🌐 Deployment
Backend Deployment


Railway


Frontend Deployment


Railway / Vercel



🔑 Environment Variables
Backend .env
PORT=5000MONGO_URI=your_mongodb_uriJWT_SECRET=your_secret_keyCLIENT_URL=your_frontend_url

Frontend .env
VITE_API_URL=your_backend_url

📡 API Routes
Authentication Routes
MethodRouteDescriptionPOST/api/auth/signupRegister UserPOST/api/auth/loginLogin User

Project Routes
MethodRouteDescriptionGET/api/projectsGet ProjectsPOST/api/projectsCreate Project

Task Routes
MethodRouteDescriptionGET/api/tasksGet TasksPOST/api/tasksCreate Task

🔒 Security Features


JWT Authentication


Protected Backend Routes


Environment Variables


MongoDB Secure Connection


CORS Configuration



🎯 Future Improvements


Role-Based Access Control


Real-Time Chat


Notifications System


Drag and Drop Tasks


Team Invitations


File Upload Support


Dark Mode


Activity Logs



📸 Screenshots
Add your project screenshots here.
Example:
![Dashboard](screenshot.png)

🧠 Learning Outcomes
Through this project, I learned:


Full Stack Development


REST API Creation


Authentication System


MongoDB Integration


Frontend-Backend Communication


Deployment on Railway


Environment Variables Management


Git and GitHub Workflow



👨‍💻 Author
Siddhartha Singh

📄 License
This project is developed for learning and portfolio purposes.

⭐ Support
If you like this project:


Star the repository


Fork the project


Share feedback



🚀 Live Demo
Frontend:
Add frontend deployed URL here
Backend:
Add backend deployed URL here
