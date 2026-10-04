export type Role = 'BUYER' | 'SELLER' | 'ARBITER' | 'VALIDATOR' | 'DAO_JUROR';

export type CurrencyType = 'ETH' | 'USDT' | 'USDC' | 'DAI';

export interface SoulboundToken {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  category: 'REPUTATION' | 'EXPERIENCE' | 'ARBITRATION' | 'SECURITY';
  icon: string;
  issuer: string;
  issuedAt: number;
  transactionHash: string;
  attributes: { trait_type: string; value: string | number }[];
}

export interface Wallet {
  address: string;
  name: string;
  role: Role;
  avatar: string;
  balance: number; // ETH balance
  stablecoinBalances: {
    USDT: number;
    USDC: number;
    DAI: number;
  };
  publicKey: string;
  privateKey: string;
  reputationScore: number; // 0 to 100
  totalEscrows: number;
  successfulEscrows: number;
  disputedEscrows: number;
  sbtTokens: SoulboundToken[];
}

export type EscrowStatus = 
  | 'CREATED'
  | 'FUNDED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'RELEASED'
  | 'REFUNDED';

export interface Milestone {
  id: string;
  title: string;
  percentage: number;
  amount: number;
  isDelivered: boolean;
  isApproved: boolean;
  deliveredAt?: number;
  approvedAt?: number;
  deliveryProofHash?: string;
}

export interface DisputeEvidence {
  id: string;
  by: string; // address
  authorName: string;
  role: Role;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: 'image' | 'pdf' | 'document';
  proofHash: string;
  timestamp: number;
  language?: 'en' | 'hi';
}

export type DisputeVerdict = 'BUYER_REFUND' | 'SELLER_PAYOUT' | 'SPLIT_50_50';

export interface DaoVote {
  jurorAddress: string;
  jurorName: string;
  vote: DisputeVerdict;
  stakedTokens: number;
  timestamp: number;
  comment?: string;
}

export interface CryptoSignature {
  signer: string;
  signerName: string;
  action: string;
  signature: string;
  timestamp: number;
}

export type LogisticsCarrier = 'DHL Express' | 'FedEx Global';

export type ShipmentStatus =
  | 'LABEL_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface LogisticsData {
  carrier: LogisticsCarrier;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  estimatedArrival: string;
  lastUpdated: number;
  checkpointLocation: string;
  oracleNode: string;
  chainlinkVerificationProof: string;
}

export interface EscrowContract {
  id: string;
  title: string;
  description: string;
  buyerAddress: string;
  sellerAddress: string;
  arbiterAddress: string;
  totalAmount: number;
  currency: CurrencyType;
  status: EscrowStatus;
  createdAt: number;
  deadline: number;
  isFunded: boolean;

  // Stablecoins & Yield Automation (Aave / Compound)
  yieldEnabled: boolean;
  yieldProtocol?: 'Aave v3' | 'Compound v3';
  yieldApy?: number;
  accruedYield: number; // accumulated yield in same currency

  // Logistics tracking via Chainlink Oracle
  logistics?: LogisticsData;

  // Delivery status
  deliveryProof?: string;
  deliveryProofHash?: string;
  deliveredAt?: number;
  releasedAt?: number;
  refundedAt?: number;

  // Disputes & DAO Voting
  disputedAt?: number;
  disputeReason?: string;
  disputeEvidence: DisputeEvidence[];
  disputeVerdict?: DisputeVerdict;
  disputeResolvedAt?: number;
  disputeNotes?: string;
  daoVotes: DaoVote[];
  daoQuorumReached: boolean;

  milestones: Milestone[];
  signatures: CryptoSignature[];
  smartContractCode: string;
}

export type TransactionType =
  | 'CREATE_ESCROW'
  | 'FUND_ESCROW'
  | 'SUBMIT_DELIVERY'
  | 'RELEASE_FUNDS'
  | 'RELEASE_MILESTONE'
  | 'DEADLINE_REFUND'
  | 'RAISE_DISPUTE'
  | 'SUBMIT_EVIDENCE'
  | 'RESOLVE_DISPUTE'
  | 'DAO_JUROR_VOTE'
  | 'YIELD_CLAIM'
  | 'LOGISTICS_ORACLE_UPDATE'
  | 'PEER_TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  from: string;
  to: string;
  amount: number;
  currency?: CurrencyType;
  escrowId?: string;
  timestamp: number;
  signature: string;
  payload: Record<string, any>;
  gasUsed: number;
  blockIndex?: number;
}

export interface Block {
  index: number;
  timestamp: number;
  previousHash: string;
  hash: string;
  transactions: Transaction[];
  merkleRoot: string;
  nonce: number;
  validator: string;
  isTampered?: boolean;
  originalHash?: string;
}

export interface BlockchainIntegrityReport {
  isValid: boolean;
  brokenBlockIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  details?: string;
  verifiedAt: number;
  totalBlocks: number;
  totalTxs: number;
}

export interface AppNotification {
  id: string;
  titleEn: string;
  titleHi: string;
  messageEn: string;
  messageHi: string;
  type: 'FUNDS_LOCKED' | 'DELIVERY_UPDATE' | 'YIELD_ACCRUED' | 'DISPUTE_FILED' | 'FUNDS_RELEASED' | 'REFUND_TRIGGERED' | 'DAO_VOTE';
  escrowId?: string;
  timestamp: number;
  read: boolean;
}
