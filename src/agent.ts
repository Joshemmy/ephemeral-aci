// src/agent.ts
import { GoogleGenAI } from "@google/genai";
import { executeJIT } from "./treasury";
import { MOCK_YIELD_VAULT, ALLOWED_TOKEN_SYMBOL } from "./constants";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AgentIntent {
    action: "deposit" | "withdraw";
    amount: number;
    token: string;
    destination: string;
}

async function parseIntent(userInput: string): Promise<AgentIntent | null> {
    console.log(`\n🧠 AGENT: Processing natural language intent -> "${userInput}"`);

    const prompt = `
    You are an AI DeFi Agent. Convert the user's natural language command into a strict JSON object.
    You MUST output ONLY valid JSON, no markdown formatting, no explanations.
    
    Required keys:
    - action: "deposit" or "withdraw"
    - amount: integer representing token amount
    - token: must be "${ALLOWED_TOKEN_SYMBOL}"
    - destination: must be "${MOCK_YIELD_VAULT.toBase58()}"

    User Command: "${userInput}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // Strip any markdown backticks the LLM might hallucinate
        let cleanJson = response.text?.trim() || "{}";
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.replace(/```json/g, "").replace(/```/g, "").trim();
        }

        const intent: AgentIntent = JSON.parse(cleanJson);
        console.log("🤖 AGENT: Intent structured successfully.");
        return intent;
    } catch (error) {
        console.error("❌ AGENT ERROR: Failed to parse intent from LLM.", error);
        return null;
    }
}

// CLI Execution Entry Point
async function main() {
    const input = process.argv.slice(2).join(" ");
    if (!input) {
        console.error("⚠️ Usage: npx tsx src/agent.ts 'deposit 5 tokens to the vault'");
        return;
    }

    const intent = await parseIntent(input);
    if (intent) {
        await executeJIT(intent);
    }
}

main();