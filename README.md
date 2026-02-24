# ⚡ Real-Time 1v1 Random Chat App

A modern, real-time random chat application (Omegle style) built with React, Node.js, and Socket.io.

## 🚀 Features

- **Anonymous 1v1 Matching**: Connect with random strangers instantly.
- **Real-Time Messaging**: Built on Socket.io for millisecond-latency communication.
- **JWT Authentication**: Secure login and signup system.
- **Private Rooms**: Each chat session is isolated in a unique socket room.
- **Dynamic Avatars**: Unique avatars for users and partners using DiceBear API.
- **Clean UI**: Dark-themed, responsive sidebar-based layout.
- **Presence Tracking**: Automatic detection of partner disconnects or leaves.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS3, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (Mongoose)
- **Security**: JWT (JSON Web Tokens), Bcrypt for password hashing

## 📦 Installation

### Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```bash
   node server.js
   ```

### Frontend
1. Navigate to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Use
1. Open the application in two different browsers (or one in Incognito).
2. Create two different accounts and log in.
3. Both users should click the "Start Chatting" button.
4. The system will match you instantly, and you can begin messaging!

## 🛡️ Safety Warning
Be careful out there! Don't share personal information with strangers.
