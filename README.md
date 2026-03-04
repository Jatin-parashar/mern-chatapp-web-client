# Elevate Messaging — Client

React + TypeScript frontend for a real-time chat application with WebRTC calling, file sharing, and group messaging.

## Tech Stack

| | |
|---|---|
| **React 19** | UI with React Compiler (auto-memoization) |
| **TypeScript 5.9** | Strict mode |
| **Vite 7** | Build tool with manual chunk splitting |
| **Redux Toolkit + RTK Query** | State management + API caching |
| **redux-persist** | Auth/user state persisted across sessions |
| **Socket.IO Client 4.8** | Real-time events |
| **simple-peer** | WebRTC wrapper for calls |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui + Radix UI** | Accessible component primitives |
| **dayjs** | Date formatting (2KB vs moment's 67KB) |

## Features

- JWT auth with automatic token refresh
- Real-time messaging via Socket.IO
- Cursor-based message pagination (infinite scroll upward)
- Reply to messages with quoted preview
- File attachments — images, video, audio, documents (validated client-side before upload)
- Typing indicators per conversation
- Message delivery + read receipts (single/double checkmarks)
- Message info modal — per-user delivered/seen status for groups
- Voice and video calls (WebRTC peer-to-peer)
- Call history with duration and status
- User search with debounce
- Group creation with member search
- Online presence indicators
- Edit status message
- Dark/light theme
- Fully responsive — mobile sidebar toggle

## Project Structure

```
src/
├── app/              # Redux store + RTK Query base config
├── components/
│   ├── common/       # AttachmentRenderer, EmptyState
│   ├── layout/
│   │   ├── Chat/     # ChatHeader, ChatWindow, MessageBubble, ChatInput, CallModal, MessageInfoModal
│   │   ├── Sidebar/  # Sidebar, SidebarHeader, ConversationItem, GroupCreationModal, UserSearchItem
│   │   └── CallHistory.tsx
│   ├── theme/        # ThemeProvider, ModeToggle
│   └── ui/           # shadcn/ui components + LoadingSkeletons
├── features/         # RTK Query slices (auth, user, chat, call)
├── hooks/            # useAuth, useConversations, useLogout, useUserSearch
├── pages/            # LoginPage, RegisterPage, ChatPage, NotFoundPage
├── socket/
│   ├── hooks/        # useCall, useChat, usePresence, useTyping
│   └── SocketContext.tsx
├── types/            # entities, api, common, socket
├── utils/            # formatting, helpers, sanitization, toast, notifications, debounce
└── config/
    └── constants.ts  # FILE_CONFIG, TIMING_CONFIG, APP_CONFIG
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running (see server README)

### Install

```bash
cd client
npm install
```

### Environment

```bash
cp .env.example .env
```

```env
VITE_SERVER_URL=http://localhost:3000
```

### Run

```bash
npm run dev        # Development server → http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

## Build Output

Chunks are split for optimal browser caching:

| Chunk | Contents | Gzip |
|---|---|---|
| `react-vendor` | react, react-dom, react-router | ~31 KB |
| `redux-vendor` | @reduxjs/toolkit, react-redux, redux-persist | ~13 KB |
| `socket-vendor` | socket.io-client | ~13 KB |
| `peer` | simple-peer | ~38 KB |
| `emoji-picker` | emoji-picker-react | ~63 KB |
| `ChatPage` | All chat UI | ~63 KB |

After first visit, vendor chunks are cached by the browser and never re-downloaded on deploys — only `ChatPage` changes.

## Performance Notes

- **React Compiler** (`babel-plugin-react-compiler`) — auto-memoizes components and hooks at compile time
- **`memo()`** on `MessageBubble` and `ConversationItem` — prevents re-renders on unrelated state changes
- **RTK Query** — automatic request deduplication, caching, and background refetch
- **Cursor pagination** — loads 50 messages at a time, fetches older messages on scroll-to-top
- **`loading="lazy"`** on all avatar images
- **`drop_console` + `drop_debugger`** in production via terser
- **dayjs** instead of moment — saves ~65 KB gzipped from the bundle

## Socket Events Handled

| Event | Direction | Handler |
|---|---|---|
| `setup` | → Server | On socket connect — marks online, triggers delivery of offline messages |
| `onlineUsers` | ← Server | Updates `state.chat.onlineUsers` |
| `messageReceived` | ← Server | Appends to `state.chat.messages`, emits seen if conversation is open |
| `conversationReceived` | ← Server | Adds new conversation to sidebar |
| `messageDeliveredUpdate` | ← Server | Updates delivery status in message list |
| `messageSeenUpdate` | ← Server | Updates seen status in message list |
| `conversationMessagesSeenUpdate` | ← Server | Bulk seen update for a conversation |
| `typing` / `stopTyping` | ↔ Both | Per-conversation typing indicator |
| `callInitiated` / `callReceived` | ↔ Both | WebRTC offer exchange |
| `callAccepted` / `callDeclined` / `callEnded` | ↔ Both | Call lifecycle |
| `callSignal` | ↔ Both | ICE candidate exchange (trickle ICE) |
| `callPeerDisconnected` | ← Server | Remote peer dropped |

## File Upload Validation (Client-Side)

Validated in `utils/sanitization.ts` before sending to server:

| Type | Max Size | Allowed |
|---|---|---|
| Image | 10 MB | jpeg, png, gif, webp |
| Video | 50 MB | mp4, webm, quicktime (.mov) |
| Audio | — | mpeg, wav, ogg |
| Document | 25 MB | pdf, doc, docx, xls, xlsx, ppt, pptx |

Dangerous extensions (`.exe`, `.bat`, `.sh`, etc.) are blocked. MIME type must match extension.
