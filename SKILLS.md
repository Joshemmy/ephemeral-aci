# Agentic Skills Definition (OpenAPI 3.1 Schema)
# This document is formatted for LLM consumption and Tool Calling (MCP compatible).

openapi: 3.1.0
info:
  title: Ephemeral ACI (Agent-Computer Interface)
  version: 1.0.0
  description: Stateless, zero-trust Solana execution engine for AI agents.
servers:
  - url: local_cli_execution
paths:
  /execute_jit:
    post:
      summary: Execute a DeFi transaction via JIT Burner Wallet
      description: Evaluates intent through a Semantic Firewall. If approved, dynamically generates, funds, executes, and destroys an ephemeral Solana keypair.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AgentIntent'
      responses:
        '200':
          description: JIT Execution successful. Returns Devnet signature.
        '403':
          description: Execution halted. Intent rejected by Semantic Firewall.
components:
  schemas:
    AgentIntent:
      type: object
      required:
        - action
        - amount
        - token
        - destination
      properties:
        action:
          type: string
          enum: [deposit, withdraw]
        amount:
          type: number
          description: Positive integer representing token amount.
        token:
          type: string
          enum: [TestUSDC]
        destination:
          type: string
          description: Strict Base58 Solana public key. Must match whitelisted MOCK_YIELD_VAULT.