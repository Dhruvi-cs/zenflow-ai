const express = require('express');
const router = express.Router();

let groq = null;
const apiKey = process.env.GROQ_API_KEY;
const isMock = !apiKey || apiKey.startsWith('mock_') || apiKey === 'your_groq_api_key_here';

if (!isMock) {
    try {
        const Groq = require('groq-sdk');
        groq = new Groq({ apiKey });
    } catch (err) {
        console.warn('⚠️ groq-sdk package not installed. Running in Mock AI mode.');
    }
}

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Edge Case: Empty or invalid input check
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ reply: "Please enter a valid message." });
        }

        const lowerMsg = message.toLowerCase().trim();

        // 2. Mock Mode (Runs when no API key is present or groq instance is unavailable)
        if (isMock || !groq) {
            let reply = "I am your ZenFlow AI assistant. You can ask me about tickets, password resets, or account options!";

            if (lowerMsg.includes("history")) {
                reply = "You can view your past and active support tickets on the Ticket History page!";
            } else if (lowerMsg.includes("ticket") || lowerMsg.includes("status")) {
                reply = "I can help track your ticket status! Check the Ticket History page or create a new ticket on the Create Ticket page.";
            } else if (lowerMsg.includes("reset") || lowerMsg.includes("password")) {
                reply = "You can update your account credentials on the Profile page.";
            } else if (lowerMsg.includes("hello") || /\bhi\b/.test(lowerMsg)) {
                reply = "Hello there! How can I assist you with ZenFlow today?";
            }

            return setTimeout(() => {
                res.json({ reply: `[Mock AI]: ${reply}` });
            }, 300);
        }

        // 3. Live Groq Mode
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are ZenFlow AI, an intelligent support assistant for customer inquiries." },
                { role: "user", content: message }
            ],
        });

        const reply = completion.choices[0]?.message?.content || "No response generated.";
        res.json({ reply });

    } catch (error) {
        console.error("AI Route Error:", error);
        res.status(500).json({ 
            reply: "Our AI service is currently experiencing high demand or downtime. Please try again shortly." 
        });
    }
});

module.exports = router;