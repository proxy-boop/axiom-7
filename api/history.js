// api/history.js - Vercel serverless function for chat history
// Note: In-memory storage (resets on deploy). For persistent storage, use a database.

const messageStore = {};

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
