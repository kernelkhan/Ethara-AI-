# Team Task Manager (Full-Stack)

A premium, full-stack web application designed for teams to create projects, assign tasks, and track progress using a Kanban board. Built with the MERN stack (MongoDB, Express, React, Node.js) and features a modern glassmorphic UI.

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):** Distinct roles for **Admin** (create projects, assign members, full access) and **Member** (view assigned projects, update task status).
*   **Authentication:** Secure Signup/Login using JWT and bcrypt. Includes a full **Forgot Password** flow via email (Nodemailer).
*   **Project Management:** Admins can create projects and assign specific team members. Members only see projects they are assigned to.
*   **Task Tracking:** Create tasks with due dates, assignees, and projects. 
*   **Interactive Kanban Board:** Drag-and-drop tasks between "Pending", "In Progress", and "Completed" columns for intuitive status tracking.
*   **Dashboard:** Real-time statistics, overdue task warnings, and interactive charts.
*   **Premium UI:** A fully custom, highly responsive CSS design system featuring glassmorphism, smooth animations, and optimized typography (no external CSS frameworks used).

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Axios, Recharts, @hello-pangea/dnd, Lucide React (Icons).
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens (JWT), Nodemailer (Ethereal Mail).
*   **Architecture:** RESTful APIs with Express Validator for robust input sanitization.

## 📦 Local Development Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Environment Variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
   JWT_SECRET=your_super_secret_key
   ```
4. **Run the development servers:**
   In one terminal (Backend):
   ```bash
   cd backend && npm run dev
   ```
   In another terminal (Frontend):
   ```bash
   cd frontend && npm run dev
   ```

## 🌐 Deployment (Railway)

This repository is configured as a monorepo optimized for deployment on platforms like Railway. 

1. Create a new project on Railway from your GitHub repo.
2. Add your environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`) to the Railway dashboard.
3. Railway will automatically detect the root `package.json`, install dependencies, build the React frontend, and start the Express server serving the production build.

## 📝 Usage Guide
1. **Register** a new account. The first account should ideally be an Admin (you can change the default role in the backend models if needed for testing, or manually update via DB).
2. **Login** to access the dashboard.
3. Navigate to **Projects** to create a team project.
4. Navigate to **Tasks** to assign work and manage the Kanban board.
