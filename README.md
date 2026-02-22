# 🛡️ Ephemeral ACI: Zero-Trust Agentic Wallet

**A stateless, JIT (Just-In-Time) execution routing protocol for AI Agents on Solana.**

## 🛑 The Vulnerability in Standard AI Wallets
Current AI wallet architectures rely on static keypairs stored in `.env` files or TEEs. If an agent suffers a prompt injection attack or hallucinates, it has continuous access to drain the treasury. **Static wallets for AI are a structural vulnerability.**

## ⚡ The Ephemeral Solution
Ephemeral ACI introduces a **Zero-Trust, Stateless Architecture**:
1. **The Semantic Firewall:** The AI Agent never touches a private key. It outputs a strictly typed JSON intent. Our LLM-powered firewall mathematically verifies this intent against hardcoded security constraints.
2. **JIT Burner Generation:** If approved, the Treasury dynamically generates a temporary "Burner Wallet" via `@solana/web3.js`.
3. **Atomic Routing & Sweep:** The Treasury funds the Burner with the *exact* micro-lamports needed. The Burner executes the DeFi trade, sweeps the dust back to the Treasury, and explicitly deletes its keypair from memory.

*Attack window: < 3 seconds. Persistent attack surface: Zero.*

## 🚀 Quick Start (Devnet)
\`\`\`bash
# 1. Install Dependencies
npm install

# 2. Setup Environment
cp .env.example .env 
# Add your Gemini API Key and Devnet Treasury Private Key

# 3. Execute Natural Language Command
npx tsx src/agent.ts "deposit 5 tokens to the vault"
\`\`\`

## 🧠 Architecture Deep Dive
- `src/agent.ts`: The natural language parser (Brain).
- `src/firewall.ts`: The deterministic intent verifier (Shield).
- `src/treasury.ts`: The JIT cryptographic execution engine (Vault).
- `SKILLS.md`: OpenAPI 3.1 schema for seamless multi-agent tool integration.