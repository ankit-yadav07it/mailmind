# AI Email Dashboard – Architecture Reference

## Project Root Structure
```
TASK/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, env config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, error, validation
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   ├── services/      # Business logic, AI, mock email
│   │   └── utils/         # Helpers
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Route-level pages
    │   ├── layouts/       # Shell layouts
    │   ├── services/      # Axios API clients
    │   ├── hooks/         # Custom React hooks
    │   ├── context/       # Auth, Theme contexts
    │   └── utils/
    ├── index.html
    └── package.json
```

## MongoDB Collections
- users: { _id, name, email, passwordHash, role[assistant|client], connectedAccounts[], createdAt }
- emailAccounts: { _id, userId, provider[gmail|outlook], email, status, lastSynced, isSimulated }
- conversations: { _id, accountId, subject, participants[], threadId, lastMessageAt, isRead, isImportant, isArchived, status[open|completed|archived], aiClassification, manualClassification, priority, assignedTo[assistant|client|none], requiresAction, waitingForResponse }
- messages: { _id, conversationId, fromEmail, fromName, toEmail, body, htmlBody, timestamp, isRead }
- aiAnalysis: { _id, conversationId, classification[ASSISTANT_TO_REPLY|CLIENT_TO_REPLY|NO_REPLY_NEEDED|NEEDS_REVIEW], confidence, reason, summary, priority, requiresAction, extractedEvents[], suggestedReply, analyzedAt }
- notifications: { _id, userId, type, title, body, isRead, link, createdAt }
- replyDrafts: { _id, conversationId, authorId, to, subject, body, status[draft|approved|sent_simulated], aiGenerated, createdAt }

## API Surface
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/accounts
POST   /api/accounts/connect
DELETE /api/accounts/:id

GET    /api/conversations          ?category=&search=&sort=&page=
GET    /api/conversations/:id
PATCH  /api/conversations/:id

POST   /api/ai/classify
POST   /api/ai/summarize
POST   /api/ai/generate-reply
POST   /api/ai/extract-events

GET    /api/client/attention
PATCH  /api/client/conversations/:id/handled
PATCH  /api/client/conversations/:id/take-over

POST   /api/replies/draft
POST   /api/replies/:id/send

GET    /api/notifications
PATCH  /api/notifications/:id/read

## Classification Logic
ASSISTANT_TO_REPLY: scheduling, admin, routine follow-up
CLIENT_TO_REPLY: personal decisions, approvals, sensitive
NO_REPLY_NEEDED: newsletters, notifications, resolved
NEEDS_REVIEW: uncertain, low-confidence AI result

## Design Tokens
Primary:    #1E2B4A (deep navy)
Primary-Lt: #2D4080 
Accent:     #4F7CFF (bright blue)
BG:         #F7F8FC
Surface:    #FFFFFF
Border:     #E5E8F0
Text-H:     #111827
Text-B:     #374151
Text-M:     #6B7280
Success:    #16A34A
Warning:    #D97706
Danger:     #DC2626
Font:       Inter, system-ui
