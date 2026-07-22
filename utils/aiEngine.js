import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Triages customer ticket queries, extracts metadata, and generates summaries/drafts.
 * @param {string} customerQuery - The raw query submitted by the user.
 * @returns {Promise<Object>} Formatted JSON containing category, urgency, sentiment, summary, and response draft.
 */
export async function triageTicket(customerQuery) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("Error: OPENAI_API_KEY is missing from .env file!");
  }

  const openai = new OpenAI({ apiKey: apiKey });

  const systemPrompt = `
You are an expert AI triage engine for a customer support platform.
Analyze the customer query and respond ONLY with a valid JSON object matching this schema:
{
  "category": "Billing" | "Tech Support" | "Login / Account",
  "urgency": "Low" | "Medium" | "High",
  "sentiment": "Neutral" | "Frustrated" | "Angry",
  "aiSummary": "One single concise sentence summarizing the issue",
  "autoReplyDraft": "A polite, professional initial draft response addressing the problem"
}

Rules:
- "urgency": Set to "High" for financial issues, critical errors, or account lockout.
- "sentiment": Use "Angry" for severe complaining/hostile tone, "Frustrated" for mild annoyance/delays, "Neutral" for simple questions.
- "aiSummary": Under 15 words.
- Do NOT output markdown formatting like \`\`\`json. Return pure JSON string only.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: customerQuery },
      ],
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error in AI Triage Engine:", error);
    return {
      category: "Tech Support",
      urgency: "Medium",
      sentiment: "Neutral",
      aiSummary: "Failed to generate AI summary.",
      autoReplyDraft: "Hello! Thank you for contacting support. An agent will review your issue shortly."
    };
  }
}