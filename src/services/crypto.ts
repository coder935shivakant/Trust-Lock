import { Block, Transaction, BlockchainIntegrityReport } from '../types/blockchain';

/**
 * Computes standard SHA-256 hash using the native browser Web Crypto API
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes Merkle Tree Root for a list of transactions
 */
export async function computeMerkleRoot(transactions: Transaction[]): Promise<string> {
  if (transactions.length === 0) {
    return await sha256('EMPTY_BLOCK_MERKLE_ROOT');
  }

  let hashes = await Promise.all(
    transactions.map(tx => sha256(`${tx.id}:${tx.type}:${tx.from}:${tx.to}:${tx.amount}:${tx.timestamp}`))
  );

  while (hashes.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : hashes[i]; // duplicate odd leaf
      const combined = await sha256(left + right);
      nextLevel.push(combined);
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

/**
 * Calculates cryptographic block hash from block headers
 */
export async function calculateBlockHash(
  index: number,
  previousHash: string,
  timestamp: number,
  merkleRoot: string,
  nonce: number
): Promise<string> {
  const rawString = `${index}:${previousHash}:${timestamp}:${merkleRoot}:${nonce}`;
  return await sha256(rawString);
}

/**
 * Cryptographic digital signature generation using private key and payload
 */
export async function signTransactionPayload(
  privateKey: string,
  txData: { from: string; to: string; amount: number; type: string; timestamp: number }
): Promise<string> {
  const serialized = JSON.stringify(txData);
  const sigSeed = `${privateKey}::${serialized}`;
  const fullHash = await sha256(sigSeed);
  return '0x' + fullHash.slice(0, 40) + '...sig';
}

/**
 * Mine a new block with a small PoW / PoA challenge (e.g. hash prefix)
 */
export async function mineBlock(
  index: number,
  previousHash: string,
  transactions: Transaction[],
  validator: string,
  difficulty: number = 1
): Promise<Block> {
  const timestamp = Date.now();
  const merkleRoot = await computeMerkleRoot(transactions);
  let nonce = 0;
  let hash = '';
  const prefix = '0'.repeat(difficulty);

  // Fast proof of work simulation
  while (true) {
    hash = await calculateBlockHash(index, previousHash, timestamp, merkleRoot, nonce);
    if (hash.startsWith(prefix) || nonce > 2000) {
      break;
    }
    nonce++;
  }

  return {
    index,
    timestamp,
    previousHash,
    hash,
    transactions,
    merkleRoot,
    nonce,
    validator,
  };
}

/**
 * Comprehensive blockchain cryptographic integrity verification
 * Checks:
 * 1. Genesis block integrity
 * 2. Each block's calculated hash equals its stored hash
 * 3. Each block's previousHash matches the prior block's hash
 * 4. Each block's Merkle root accurately matches its transactions
 */
export async function verifyChainIntegrity(chain: Block[]): Promise<BlockchainIntegrityReport> {
  const totalBlocks = chain.length;
  let totalTxs = 0;

  for (let i = 0; i < chain.length; i++) {
    const currentBlock = chain[i];
    totalTxs += currentBlock.transactions.length;

    // 1. Verify Merkle root matches current transactions
    const computedMerkle = await computeMerkleRoot(currentBlock.transactions);
    if (computedMerkle !== currentBlock.merkleRoot) {
      return {
        isValid: false,
        brokenBlockIndex: currentBlock.index,
        expectedHash: computedMerkle,
        actualHash: currentBlock.merkleRoot,
        details: `Block #${currentBlock.index} Merkle Root mismatch! Transactions inside this block have been altered.`,
        verifiedAt: Date.now(),
        totalBlocks,
        totalTxs,
      };
    }

    // 2. Verify Block Hash matches header inputs
    const computedHash = await calculateBlockHash(
      currentBlock.index,
      currentBlock.previousHash,
      currentBlock.timestamp,
      currentBlock.merkleRoot,
      currentBlock.nonce
    );

    if (computedHash !== currentBlock.hash) {
      return {
        isValid: false,
        brokenBlockIndex: currentBlock.index,
        expectedHash: computedHash,
        actualHash: currentBlock.hash,
        details: `Block #${currentBlock.index} Hash mismatch! Computed hash does not match stored block header.`,
        verifiedAt: Date.now(),
        totalBlocks,
        totalTxs,
      };
    }

    // 3. Verify link to previous block
    if (i > 0) {
      const previousBlock = chain[i - 1];
      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          isValid: false,
          brokenBlockIndex: currentBlock.index,
          expectedHash: previousBlock.hash,
          actualHash: currentBlock.previousHash,
          details: `Broken Hash Link! Block #${currentBlock.index}'s previousHash does not match Block #${previousBlock.index}'s hash. The chain is severed.`,
          verifiedAt: Date.now(),
          totalBlocks,
          totalTxs,
        };
      }
    }
  }

  return {
    isValid: true,
    verifiedAt: Date.now(),
    totalBlocks,
    totalTxs,
  };
}
