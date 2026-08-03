import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Triages customer ticket queries, extracts metadata, and generates summaries.
 * @param {string} customerQuery - The raw query submitted by the user.
 * @returns {Promise<Object>} Formatted JSON containing category, urgency, sentiment, and aiSummary.
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
  "aiSummary": "One single concise sentence summarizing the issue"
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
    // Safe fallback object matching Dhruvi's exact schema
    return {
      category: "Tech Support",
      urgency: "Medium",
      sentiment: "Neutral",
      aiSummary: "Failed to generate AI summary."
    };
  }
}

/**
 * Generates an initial response draft for support agents based on ticket query and category.
 * @param {string} customerQuery - The user's issue text.
 * @param {string} category - Category determined by triage (e.g., Billing, Technical Support).
 * @returns {Promise<string>} Editable response draft for the agent.
 */
export async function generateAutoReplyDraft(customerQuery, category) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return "Thank you for reaching out to customer support. An agent will review your issue shortly.";
  }

  const openai = new OpenAI({ apiKey: apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert customer support agent for ZenFlow AI. Draft a polite, professional, and empathetic initial response (< 3-4 sentences) addressing the customer's query under the ${category} department. Do not make unverified promises, but assure them their issue is being investigated.`
        },
        { role: "user", content: customerQuery }
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating reply draft:", error);
    return "Thank you for contacting us. We have logged your request and our support team is working on a resolution.";
  }
}
