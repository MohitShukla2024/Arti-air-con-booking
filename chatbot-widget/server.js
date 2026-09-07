import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Google Gemini AI
if (!process.env.GEMINI_API_KEY) {
    console.error("WARNING: GEMINI_API_KEY is not set in environment variables!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

const SYSTEM_INSTRUCTION = `You are "Arti Air Assistant", a friendly, highly intelligent, and helpful customer support representative for Arti Air Con.

- Language Handling: Seamlessly understand and respond in Hinglish, pure Hindi, or English based on how the user communicates. Keep tone natural, polite, and confident (like talking to a real human expert).

- Company Knowledge Base:
  * Brand: Arti Air Con (Certified technicians, 30-minute doorstep arrival guarantee).
  * Contact: +91 9264173334 | Emergency Support: 8271657738.
  * Primary Coverage Areas: Gurgaon, Delhi NCR (Aaya Nagar, DLF, Golf Course Road, etc.).
  * Pricing:
    - Essential AC Service: ₹450 / unit (Jet wash, coil clean, drain flush, 30-day warranty).
    - Window AC Service: Starts ₹400.
    - AC Installation: ₹1200 / unit.
    - AC Uninstallation: Starts ₹600.
    - Capacitor Replacement: Starts ₹950.
    - Annual AMC Package: ₹2,999 / year (covers 2 ACs, 2 free wet jet services, unlimited breakdown calls).
    - Repair/Inspection: Base quote after 21-point diagnosis.

- Troubleshooting Intelligence:
  * If a user describes an issue (e.g., "AC se pani gir raha hai", "AC thanda nahi kar raha", "error code E4"), explain the likely technical cause simply, offer safety tips, and advise booking a technician visit.
  * If gas leakage, burning smell, or sparking is mentioned, immediately warn them to turn off the power and highlight the Emergency Call number (8271657738).

- Lead Collection Workflow:
  * When the user wants to book or request a quote, politely collect:
    1. Name
    2. Phone number
    3. Location/Area
    4. Preferred service & time slot
  * Once details are provided, format them clearly and say "I have forwarded your request to our technical team. They will call you shortly to confirm."
`;

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
});

// Mock function to simulate lead storage
function storeLead(leadData) {
    console.log("---- NEW LEAD CAPTURED ----");
    console.log(leadData);
    console.log("---------------------------");
    // In a real scenario, this would send to a CRM or database
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Convert client history to Gemini format
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Basic heuristic to trigger mock lead storage if we see details
        // In production, use Gemini Function Calling (Tools) for structured extraction.
        const responseLower = responseText.toLowerCase();
        if (responseLower.includes("forwarded your request") || responseLower.includes("team will call you")) {
             storeLead({
                 timestamp: new Date().toISOString(),
                 lastMessage: message,
                 agentReply: responseText
             });
        }
        
        res.json({ response: responseText });
    } catch (error) {
        console.error('Error handling chat:', error);
        res.status(500).json({ error: 'Failed to process chat message. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Arti Air Chatbot backend running on http://localhost:${PORT}`);
});
