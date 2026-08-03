import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const apiKey = process.env.OPENAI_API_KEY;
const isMock = !apiKey || apiKey.startsWith('mock_') || apiKey === 'your_openai_api_key_here';

let openai;
if (!isMock) {
    openai = new OpenAI({ apiKey });
}

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Edge Case: Empty or invalid input check
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ reply: "Please enter a valid message." });
        }

        const lowerMsg = message.toLowerCase().trim();

        // 2. Mock Mode (Runs when no real API key is present)
        if (isMock) {
            let reply = "I am your ZenFlow AI assistant. You can ask me about tickets, password resets, or account options!";

            // Distinct response matching logic
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
            }, 400);
        }

        // 3. Live OpenAI Mode
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are ZenFlow AI, an intelligent support assistant." },
                { role: "user", content: message }
            ],
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("AI Route Error:", error);

        // Fallback for API key failure, quota limit, or server crash
        res.status(500).json({ 
            reply: "Our AI service is currently experiencing high demand or downtime. Please try again shortly." 
        });
    }
});

export default router;