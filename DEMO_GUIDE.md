# 🎬 MailMind – Demo Walkthrough Guide

> **Total time:** ~15 minutes  
> **Goal:** Show a potential client how a personal assistant can manage their inbox with AI — from account connection through classification, summarization, reply drafting, and the client approval loop.

---

## Before You Start

**Checklist (do this 2 minutes before the demo):**
- [ ] Backend running: `cd backend && npm start` → confirm "Server started on port 5000"
- [ ] Frontend running: `cd frontend && npm run dev` → open http://localhost:5173
- [ ] MongoDB connected (seed data loaded automatically on first run)
- [ ] Browser in a clean incognito window (no stale tokens)
- [ ] Keep this guide open in a second tab for reference

---

## Demo Steps

---

### Step 1 — Login as Assistant *(2 min)*

1. Open **http://localhost:5173** in the browser.
2. The login page loads — point out the **clean, professional SaaS design** (deep navy header, Inter font, branded logo).
3. Enter:
   - **Email:** `assistant@demo.com`
   - **Password:** `Demo1234!`
4. Click **Sign In**.

**Talking points:**
> "The login is JWT-based. The backend verifies credentials, issues a signed token, and routes the user to their role-specific dashboard. An assistant and a client see completely different views — same codebase, different experience."

---

### Step 2 — Email Account Onboarding *(1 min)*

> *If this is the very first login and no account is connected, the onboarding flow appears automatically. Otherwise, navigate to **Settings → Accounts → Connect Account**.*

1. Click **"Connect Gmail"**.
2. Notice the **"Simulated Connection"** label — point this out explicitly.
3. A progress bar shows "Syncing emails…"
4. After a moment, 20 realistic conversations load.

**Talking points:**
> "In a real deployment this would be a full OAuth2 flow with Google. For the demo it's simulated — but the data model, the UI, and the AI pipeline are exactly the same."

---

### Step 3 — Assistant Dashboard Overview *(3 min)*

After the sync, the main **Assistant Dashboard** is visible.

Walk through the stats cards at the top:
- **Total conversations** in the inbox
- **Unread** count
- **Client to Reply** — conversations waiting for the client's decision
- **Needs Review** — low-confidence AI results awaiting human review

Then scroll down to the **Recent Conversations** list:
- Each row shows: subject, sender, timestamp, priority badge, and **AI classification chip**.
- Point out that every conversation already has a classification — the AI ran automatically on sync.

**Talking points:**
> "The assistant opens the app and immediately knows what needs their attention, what needs the client's attention, and what can be ignored. No manual sorting."

---

### Step 4 — Email Classification in Action *(3 min)*

#### 4a — ASSISTANT_TO_REPLY example

1. Click the **"Assistant to Reply"** filter tab (or search for "Board Meeting").
2. Open the **"Board Meeting Rescheduled"** conversation.
3. Point out:
   - The **`ASSISTANT_TO_REPLY`** badge (green)
   - Confidence score (e.g. 94%)
   - AI reason: *"Routine scheduling request that the assistant can handle independently."*

**Talking points:**
> "The AI saw keywords like 'reschedule', 'meeting', 'availability' and correctly determined this is an admin task. The assistant can reply without bothering the client."

#### 4b — CLIENT_TO_REPLY example

1. Navigate to the **"Client to Reply"** filter tab.
2. Open the **"Partnership Agreement"** conversation.
3. Point out:
   - The **`CLIENT_TO_REPLY`** badge (amber)
   - Reason: *"Contract approval requires the client's personal sign-off."*

**Talking points:**
> "The AI flagged this because it detected 'partnership', 'agreement', 'approval' — high-stakes keywords. The assistant cannot answer this alone; it's routed to the client automatically."

---

### Step 5 — AI Features Deep Dive *(3 min)*

Stay in the **"Partnership Agreement"** conversation (or any open thread).

#### AI Summary
- The **Summary panel** is visible on the right (or below the thread).
- Read the 2–3 sentence summary aloud.

> "Instead of reading a 6-email chain, the assistant gets a crisp summary in seconds."

#### AI Reply Draft
1. Click **"Prepare AI Reply"**.
2. A professional draft appears in the reply editor.
3. Show that it is **editable** — click into the draft and change a sentence.
4. Click **"Approve & Send"**.
5. A toast notification appears: **"Simulated Send — email delivered"**.
6. The conversation status updates to **"Completed"**.

**Talking points:**
> "The draft is a starting point, not a final answer. The assistant edits it, adds their personal touch, then approves. The 'send' is simulated here — in production it would hit an SMTP relay."

---

### Step 6 — Switch to Client Dashboard *(2 min)*

1. Click **Logout** (top-right avatar menu).
2. Login with:
   - **Email:** `client@demo.com`
   - **Password:** `Demo1234!`
3. The **Client Dashboard** loads — notice it is **minimal and focused**:
   - No full inbox view
   - Only conversations flagged `CLIENT_TO_REPLY` are shown
4. Open the **"Partnership Agreement"** conversation.
5. The AI summary is visible — the client reads it without wading through the full thread.
6. Two action buttons appear:
   - **"Let Assistant Handle"** — reassigns to assistant, removes from client queue
   - **"Mark as Handled"** — client resolves it themselves

7. Click **"Let Assistant Handle"** — the conversation disappears from the client's list.

**Talking points:**
> "The client's experience is intentionally simple. They don't manage an inbox — they make decisions. Everything else is handled for them."

---

### Step 7 — Closed Loop (Back to Assistant) *(1 min)*

1. Click **Logout**.
2. Login again as **`assistant@demo.com` / `Demo1234!`**.
3. Navigate to the **"Partnership Agreement"** conversation.
4. Show that it is now **reassigned to "Assistant"** — the client handed it back.
5. The notification bell shows a new notification: *"Client delegated Partnership Agreement to you."*

**Talking points:**
> "The loop is closed. The assistant is notified, picks it up, and can now draft a holding reply or escalate. No emails, no Slack messages — it's all in the platform."

---

## Q&A Prompts

Use these if the client asks questions:

| Question | Answer |
|---|---|
| "Can it connect to our real Gmail?" | "Yes — this demo simulates OAuth, but the architecture is designed for real Google/Microsoft OAuth2. That would be a one-sprint addition." |
| "How accurate is the classification?" | "With GPT-4o-mini, accuracy on routine business email is 90%+. The NEEDS_REVIEW bucket catches low-confidence cases for human review." |
| "Is email data sent to OpenAI?" | "Only when the OpenAI key is set. The keyword mock keeps everything local. For production, data handling policies and OpenAI's data agreements would apply." |
| "Can we customise the classification rules?" | "The system prompt is fully configurable. You can add domain-specific rules, blocklists, or even fine-tune a model." |
| "What would real send look like?" | "Nodemailer + an SMTP provider (SendGrid, Mailgun, AWS SES). The reply draft pipeline is already in place." |

---

## Demo Reset

To reset the demo to a clean state (e.g. for a second audience):

```bash
# Drop the database and restart — seed runs automatically
mongosh email-dashboard --eval "db.dropDatabase()"
# Then restart the backend: npm start
```

All 20 conversations, both demo users, and all AI analysis records are re-created on first request.
