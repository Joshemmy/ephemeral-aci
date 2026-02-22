// src/treasury.ts
import { Connection, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { verifyIntent } from "./firewall";
import { AgentIntent } from "./agent";
import { MOCK_YIELD_VAULT } from "./constants";
import dotenv from "dotenv";

dotenv.config();

// 1. Initialize Network & Vault
const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
const treasurySecret = bs58.decode(process.env.TREASURY_PRIVATE_KEY as string);
const treasuryKeypair = Keypair.fromSecretKey(treasurySecret);

export async function executeJIT(intent: AgentIntent) {
    console.log(`\n🏦 TREASURY: Received intent to ${intent.action} ${intent.amount} ${intent.token}`);

    // 2. The Semantic Firewall Check
    const isApproved = await verifyIntent(intent);
    if (!isApproved) {
        console.error("⛔ TREASURY: Execution halted by Firewall.");
        return;
    }

    // 3. Generate JIT Burner Wallet
    console.log("🔥 TREASURY: Generating Ephemeral JIT Wallet...");
    let burnerKeypair: Keypair | null = Keypair.generate();
    console.log(`   -> Burner PubKey: ${burnerKeypair.publicKey.toBase58()}`);

    try {
        // Calculate exact funds needed (Mocking 1 Token = 0.001 SOL for reliable Devnet execution)
        const amountInLamports = intent.amount * 0.001 * LAMPORTS_PER_SOL;
        const gasBuffer = 0.005 * LAMPORTS_PER_SOL;
        const fundingAmount = amountInLamports + gasBuffer;

        // 4. JIT Funding (Treasury -> Burner)
        console.log("💸 TREASURY: Funding Burner Wallet...");
        const fundTx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: treasuryKeypair.publicKey,
                toPubkey: burnerKeypair!.publicKey,
                lamports: fundingAmount,
            })
        );
        await sendAndConfirmTransaction(connection, fundTx, [treasuryKeypair]);
        console.log("   -> Burner Funded.");

        // 5. Execute Protocol Interaction (Burner -> Mock Vault)
        console.log("⚙️  BURNER: Executing DeFi intent...");
        const executeTx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: burnerKeypair!.publicKey,
                toPubkey: MOCK_YIELD_VAULT,
                lamports: amountInLamports,
            })
        );
        const executeSig = await sendAndConfirmTransaction(connection, executeTx, [burnerKeypair!]);
        console.log(`   -> ✅ Execution Success! Devnet Sig: ${executeSig}`);

        // 6. Secure Sweep (Burner -> Treasury)
        console.log("🧹 TREASURY: Sweeping remaining dust...");
        const balance = await connection.getBalance(burnerKeypair!.publicKey);
        const sweepFee = 5000; // Micro-lamports for tx fee
        if (balance > sweepFee) {
            const sweepTx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: burnerKeypair!.publicKey,
                    toPubkey: treasuryKeypair.publicKey,
                    lamports: balance - sweepFee,
                })
            );
            await sendAndConfirmTransaction(connection, sweepTx, [burnerKeypair!]);
            console.log("   -> Dust swept back to Treasury.");
        }

    } catch (error) {
        console.error("❌ TREASURY ERROR: Transaction failed.", error);
    } finally {
        // 7. Cryptographic Destruction
        console.log("💀 TREASURY: Erasing Burner Keypair from memory.");
        burnerKeypair = null;
        console.log("==================================================\n");
    }
}