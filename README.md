# 🚀 UnityBoard - Collaborative Project Management Platform

**UnityBoard** is a comprehensive project management and collaboration platform built with the MERN stack. It empowers teams to organize, track, and deliver projects efficiently with real-time collaboration features, AI assistance, and intuitive project workflows.

<img width="1919" height="944" alt="image" src="https://github.com/user-attachments/assets/b61ca4db-aba6-41a7-aaf8-7d4948844558" />


## ✨ Key Features

### 🎯 **Project Management**
- **Project Creation & Management** - Create public/private projects with detailed descriptions
- **Team Collaboration** - Invite members, assign roles (Owner, Admin, Member)
- **Project Dashboard** - Centralized view of all project activities and progress
- **Task Management** - Create, assign, and track tasks with due dates and priorities
- **Project Archives** - Archive completed projects and restore when needed

<img width="1919" height="947" alt="image" src="https://github.com/user-attachments/assets/13951fdc-7aa8-4913-91b5-f2eb17467de7" />

### 🌐 **Explore & Discovery**
- **Public Project Gallery** - Discover and join public projects from the community
- **Project Search & Filtering** - Find projects by name, description, or category
- **One-Click Joining** - Seamlessly join public projects with instant access
- **Project Previews** - View project details before joining

<img width="1919" height="942" alt="image" src="https://github.com/user-attachments/assets/51d0b086-0bb6-4478-9c94-d1840c23ba1b" />


### 💬 **Real-Time Communication**
- **Team Chat** - Built-in messaging system for project discussions
- **Real-Time Updates** - Live notifications and activity feeds
- **Discussion Threads** - Organized conversations around specific topics
- **Message History** - Complete chat history with search capabilities

<img width="1919" height="948" alt="image" src="https://github.com/user-attachments/assets/63ae8158-c5f9-49c1-8d3d-4de805755d9b" />


### 🤖 **AI-Powered Assistant**
- **Smart Suggestions** - AI-powered recommendations for project planning
- **Code Assistance** - Intelligent code snippets and solutions
- **Problem Solving** - Get instant help with technical challenges
- **Context-Aware Help** - AI understands your project context for relevant assistance

<img width="1913" height="943" alt="image" src="https://github.com/user-attachments/assets/e0cf87d1-bb41-4bd8-966a-159ce0cbfbd7" />


### 📚 **Knowledge Management**
- **Resource Vault** - Centralized file storage and sharing
- **Solution Database** - Curated solutions and best practices
- **Smart Snippets** - Code snippets library with categorization
- **Learning Tracker** - Track progress and learning milestones

<img width="1919" height="944" alt="image" src="https://github.com/user-attachments/assets/1617e93d-6b7a-4683-81d2-18fc706b1064" />


### 🔒 **Security & Administration**
- **User Authentication** - Secure JWT-based authentication system
- **Role-Based Access** - Granular permissions for different user roles
- **Admin Panel** - Comprehensive administration dashboard
- **User Management** - Monitor users, projects, and system analytics

<img width="1919" height="947" alt="image" src="https://github.com/user-attachments/assets/c856a0ed-dd66-4b4d-850c-2404e17b2b2f" />


### 📊 **Analytics & Insights**
- **Project Analytics** - Track project progress and team performance
- **User Profiles** - Detailed user profiles with contribution history
- **Activity Tracking** - Monitor user engagement and project activities
- **Progress Reports** - Visual insights into project completion rates

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing and navigation
- **Custom CSS** - Responsive design with clean aesthetics
- **Socket.io Client** - Real-time communication

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Secure authentication tokens

### **AI & Services**
- **Cohere API** - Advanced AI language model integration
- **Cloudinary** - Cloud-based image and file management
- **Nodemon** - Development server auto-restart

### **Development Tools**
- **ESLint** - Code quality and consistency
- **Environment Variables** - Secure configuration management
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection and throttling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Arpit21345/UnityBoard.git
cd UnityBoard/projectUnityBoard
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=unityboard
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COHERE_API_KEY=your-cohere-api-key
ADMIN_EMAIL=admin@unityboard.com
ADMIN_PASSWORD=admin123
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_ENABLE_AI_ASSISTANT=true
VITE_ENABLE_SOCKET=true
```

4. **Admin Panel Setup**
```bash
cd ../admin
npm install
npm run build
```

5. **Start the Application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

Access the application:
- **Main App**: http://localhost:5173
- **Admin Panel**: http://localhost:5000/admin
- **API**: http://localhost:5000/api

## 📱 Application Structure

```
projectUnityBoard/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication, validation
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── dist/admin/         # Built admin panel
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   ├── context/        # React context providers
│   │   └── styles/         # CSS stylesheets
├── admin/                  # Admin panel (React)
│   └── src/
│       ├── components/     # Admin-specific components
│       └── styles/         # Admin panel styles
└── docs/                   # Documentation
```

## 🎯 Core Workflows

### **Project Creation Flow**
1. User creates account or logs in
2. Navigate to Dashboard
3. Click "Create Project" 
4. Fill project details (name, description, visibility)
5. Set up project structure and invite team members
6. Start collaborating with real-time features

### **Team Collaboration Flow**
1. Join project via invite or public discovery
2. Access project workspace with role-based permissions
3. Create and assign tasks to team members
4. Use real-time chat for communication
5. Share resources and files in Resource Vault
6. Track progress through project analytics

### **AI-Assisted Development**
1. Access AI Assistant from any project context
2. Ask questions or request code help
3. Receive contextual suggestions and solutions
4. Save useful snippets to project library
5. Get automated recommendations for project improvement

## 🔐 Authentication & Security

- **JWT-based Authentication** with 7-day token expiration
- **Role-based Access Control** (Owner, Admin, Member)
- **Secure Password Hashing** with bcrypt
- **Rate Limiting** to prevent API abuse
- **CORS Protection** for cross-origin requests
- **Environment-based Configuration** for sensitive data

## 📊 Admin Panel Features



- **User Management** - View and manage all registered users
- **Project Oversight** - Monitor all projects and activities
- **System Analytics** - Track platform usage and performance
- **Content Moderation** - Manage reported content and users
- **Configuration** - System-wide settings and maintenance

Access admin panel at: `http://localhost:5000/admin`
Default credentials: `admin@unityboard.com` / `admin123`

## 🌟 Advanced Features

### **Real-Time Collaboration**
- Live cursor tracking in shared documents
- Instant message delivery and notifications
- Real-time project updates across all connected clients
- Collaborative editing capabilities

### **AI Integration**
- Intelligent code completion and suggestions
- Automated task prioritization
- Smart project timeline recommendations
- Context-aware help and documentation

### **File Management**
- Drag-and-drop file uploads
- Cloud storage integration (Cloudinary)
- Version control for shared documents
- Organized file categorization

## 🚀 Deployment

### **Production Environment**
- Backend: Deploy to Render, Railway, or similar Node.js hosting
- Frontend: Deploy to Vercel, Netlify, or similar static hosting
- Database: Use MongoDB Atlas for production database
- File Storage: Configure Cloudinary for production file handling

### **Environment Variables**
Ensure all production environment variables are properly configured:
- Database connection strings
- JWT secrets (use strong, unique values)
- API keys for external services
- CORS origins for production domains

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MongoDB for flexible data storage
- React community for excellent documentation
- Cohere for AI capabilities
- Socket.io for real-time features
- All contributors and users of UnityBoard

---

**Built with ❤️ by the UnityBoard Team**

For support or questions, please open an issue or contact us at support@unityboard.com
