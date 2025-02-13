# Voice-Controlled Background Changer

A React app that changes the background color using voice commands, with a WebSocket backend.

## Setup

### Frontend
1. Create `.env` in `frontend/`:
   ```env
   REACT_APP_LOCAL_SOCKET_SERVER_URL=http://localhost:7001
   ```
2. Install dependencies and start:
   ```sh
   cd frontend
   npm install
   npm start
   ```

### Backend
1. Create `.env` in `backend/`:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   ```
2. Install dependencies and start:
   ```sh
   cd backend
   npm install
   npm start
   ```

## Usage
- Open the React app and use voice commands like `change background to red`.

