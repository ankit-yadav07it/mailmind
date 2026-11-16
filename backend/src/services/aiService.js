const https = require('https');

const schedulingKw = /schedule|meeting|reschedule|appointment|calendar|confirm|book|slot/i;
const clientKw = /decision|approve|your thoughts|personally|confidential|signature|urgent.*response|your direct/i;
const noReplyKw = /newsletter|unsubscribe|notification|no-reply|noreply|digest|automated|do not reply/i;

function mockClassify(subject, body, participants) {
  const text = `${subject} ${body}`;

  if (noReplyKw.test(text)) {
    return {
      classification: 'NO_REPLY_NEEDED',
      confidence: 0.92,
      reason: 'Contains automated/newsletter keywords indicating no reply is expected.',
      summary: 'This is an automated message or newsletter that does not require a response.',
      priority: 'LOW',
      requiresAction: false,
      extractedEvents: [],
    };
  }

  if (clientKw.test(text)) {
    return {
      classification: 'CLIENT_TO_REPLY',
      confidence: 0.88,
      reason: 'Contains decision/approval/confidential keywords requiring client attention.',
      summary: 'This conversation requires a personal decision or approval from the client.',
      priority: 'HIGH',
      requiresAction: true,
      extractedEvents: [],
    };
  }

  if (schedulingKw.test(text)) {
    const events = [];
    if (schedulingKw.test(text)) {
      events.push({ title: subject, date: 'TBD', type: 'meeting' });
    }
    return {
      classification: 'ASSISTANT_TO_REPLY',
      confidence: 0.85,
      reason: 'Contains scheduling/calendar keywords that the assistant can handle.',
      summary: 'This conversation involves scheduling or calendar coordination that the assistant can manage.',
      priority: 'MEDIUM',
      requiresAction: true,
      extractedEvents: events,
    };
  }

  return {
    classification: 'NEEDS_REVIEW',
    confidence: 0.55,
    reason: 'Could not confidently classify based on content. Manual review recommended.',
    summary: 'This conversation requires manual review to determine the appropriate handler.',
    priority: 'MEDIUM',
    requiresAction: false,
    extractedEvents: [],
  };
}

async function classifyConversation(subject, body, participants) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && !apiKey.startsWith('optional')) {
    // Real OpenAI call
    try {
      const prompt = `You are an email classification assistant. Classify this email conversation.

Subject: ${subject}
Body: ${body}
Participants: ${participants.map((p) => p.email || p).join(', ')}

Classify into one of:
- ASSISTANT_TO_REPLY: scheduling, admin, routine follow-up the assistant can handle
- CLIENT_TO_REPLY: personal decisions, approvals, sensitive matters needing client
- NO_REPLY_NEEDED: newsletters, notifications, automated messages
- NEEDS_REVIEW: uncertain, needs human review

Respond with JSON only:
{
  "classification": "...",
  "confidence": 0.0-1.0,
  "reason": "...",
  "summary": "2-3 sentence summary",
  "priority": "HIGH|MEDIUM|LOW",
  "requiresAction": true|false,
  "extractedEvents": [{"title": "...", "date": "...", "type": "meeting|deadline|other"}]
}`;

      const requestBody = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'Content-Length': Buffer.byteLength(requestBody),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
          }
        );
        req.on('error', reject);
        req.write(requestBody);
        req.end();
      });

      const content = result.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      console.error('OpenAI classify error, falling back to mock:', err.message);
      return mockClassify(subject, body, participants);
    }
  }

  return mockClassify(subject, body, participants);
}

async function summarizeConversation(messages) {
  const bodyText = messages.map((m) => `From: ${m.fromName || m.fromEmail}\n${m.body}`).join('\n\n---\n\n');

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && !apiKey.startsWith('optional')) {
    try {
      const prompt = `Summarize this email thread in 2-3 sentences:\n\n${bodyText}`;
      const requestBody = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'Content-Length': Buffer.byteLength(requestBody),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
          }
        );
        req.on('error', reject);
        req.write(requestBody);
        req.end();
      });

      return result.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI summarize error:', err.message);
    }
  }

  // Mock summary
  const count = messages.length;
  const firstFrom = messages[0]?.fromName || messages[0]?.fromEmail || 'Unknown';
  return `This thread contains ${count} message(s) initiated by ${firstFrom}. The conversation covers the subject matter in detail. Please review the messages for full context.`;
}

async function generateReply(conversation, messages, instructions) {
  const lastMessage = messages[messages.length - 1];
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && !apiKey.startsWith('optional')) {
    try {
      const prompt = `You are a professional email assistant. Write a reply to this email.

Subject: ${conversation.subject}
Last message from: ${lastMessage?.fromName || lastMessage?.fromEmail}
Last message body: ${lastMessage?.body}

Instructions: ${instructions || 'Write a professional, helpful response.'}

Write only the email body, no subject line.`;

      const requestBody = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request(
          {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
              'Content-Length': Buffer.byteLength(requestBody),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(JSON.parse(data)));
          }
        );
        req.on('error', reject);
        req.write(requestBody);
        req.end();
      });

      return result.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI generate reply error:', err.message);
    }
  }

  // Mock reply
  return `Dear ${lastMessage?.fromName || 'there'},

Thank you for your email regarding "${conversation.subject}". I have reviewed your message and will follow up with you shortly.

${instructions ? `Regarding your specific request: I will ensure this is handled promptly.` : 'Please let me know if you need any additional information.'}

Best regards,
The Assistant`;
}

async function extractEvents(messages) {
  const bodyText = messages.map((m) => m.body).join('\n\n');
  const events = [];

  // Simple mock extraction
  const datePatterns = [
    /(?:on|at|scheduled for|meeting on)\s+([A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/gi,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
    /([A-Z][a-z]+day,?\s+[A-Z][a-z]+ \d{1,2})/g,
  ];

  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(bodyText)) !== null) {
      events.push({
        title: 'Meeting/Event',
        date: match[1],
        type: 'meeting',
      });
      if (events.length >= 5) break;
    }
    if (events.length >= 5) break;
  }

  return events;
}

module.exports = { classifyConversation, summarizeConversation, generateReply, extractEvents };
