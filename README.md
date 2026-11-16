# ✦ MailMind – AI-Powered Email Management Dashboard

> A professional SaaS application that lets a **personal assistant** manage a **client's** email inbox with the help of AI — classifying, summarizing, and drafting replies automatically.

---

## Overview

MailMind is a full-stack MERN application built for the assistant–client workflow. An assistant connects the client's email accounts (Gmail / Outlook), and the AI engine automatically classifies every conversation: should the assistant reply, should the client reply, or is no reply needed? The client can review flagged threads, approve AI-drafted replies, or hand them back to the assistant — all from a clean, role-specific dashboard.

---

## Features

### Two-Role System
- **Assistant** – connects accounts, manages inbox, drafts replies, reviews AI output
- **Client** – sees only conversations that need their personal attention, approves or delegates

### AI Email Classification
Every conversation is analyzed and tagged with one of four labels:

| Classification | Meaning |
|---|---|
| `ASSISTANT_TO_REPLY` | Scheduling, admin, routine follow-up — assistant handles it |
| `CLIENT_TO_REPLY` | Personal decisions, approvals, sensitive matters — client must respond |
| `NO_REPLY_NEEDED` | Newsletters, notifications, resolved threads |
| `NEEDS_REVIEW` | Low-confidence AI result — human review required |

### AI Capabilities
- **Email Classification** – subject + body analyzed → structured JSON with label, confidence, reason, priority
- **Email Summarization** – 2–3 sentence conversation summary
- **Reply Drafting** – professional AI-generated email draft in appropriate tone
- **Event Extraction** – meeting dates and appointments parsed from thread

### Email Account Connection (Simulated)
- Connect Gmail and Outlook accounts
- Clearly labelled "Simulated Connection" — no real OAuth
- Seed data (20 realistic conversations) loaded on connect

### Role-Based Access Control
- JWT-secured endpoints; role checked server-side
- Assistants cannot see the full client dashboard; clients see only their queue

### Professional SaaS UI
- Design system with deep-navy primary, Inter font, smooth transitions
- Responsive sidebar layout, toast notifications, loading skeletons

---

## Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| React.js (Vite) | UI framework & build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| date-fns | Date formatting |

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express.js | Server framework |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Token (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| dotenv | Environment config |
| cors | Cross-origin resource sharing |

### AI
- **OpenAI API** (GPT-4o-mini) — used when `OPENAI_API_KEY` is set
- **Intelligent keyword-based mock** — fully functional fallback when no API key is provided; covers all four classification labels with deterministic logic

---

## Project Structure

```
TASK/
├── backend/
│   ├── src/
│   │   ├── config/            # DB connection, environment validation
│   │   ├── controllers/       # Route handlers (auth, accounts, conversations, AI, client, replies, notifications)
│   │   ├── middleware/        # JWT auth guard, error handler, request validation
│   │   ├── models/            # Mongoose schemas (see Database Design)
│   │   ├── routes/            # Express routers — mounted in server.js
│   │   ├── services/          # Business logic: AI service, mock email seeder
│   │   └── utils/             # Shared helpers (response formatter, logger)
│   ├── server.js              # Entry point: Express app + DB connect + seed
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/            # Static images, logo
│   │   ├── components/        # Reusable UI: Sidebar, ConversationCard, AISummary, etc.
│   │   ├── pages/             # Route-level pages: Login, Dashboard, ConversationDetail, etc.
│   │   ├── layouts/           # AppShell layout (authenticated), AuthLayout (public)
│   │   ├── services/          # Axios API client modules (auth, conversations, ai, accounts)
│   │   ├── hooks/             # Custom hooks: useAuth, useConversations, useNotifications
│   │   ├── context/           # AuthContext, ThemeContext
│   │   └── utils/             # Date helpers, classification badge mapping
│   ├── index.html
│   └── package.json
├── README.md                  # This file
├── DEMO_GUIDE.md              # 15-minute demo walkthrough script
├── ARCHITECTURE.md            # Architecture reference
└── .gitignore
```

---

## Quick Start

### Prerequisites
- **Node.js 18+** (`node -v` to check)
- **MongoDB** running locally on port 27017, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### Installation

```bash
# 1. Clone or download the project
cd TASK

# 2. Backend setup
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and optionally OPENAI_API_KEY
npm install
npm start
# → Server starts on http://localhost:5000
# → Database seeded automatically on first run

# 3. Frontend setup (open a new terminal)
cd ../frontend
npm install
npm run dev
# → App available at http://localhost:5173
```

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Assistant | assistant@demo.com | Demo1234! |
| Client | client@demo.com | Demo1234! |

> **Note:** Demo users and 20 sample email conversations are automatically seeded on first startup. No manual database setup required.

---

## Environment Variables

Create `backend/.env` by copying `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/email-dashboard
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=optional_put_your_openai_key_here
NODE_ENV=development
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 5000) | Express server port |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret used to sign JWTs — use a long random string in production |
| `JWT_EXPIRES_IN` | No (default 7d) | Token expiry duration |
| `OPENAI_API_KEY` | No | If set, uses GPT-4o-mini; otherwise falls back to keyword mock |
| `NODE_ENV` | No | `development` or `production` |

---

## API Reference

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Bearer JWT | Get current user profile |

### Email Accounts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/accounts` | Assistant | List connected accounts |
| POST | `/api/accounts/connect` | Assistant | Connect Gmail or Outlook (simulated) |
| DELETE | `/api/accounts/:id` | Assistant | Disconnect an account |

### Conversations
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/conversations` | Assistant | List conversations; supports `?category=`, `?search=`, `?sort=`, `?page=` |
| GET | `/api/conversations/:id` | Assistant | Get conversation + messages + AI analysis |
| PATCH | `/api/conversations/:id` | Assistant | Update status, assignment, read state |

### AI Engine
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/classify` | Assistant | Classify a conversation (GPT or mock) |
| POST | `/api/ai/summarize` | Assistant | Generate a 2–3 sentence summary |
| POST | `/api/ai/generate-reply` | Assistant | Draft a reply email |
| POST | `/api/ai/extract-events` | Assistant | Extract meeting / appointment events |

### Client Portal
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/client/attention` | Client | Conversations flagged `CLIENT_TO_REPLY` |
| PATCH | `/api/client/conversations/:id/handled` | Client | Mark as handled by client |
| PATCH | `/api/client/conversations/:id/take-over` | Client | Reassign to assistant |

### Replies
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/replies/draft` | Assistant | Save or update a reply draft |
| POST | `/api/replies/:id/send` | Assistant | "Send" a draft (simulated) |

### Notifications
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | JWT | List notifications for current user |
| PATCH | `/api/notifications/:id/read` | JWT | Mark a notification as read |

---

## Database Design

### `users`
Stores registered users with hashed passwords and their role.

| Field | Type | Notes |
|---|---|---|
| `name` | String | Display name |
| `email` | String | Unique, used for login |
| `passwordHash` | String | bcrypt hash |
| `role` | Enum | `assistant` or `client` |
| `connectedAccounts` | Array | Refs to emailAccounts |

### `emailAccounts`
One document per connected email account per user.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Owner reference |
| `provider` | Enum | `gmail` or `outlook` |
| `email` | String | Account email address |
| `status` | String | `connected`, `disconnected` |
| `lastSynced` | Date | Last seed/sync time |
| `isSimulated` | Boolean | Always `true` in this demo |

### `conversations`
Email thread index — one document per thread.

| Field | Type | Notes |
|---|---|---|
| `accountId` | ObjectId | Parent email account |
| `subject` | String | Thread subject |
| `participants` | Array | fromEmail / toEmail participants |
| `lastMessageAt` | Date | For sorting |
| `isRead` | Boolean | |
| `isImportant` | Boolean | |
| `isArchived` | Boolean | |
| `status` | Enum | `open`, `completed`, `archived` |
| `aiClassification` | String | AI-assigned label |
| `manualClassification` | String | Human override |
| `priority` | Enum | `high`, `medium`, `low` |
| `assignedTo` | Enum | `assistant`, `client`, `none` |
| `requiresAction` | Boolean | |
| `waitingForResponse` | Boolean | |

### `messages`
Individual emails within a conversation thread.

| Field | Type | Notes |
|---|---|---|
| `conversationId` | ObjectId | Parent thread |
| `fromEmail` | String | |
| `fromName` | String | |
| `toEmail` | String | |
| `body` | String | Plain text body |
| `htmlBody` | String | Optional HTML version |
| `timestamp` | Date | |
| `isRead` | Boolean | |

### `aiAnalysis`
Stores the latest AI analysis result for each conversation.

| Field | Type | Notes |
|---|---|---|
| `conversationId` | ObjectId | One-to-one with conversations |
| `classification` | Enum | The four classification labels |
| `confidence` | Number | 0–1 confidence score |
| `reason` | String | AI explanation |
| `summary` | String | 2–3 sentence summary |
| `priority` | Enum | `high`, `medium`, `low` |
| `requiresAction` | Boolean | |
| `extractedEvents` | Array | `{ title, date, description }` |
| `suggestedReply` | String | Draft reply text |
| `analyzedAt` | Date | |

### `replyDrafts`
Tracks reply drafts through their lifecycle.

| Field | Type | Notes |
|---|---|---|
| `conversationId` | ObjectId | |
| `authorId` | ObjectId | User who created the draft |
| `to` | String | Recipient email |
| `subject` | String | |
| `body` | String | Draft body |
| `status` | Enum | `draft`, `approved`, `sent_simulated` |
| `aiGenerated` | Boolean | Was this AI-drafted? |

### `notifications`
In-app notifications for both roles.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | Recipient |
| `type` | String | `new_email`, `reply_needed`, `client_action`, etc. |
| `title` | String | |
| `body` | String | |
| `isRead` | Boolean | |
| `link` | String | Deep-link path |

---

## AI Functionality

### Real AI (OpenAI GPT-4o-mini)
When `OPENAI_API_KEY` is set in `.env`, the AI service calls OpenAI's chat completions API with a structured system prompt. The model returns a JSON object:

```json
{
  "classification": "ASSISTANT_TO_REPLY",
  "confidence": 0.92,
  "reason": "Routine scheduling request that the assistant can handle independently.",
  "summary": "John is requesting a reschedule of next week's board meeting to Thursday.",
  "priority": "medium",
  "requiresAction": true,
  "suggestedReply": "Hi John, ..."
}
```

### Mock AI (keyword-based fallback)
When no API key is set, an intelligent rule-based classifier runs locally at zero cost:

| Keywords detected | Classification |
|---|---|
| `schedule`, `meeting`, `reschedule`, `appointment`, `book`, `calendar` | `ASSISTANT_TO_REPLY` |
| `contract`, `approve`, `sign`, `decision`, `partnership`, `legal` | `CLIENT_TO_REPLY` |
| `newsletter`, `unsubscribe`, `no-reply`, `notification`, `receipt` | `NO_REPLY_NEEDED` |
| Low-confidence or ambiguous | `NEEDS_REVIEW` |

The mock returns the same JSON structure as the real AI, so switching between them requires only adding/removing the API key.

### Summarization
Produces a 2–3 sentence plain-English summary of the full thread context.

### Reply Generation
Generates a professional draft using the conversation context, the classification label, and the detected priority level.

### Event Extraction
Scans thread bodies for temporal expressions (dates, times, "next Tuesday", etc.) and returns structured event objects for calendar integration.

---

## Simulated Features

The following features are intentionally simulated for demo purposes:

| Feature | Reality | In this app |
|---|---|---|
| Gmail / Outlook OAuth | Requires Google / Microsoft credentials & OAuth flow | Clicking "Connect" creates a mock account and loads seed data |
| Email syncing | IMAP/SMTP polling | 20 pre-seeded conversations loaded once on account connect |
| Sending a reply | SMTP delivery | Draft marked `sent_simulated`; no email is actually sent |
| Read receipts | Requires mail server | Not implemented |

All simulated actions are clearly labelled in the UI ("Simulated Connection", "Simulated Send") so there is no confusion during demos.

---

## Known Limitations

- No real email provider integration (OAuth / IMAP / SMTP)
- No real-time sync (WebSocket or polling)
- AI mock may mis-classify edge cases or ambiguous subjects
- No email attachment support
- No multi-tenant isolation (all users share the same DB namespace in dev)
- No email pagination on the seed data (all 20 conversations loaded at once)

---

## Testing

Manual testing checklist — verify each flow after setup:

### Authentication
- [ ] Register a new account (assistant role)
- [ ] Login with wrong password → error shown
- [ ] Login with assistant@demo.com / Demo1234! → assistant dashboard
- [ ] Login with client@demo.com / Demo1234! → client dashboard
- [ ] Token expiry handled gracefully (auto logout)

### Account Connection
- [ ] Connect Gmail → "Simulated Connection" badge shown
- [ ] Connect Outlook → second account appears in list
- [ ] Disconnect an account → conversations from that account hidden

### Assistant Workflow
- [ ] View full conversation list with search and filters
- [ ] Open a conversation → messages displayed in thread order
- [ ] Trigger AI classification → badge updates
- [ ] View AI summary panel
- [ ] Generate AI reply draft
- [ ] Edit draft manually
- [ ] Approve & send (simulated) → status changes to `sent_simulated`
- [ ] Mark conversation as archived

### Client Workflow
- [ ] Client sees only `CLIENT_TO_REPLY` conversations
- [ ] Client can view AI summary
- [ ] "Let Assistant Handle" → reassigns to assistant
- [ ] "Mark as Handled" → removes from client queue

### Notifications
- [ ] New conversation triggers notification for assistant
- [ ] Client receives notification when flagged `CLIENT_TO_REPLY`
- [ ] Notification marked read on click

---

## License

MIT © 2024 MailMind Contributors
