// api/history.js - Vercel serverless function for chat history
// ⚠️ NOTE: In-memory storage (resets on deploy/cold start)
// For production, use a database like Upstash Redis, Supabase, or MongoDB

const messageStore = {};

export default async (req, res) => {
    // Enable CORS first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { sessionId } = req.query;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId required' });
    }

    // GET: Retrieve conversation history
    if (req.method === 'GET') {
        const messages = messageStore[sessionId] || [];
        return res.status(200).json({ messages });
    }

    // POST: Save a message to history
    if (req.method === 'POST') {
        const { message, role } = req.body;

        if (!message || !role) {
            return res.status(400).json({ error: 'message and role required' });
        }

        if (!messageStore[sessionId]) {
            messageStore[sessionId] = [];
        }

        messageStore[sessionId].push({
            role,
            message,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json({ success: true, messages: messageStore[sessionId] });
    }

    res.status(405).json({ error: 'Method not allowed' });
};
