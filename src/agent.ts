// src/agent.ts
import { MOCK_YIELD_VAULT, ALLOWED_TOKEN_SYMBOL } from "./constants";

/**
 * The strict payload the AI Agent must output. 
 * The Treasury will ONLY parse this exact structure.
 */
export interface AgentIntent {
    action: "deposit" | "withdraw";
    amount: number;
    token: string;       // Must match ALLOWED_TOKEN_SYMBOL
    destination: string; // Must match MOCK_YIELD_VAULT.toBase58()
}

// TODO: Implement the LLM routine that generates this payload.