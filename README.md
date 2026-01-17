# Monopoly Online (Nepal Edition) 🎲

**Monopoly Online** is a real-time, multiplayer web implementation of the classic board game, reimagined with a **Nepal theme**. Built with a modern tech stack, it features 3D dice rolling, live state synchronization, and properties based on famous Nepalese cultural and historical locations.

> **Note**: This project is currently in active development.

## 🇳🇵 Features

*   **Nepal-Themed Board**: Standard properties are replaced with Nepalese landmarks such as **Janakpur**, **Birgunj**, **Lakeside Pokhara**, and **Kathmandu**.
*   **Real-Time Multiplayer**: Seamless state synchronization using **Native WebSockets**.
*   **3D Dice Rolling**: Interactive 3D dice simulation powered by **Three.js** (`@react-three/fiber`).
*   **Lobby System**: Create and join games instantly using unique Game IDs.
*   **Responsive UI**: Modern interface built with **Tailwind CSS**, featuring 3D perspective board animations.
*   **In-Memory Game State**: Fast, transient game storage managed directly by the server.

## 🛠 Tech Stack

### Frontend (`/monopoly`)
*   **Framework**: [React](https://react.dev/) (Vite)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **3D Graphics**: [Three.js](https://threejs.org/) via `@react-three/fiber` & `@react-three/drei`
*   **Language**: JavaScript

### Backend (`/monopoly-backend`)
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Communication**: [ws](https://github.com/websockets/ws) (Native WebSockets)
*   **Language**: TypeScript

## 🚀 Getting Started

To run the project locally, you need to start both the backend server and the frontend client.

### Prerequisites
*   Node.js (v16 or higher recommended)
*   npm

### 1. Start the Backend Server
The backend manages the game state and WebSocket connections.

cd monopoly-backend
npm install
npm run dev 

The server will start on port 4000.

### 2. Start the Frontend Client
The frontend provides the game interface.

bash
cd monopoly
npm install
npm run dev
The client will start (usually on port 5173). Open the link provided in your terminal to play.

🤝 Contributing
Fork the repository.
Create a new branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.
