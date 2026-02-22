// src/constants.ts
import { PublicKey } from "@solana/web3.js";

// The ONLY address the Burner Wallet is allowed to interact with.
// (This is a randomly generated devnet dummy address for the hackathon).
export const MOCK_YIELD_VAULT = new PublicKey("YieldVau1tDummyAddress111111111111111111111");

// The maximum amount of tokens the AI is allowed to request per transaction.
export const MAX_TRANSACTION_LIMIT = 100;

// The accepted token type (e.g., our mock USDC)
export const ALLOWED_TOKEN_SYMBOL = "TestUSDC";