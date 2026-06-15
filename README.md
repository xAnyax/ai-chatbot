# AI Chatbot

A full-stack AI chatbot web app with multi-provider model support, guest mode, user authentication, and persistent chat history. The frontend uses [Puter.js](https://docs.puter.com/) for free AI access (OpenAI, Claude, Gemini, DeepSeek, Grok) with no API keys required for chat.

## Quick Start
### 1. Guest Mode (Without login)
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/Guest_mode.PNG)

### 2. User mode (Register and Login)
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/registerui.PNG)
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/loginui.PNG)

### 3. Create a new chat
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/newchat.PNG)

### 4. AI responses:
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/aichat.PNG)
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/gen.PNG)
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/moreshowcase.PNG)

## Features
### Setting: User can switch provider and model, and modify font size, padding, etc.
![Alt Text](https://github.com/xAnyax/ai-chatbot/raw/main/Showcases%20photo/setting.PNG)

### Chat
- Real-time AI conversations with conversation context (follow-up questions remember prior messages)
- Markdown-formatted assistant replies (headings, lists, bold text, code blocks)
- Multiple chats with titles
- Safe delete flow via **Edit** mode in chat history

### AI Models
Choose a provider and model in **Settings**:
- **OpenAI** — GPT-5.4 Nano, GPT-4.1, and more
- **Claude** — Sonnet 4.6, Haiku 4.5, Opus 4.8, Fable 5
- **Gemini** — 3.5 Flash, 3.1 Pro, 2.5 Flash, and more
- **DeepSeek** — V4 Flash, V4 Pro, V3.2, R1
- **Grok** — Grok 4.3, 4.1 Fast, Build 0.1

Powered by [Puter.js](https://js.puter.com/v2/) — no separate provider API keys needed.

### Guest & Authenticated Modes
| Mode | Chat storage | After page reload |
|---|---|---|
| **Guest** | In-memory only | Chats are cleared |
| **Logged in** | Saved on server per user | Session restores; chats load from server |

- Use the app immediately without an account
- **Login** / **Register** from the sidebar to save chat history
- **Logout** returns you to guest mode

### UI & Settings
- Dark / light theme (saved locally)
- Adjustable font size, line spacing, and message padding
- Responsive layout for desktop and mobile

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Auth | JWT, bcrypt |
| Storage | JSON file persistence (`backend/data/`) |
| AI | Puter.js (client-side) |


### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone https://github.com/your-username/ai-chatbot.git
cd ai-chatbot
npm run install-all
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### 3. Run development servers
1. Run backend
```bash
cd backend
npm run dev
```
2. Run frontend (Open a new terminal)
```bash
cd frontend
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |

## Usage

1. Open http://localhost:3000
2. Click **Start New Chat** or **+ New Chat** and send a message
3. Open **Settings** to change AI provider, model, or display options
4. Optional: click **Login** to register and save chats to your account
5. Use **Edit** in chat history (when logged in) to delete saved chats safely

### Guest mode
Chats exist only for the current browser session. Reloading the page clears guest history.

### Logged-in mode
After login, chats are stored on the server and available on future visits (session persists across reload via `sessionStorage`).

## Project Structure

```
ai-chatbot/
├── frontend/                 # React + Vite app
│   └── src/
│       ├── App.tsx            # Main UI
│       ├── AppContainer.tsx   # State & auth wiring
│       ├── api.ts             # Backend & Puter.js client
│       ├── AuthContext.tsx    # Login / session handling
│       ├── AuthModal.tsx      # Login & register modal
│       ├── FormattedMessage.tsx  # Markdown rendering
│       ├── models.ts          # AI provider definitions
│       └── ...
├── backend/                  # Express API
│   └── src/
│       ├── index.ts           # Server entry
│       ├── routes/
│       │   ├── auth.ts        # Register, login, me
│       │   └── chat.ts        # Chat CRUD
│       ├── store.ts           # Chat persistence
│       ├── userStore.ts       # User persistence
│       └── middleware/auth.ts # JWT middleware
├── package.json              # Root scripts
└── README.md
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account `{ username, email, password }` |
| `POST` | `/api/auth/login` | Sign in `{ email, password }` |
| `GET` | `/api/auth/me` | Current user (Bearer token required) |

### Chats (authenticated)

All chat routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chats` | Create a new chat |
| `GET` | `/api/chats` | List user's chats |
| `GET` | `/api/chats/:id/messages` | Get messages for a chat |
| `DELETE` | `/api/chats/:id` | Delete a chat |
| `POST` | `/api/chat/message` | Save user + AI messages `{ chatId, userMessage, aiResponse }` |

> AI responses are generated in the browser via Puter.js. The backend stores conversation history for logged-in users only.

## Scripts

```bash
npm run install-all    # Install root, frontend, and backend deps
npm run dev            # Start frontend + backend in dev mode
npm run build          # Build frontend and backend
npm run start          # Run production build
npm run lint           # Lint frontend and backend
```

## Production Build

```bash
npm run build
npm run start
```

For production, set a strong `JWT_SECRET` in `backend/.env` and consider replacing JSON file storage with a database (PostgreSQL, MongoDB, etc.).

## Troubleshooting

**Port already in use**  
Change the frontend port in `frontend/vite.config.ts` or backend port in `backend/.env`.

**CORS errors**  
Ensure the backend is running on port 5000 and CORS is enabled in `backend/src/index.ts`.

**AI not responding**  
Check the browser console and your backend terminal. Puter.js requires network access; ad blockers may interfere with WebSocket connections to `api.puter.com`

**Login works but chats are empty**  
Chats are only persisted for authenticated users. Guest chats are never saved to the server.

## Puter.js Resources

- [Puter.js Docs](https://docs.puter.com/)
- [Claude via Puter.js](https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/)
- [Gemini via Puter.js](https://developer.puter.com/tutorials/free-gemini-api/)
- [DeepSeek via Puter.js](https://developer.puter.com/tutorials/free-unlimited-deepseek-api/)
- [Grok via Puter.js](https://developer.puter.com/tutorials/free-unlimited-grok-api/)

