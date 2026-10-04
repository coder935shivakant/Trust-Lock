import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Wallet,
  EscrowContract,
  Block,
  Transaction,
  BlockchainIntegrityReport,
  Role,
  DisputeVerdict,
  CurrencyType,
  ShipmentStatus,
  LogisticsCarrier,
  DaoVote,
  AppNotification,
  SoulboundToken,
} from '../types/blockchain';
import {
  INITIAL_WALLETS,
  INITIAL_ESCROWS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SBT_TOKENS,
} from '../data/mockBlockchain';
import {
  sha256,
  computeMerkleRoot,
  calculateBlockHash,
  signTransactionPayload,
  verifyChainIntegrity,
  mineBlock,
} from '../services/crypto';
import { generateSolidityContract } from '../services/smartContractGenerator';

interface BlockchainContextType {
  wallets: Wallet[];
  currentWallet: Wallet;
  escrows: EscrowContract[];
  chain: Block[];
  mempool: Transaction[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  miningMode: 'INSTANT' | 'AUTO_FAST' | 'MANUAL';
  setMiningMode: (mode: 'INSTANT' | 'AUTO_FAST' | 'MANUAL') => void;
  isMining: boolean;
  tps: number;
  integrityReport: BlockchainIntegrityReport | null;
  selectWallet: (address: string) => void;
  createNewWallet: (name: string, role: Role) => void;
  createEscrow: (params: {
    title: string;
    description: string;
    sellerAddress: string;
    totalAmount: number;
    currency: CurrencyType;
    deadlineHours: number;
    yieldEnabled: boolean;
    carrier?: LogisticsCarrier;
    trackingNumber?: string;
    milestones: { title: string; percentage: number }[];
  }) => Promise<string>;
  fundEscrow: (escrowId: string) => Promise<boolean>;
  submitDelivery: (escrowId: string, proof: string) => Promise<boolean>;
  releaseEscrowFunds: (escrowId: string) => Promise<boolean>;
  releaseMilestone: (escrowId: string, milestoneId: string) => Promise<boolean>;
  claimDeadlineRefund: (escrowId: string) => Promise<boolean>;
  raiseDispute: (escrowId: string, reason: string, evidenceText?: string, fileUrl?: string, fileName?: string) => Promise<boolean>;
  resolveDispute: (escrowId: string, verdict: DisputeVerdict, notes?: string) => Promise<boolean>;
  castDaoVote: (escrowId: string, verdict: DisputeVerdict, comment?: string) => Promise<boolean>;
  simulateLogisticsUpdate: (escrowId: string, newStatus: ShipmentStatus, checkpoint: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  mineMempoolNow: () => Promise<void>;
  tamperBlockData: (blockIndex: number, newTxAmount: number) => Promise<void>;
  healBlockchain: () => Promise<void>;
  runIntegrityAudit: () => Promise<BlockchainIntegrityReport>;
  fireTransactionBurst: (count?: number) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);
  const [currentWallet, setCurrentWallet] = useState<Wallet>(INITIAL_WALLETS[0]);
  const [escrows, setEscrows] = useState<EscrowContract[]>(() => {
    return INITIAL_ESCROWS.map(esc => ({
      ...esc,
      smartContractCode: generateSolidityContract(esc),
    }));
  });
  const [chain, setChain] = useState<Block[]>([]);
  const [mempool, setMempool] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [miningMode, setMiningMode] = useState<'INSTANT' | 'AUTO_FAST' | 'MANUAL'>('INSTANT');
  const [isMining, setIsMining] = useState(false);
  const [tps, setTps] = useState(136);
  const [integrityReport, setIntegrityReport] = useState<BlockchainIntegrityReport | null>(null);

  const txCounterRef = useRef<number>(0);

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const addNotification = (
    titleEn: string,
    titleHi: string,
    messageEn: string,
    messageHi: string,
    type: AppNotification['type'],
    escrowId?: string
  ) => {
    const notif: AppNotification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titleEn,
      titleHi,
      messageEn,
      messageHi,
      type,
      escrowId,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Accruing DeFi Yield interval on locked escrows
  useEffect(() => {
    const timer = setInterval(() => {
      setEscrows(prev =>
        prev.map(e => {
          if (e.yieldEnabled && (e.status === 'FUNDED' || e.status === 'DELIVERED' || e.status === 'DISPUTED')) {
            const increment = Number((e.totalAmount * (0.054 / 365 / 144)).toFixed(4));
            return {
              ...e,
              accruedYield: Number((e.accruedYield + increment).toFixed(4)),
            };
          }
          return e;
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Initialize blockchain
  useEffect(() => {
    async function initChain() {
      const genesisTx: Transaction = {
        id: '0xgenesis_root_token_distribution_000000000000000000000000000000000',
        type: 'PEER_TRANSFER',
        from: '0x0000000000000000000000000000000000000000',
        to: INITIAL_WALLETS[3].address,
        amount: 1000,
        currency: 'ETH',
        timestamp: Date.now() - 3600 * 1000 * 96,
        signature: '0xgenesis_cryptographic_consensus_seal',
        payload: { note: 'Genesis allocation to TrustLock Node Network' },
        gasUsed: 21000,
        blockIndex: 0,
      };

      const genesisMerkle = await computeMerkleRoot([genesisTx]);
      const genesisHash = await calculateBlockHash(
        0,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        Date.now() - 3600 * 1000 * 96,
        genesisMerkle,
        42
      );

      const genesisBlock: Block = {
        index: 0,
        timestamp: Date.now() - 3600 * 1000 * 96,
        previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        hash: genesisHash,
        transactions: [genesisTx],
        merkleRoot: genesisMerkle,
        nonce: 42,
        validator: '0x0000...GenesisNode',
      };

      const b1Txs = INITIAL_TRANSACTIONS.slice(0, 2);
      const b1Merkle = await computeMerkleRoot(b1Txs);
      const b1Hash = await calculateBlockHash(1, genesisBlock.hash, Date.now() - 3600 * 1000 * 47, b1Merkle, 189);
      const block1: Block = {
        index: 1,
        timestamp: Date.now() - 3600 * 1000 * 47,
        previousHash: genesisBlock.hash,
        hash: b1Hash,
        transactions: b1Txs,
        merkleRoot: b1Merkle,
        nonce: 189,
        validator: INITIAL_WALLETS[3].address,
      };

      const b2Txs = INITIAL_TRANSACTIONS.slice(2, 4);
      const b2Merkle = await computeMerkleRoot(b2Txs);
      const b2Hash = await calculateBlockHash(2, block1.hash, Date.now() - 3600 * 1000 * 3, b2Merkle, 312);
      const block2: Block = {
        index: 2,
        timestamp: Date.now() - 3600 * 1000 * 3,
        previousHash: block1.hash,
        hash: b2Hash,
        transactions: b2Txs,
        merkleRoot: b2Merkle,
        nonce: 312,
        validator: INITIAL_WALLETS[3].address,
      };

      const initialChain = [genesisBlock, block1, block2];
      setChain(initialChain);

      const audit = await verifyChainIntegrity(initialChain);
      setIntegrityReport(audit);
    }

    initChain();
  }, []);

  const runIntegrityAudit = useCallback(async (): Promise<BlockchainIntegrityReport> => {
    const report = await verifyChainIntegrity(chain);
    setIntegrityReport(report);
    return report;
  }, [chain]);

  const selectWallet = (address: string) => {
    const found = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
    if (found) {
      setCurrentWallet(found);
    }
  };

  const createNewWallet = async (name: string, role: Role) => {
    const rand = Math.random().toString(36).substring(2, 10);
    const address = '0x' + (await sha256(name + rand)).substring(0, 40);
    const pubKey = '0x04' + (await sha256(address + 'pub')).substring(0, 50);
    const privKey = `user_priv_${rand}_secp256k1`;

    const avatarMap: Record<Role, string> = {
      BUYER: '🚀',
      SELLER: '🎨',
      ARBITER: '⚖️',
      VALIDATOR: '⚡',
      DAO_JUROR: '🗳️',
    };

    const newW: Wallet = {
      address,
      name,
      role,
      avatar: avatarMap[role] || '👤',
      balance: role === 'BUYER' ? 10.0 : 3.0,
      stablecoinBalances: {
        USDT: 5000,
        USDC: 5000,
        DAI: 2000,
      },
      publicKey: pubKey,
      privateKey: privKey,
      reputationScore: 100,
      totalEscrows: 0,
      successfulEscrows: 0,
      disputedEscrows: 0,
      sbtTokens: [],
    };

    setWallets(prev => [...prev, newW]);
    setCurrentWallet(newW);
  };

  const recordTransaction = async (
    type: Transaction['type'],
    from: string,
    to: string,
    amount: number,
    payload: Record<string, any>,
    escrowId?: string,
    currency: CurrencyType = 'ETH'
  ): Promise<Transaction> => {
    const timestamp = Date.now();
    const signature = await signTransactionPayload(currentWallet.privateKey, {
      from,
      to,
      amount,
      type,
      timestamp,
    });

    const txId = '0x' + (await sha256(`${from}-${to}-${amount}-${timestamp}-${Math.random()}`));

    const tx: Transaction = {
      id: txId,
      type,
      from,
      to,
      amount,
      currency,
      escrowId,
      timestamp,
      signature,
      payload,
      gasUsed: Math.floor(21000 + Math.random() * 25000),
    };

    txCounterRef.current += 1;

    if (miningMode === 'INSTANT' && chain.length > 0) {
      setIsMining(true);
      const lastBlock = chain[chain.length - 1];
      const newBlock = await mineBlock(
        lastBlock.index + 1,
        lastBlock.hash,
        [tx],
        currentWallet.address,
        1
      );
      setChain(prev => [...prev, newBlock]);
      setIsMining(false);
    } else {
      setMempool(prev => [...prev, tx]);
    }

    return tx;
  };

  // CREATE ESCROW with Stablecoin, Yield, & Logistics
  const createEscrow = async (params: {
    title: string;
    description: string;
    sellerAddress: string;
    totalAmount: number;
    currency: CurrencyType;
    deadlineHours: number;
    yieldEnabled: boolean;
    carrier?: LogisticsCarrier;
    trackingNumber?: string;
    milestones: { title: string; percentage: number }[];
  }): Promise<string> => {
    const id = `ESC-${Math.floor(800 + Math.random() * 900)}`;
    const arbiter = INITIAL_WALLETS.find(w => w.role === 'ARBITER') || INITIAL_WALLETS[2];

    const builtMilestones = params.milestones.map((m, idx) => ({
      id: `M${idx + 1}`,
      title: m.title,
      percentage: m.percentage,
      amount: Number(((params.totalAmount * m.percentage) / 100).toFixed(2)),
      isDelivered: false,
      isApproved: false,
    }));

    let logisticsData = undefined;
    if (params.trackingNumber && params.carrier) {
      logisticsData = {
        carrier: params.carrier,
        trackingNumber: params.trackingNumber,
        status: 'LABEL_CREATED' as ShipmentStatus,
        origin: 'Origin Logistics Center',
        destination: 'Customer Delivery Point',
        estimatedArrival: 'In 3 Days',
        lastUpdated: Date.now(),
        checkpointLocation: 'Registration Hub',
        oracleNode: '0xChainlink_Oracle_Feeder_Node',
        chainlinkVerificationProof: '0x' + (await sha256(params.trackingNumber + Date.now())).substring(0, 40),
      };
    }

    const newEscrow: EscrowContract = {
      id,
      title: params.title,
      description: params.description,
      buyerAddress: currentWallet.address,
      sellerAddress: params.sellerAddress,
      arbiterAddress: arbiter.address,
      totalAmount: params.totalAmount,
      currency: params.currency,
      status: 'CREATED',
      createdAt: Date.now(),
      deadline: Date.now() + params.deadlineHours * 3600 * 1000,
      isFunded: false,
      yieldEnabled: params.yieldEnabled,
      yieldProtocol: params.yieldEnabled ? 'Aave v3' : undefined,
      yieldApy: params.yieldEnabled ? 5.2 : undefined,
      accruedYield: 0,
      logistics: logisticsData,
      milestones: builtMilestones,
      disputeEvidence: [],
      daoVotes: [],
      daoQuorumReached: false,
      signatures: [
        {
          signer: currentWallet.address,
          signerName: currentWallet.name,
          action: 'CREATE_CONTRACT',
          signature: await signTransactionPayload(currentWallet.privateKey, {
            from: currentWallet.address,
            to: params.sellerAddress,
            amount: params.totalAmount,
            type: 'CREATE_ESCROW',
            timestamp: Date.now(),
          }),
          timestamp: Date.now(),
        },
      ],
      smartContractCode: '',
    };

    newEscrow.smartContractCode = generateSolidityContract(newEscrow);

    setEscrows(prev => [newEscrow, ...prev]);

    await recordTransaction(
      'CREATE_ESCROW',
      currentWallet.address,
      params.sellerAddress,
      params.totalAmount,
      { escrowId: id, title: params.title, currency: params.currency },
      id,
      params.currency
    );

    addNotification(
      `Escrow Created: ${id}`,
      `एस्क्रो निर्मित: ${id}`,
      `Escrow created for ${params.totalAmount} ${params.currency} with ${params.sellerAddress.slice(0, 6)}...`,
      `${params.totalAmount} ${params.currency} के लिए ${params.sellerAddress.slice(0, 6)}... के साथ एस्क्रो बनाया गया।`,
      'FUNDS_LOCKED',
      id
    );

    return id;
  };

  // FUND ESCROW (Deducts ETH or Stablecoins, activates Yield)
  const fundEscrow = async (escrowId: string): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    // Check balance for specified currency
    if (target.currency === 'ETH') {
      if (currentWallet.balance < target.totalAmount) {
        alert(`Insufficient ETH! You need ${target.totalAmount} ETH.`);
        return false;
      }
      setWallets(prev =>
        prev.map(w =>
          w.address.toLowerCase() === currentWallet.address.toLowerCase()
            ? { ...w, balance: Number((w.balance - target.totalAmount).toFixed(4)) }
            : w
        )
      );
      setCurrentWallet(prev => ({
        ...prev,
        balance: Number((prev.balance - target.totalAmount).toFixed(4)),
      }));
    } else {
      const stable = target.currency as 'USDT' | 'USDC' | 'DAI';
      const bal = currentWallet.stablecoinBalances[stable] || 0;
      if (bal < target.totalAmount) {
        alert(`Insufficient ${stable}! You need ${target.totalAmount} ${stable}, but have ${bal}.`);
        return false;
      }
      setWallets(prev =>
        prev.map(w =>
          w.address.toLowerCase() === currentWallet.address.toLowerCase()
            ? {
                ...w,
                stablecoinBalances: {
                  ...w.stablecoinBalances,
                  [stable]: w.stablecoinBalances[stable] - target.totalAmount,
                },
              }
            : w
        )
      );
      setCurrentWallet(prev => ({
        ...prev,
        stablecoinBalances: {
          ...prev.stablecoinBalances,
          [stable]: prev.stablecoinBalances[stable] - target.totalAmount,
        },
      }));
    }

    const sig = await signTransactionPayload(currentWallet.privateKey, {
      from: currentWallet.address,
      to: '0xEscrowVaultSmartContract',
      amount: target.totalAmount,
      type: 'FUND_ESCROW',
      timestamp: Date.now(),
    });

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              isFunded: true,
              status: 'FUNDED',
              signatures: [
                ...e.signatures,
                {
                  signer: currentWallet.address,
                  signerName: currentWallet.name,
                  action: 'LOCK_FUNDS_DEPOSIT',
                  signature: sig,
                  timestamp: Date.now(),
                },
              ],
            }
          : e
      )
    );

    await recordTransaction(
      'FUND_ESCROW',
      currentWallet.address,
      '0xEscrowVaultSmartContract',
      target.totalAmount,
      { escrowId, status: 'LOCKED_IN_VAULT', yieldActive: target.yieldEnabled },
      escrowId,
      target.currency
    );

    addNotification(
      `Funds Locked: ${target.id}`,
      `धन वॉल्ट में लॉक हुआ: ${target.id}`,
      `${target.totalAmount} ${target.currency} safely locked in vault${target.yieldEnabled ? ' (Aave v3 Yield Farming started!)' : ''}.`,
      `${target.totalAmount} ${target.currency} सुरक्षित रूप से वॉल्ट में लॉक हो गया${target.yieldEnabled ? ' (Aave v3 यील्ड शुरू!)' : ''}।`,
      'FUNDS_LOCKED',
      escrowId
    );

    return true;
  };

  // SUBMIT DELIVERY (Seller submits delivery proof & updates logistics)
  const submitDelivery = async (escrowId: string, proof: string): Promise<boolean> => {
    const proofHash = '0x' + (await sha256(proof + Date.now().toString())).substring(0, 36);
    const sig = await signTransactionPayload(currentWallet.privateKey, {
      from: currentWallet.address,
      to: '0xEscrowVaultSmartContract',
      amount: 0,
      type: 'SUBMIT_DELIVERY',
      timestamp: Date.now(),
    });

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: 'DELIVERED',
              deliveryProof: proof,
              deliveryProofHash: proofHash,
              deliveredAt: Date.now(),
              logistics: e.logistics
                ? {
                    ...e.logistics,
                    status: 'DELIVERED',
                    checkpointLocation: 'Delivered to Buyer Doorstep',
                    lastUpdated: Date.now(),
                  }
                : undefined,
              signatures: [
                ...e.signatures,
                {
                  signer: currentWallet.address,
                  signerName: currentWallet.name,
                  action: 'SUBMIT_DELIVERY_PROOF',
                  signature: sig,
                  timestamp: Date.now(),
                },
              ],
            }
          : e
      )
    );

    await recordTransaction(
      'SUBMIT_DELIVERY',
      currentWallet.address,
      '0xEscrowVaultSmartContract',
      0,
      { escrowId, deliveryProofHash: proofHash },
      escrowId
    );

    addNotification(
      `Delivery Proof Published: ${escrowId}`,
      `डिलीवरी प्रमाण प्रस्तुत: ${escrowId}`,
      `Seller marked delivery with cryptographic proof hash. Buyer verification requested.`,
      `विक्रेता ने क्रिप्टोग्राफिक प्रमाण के साथ डिलीवरी चिह्नित की है। खरीदार सत्यापन अपेक्षित है।`,
      'DELIVERY_UPDATE',
      escrowId
    );

    return true;
  };

  // RELEASE ESCROW FUNDS (+ SPLIT AAVE YIELD 50/50!)
  const releaseEscrowFunds = async (escrowId: string): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    const halfYield = Number((target.accruedYield / 2).toFixed(4));
    const sellerTotal = target.totalAmount + halfYield;

    // Credit seller with principal + half yield, credit buyer with half yield
    setWallets(prev =>
      prev.map(w => {
        if (w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
          if (target.currency === 'ETH') {
            return {
              ...w,
              balance: Number((w.balance + sellerTotal).toFixed(4)),
              successfulEscrows: w.successfulEscrows + 1,
              reputationScore: Math.min(100, w.reputationScore + 1),
            };
          } else {
            const stable = target.currency as 'USDT' | 'USDC' | 'DAI';
            return {
              ...w,
              stablecoinBalances: {
                ...w.stablecoinBalances,
                [stable]: Number(((w.stablecoinBalances[stable] || 0) + sellerTotal).toFixed(2)),
              },
              successfulEscrows: w.successfulEscrows + 1,
              reputationScore: Math.min(100, w.reputationScore + 1),
            };
          }
        }
        if (w.address.toLowerCase() === target.buyerAddress.toLowerCase()) {
          if (target.currency === 'ETH') {
            return {
              ...w,
              balance: Number((w.balance + halfYield).toFixed(4)),
              successfulEscrows: w.successfulEscrows + 1,
              reputationScore: Math.min(100, w.reputationScore + 1),
            };
          } else {
            const stable = target.currency as 'USDT' | 'USDC' | 'DAI';
            return {
              ...w,
              stablecoinBalances: {
                ...w.stablecoinBalances,
                [stable]: Number(((w.stablecoinBalances[stable] || 0) + halfYield).toFixed(2)),
              },
              successfulEscrows: w.successfulEscrows + 1,
              reputationScore: Math.min(100, w.reputationScore + 1),
            };
          }
        }
        return w;
      })
    );

    const sig = await signTransactionPayload(currentWallet.privateKey, {
      from: currentWallet.address,
      to: target.sellerAddress,
      amount: target.totalAmount,
      type: 'RELEASE_FUNDS',
      timestamp: Date.now(),
    });

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: 'RELEASED',
              releasedAt: Date.now(),
              signatures: [
                ...e.signatures,
                {
                  signer: currentWallet.address,
                  signerName: currentWallet.name,
                  action: 'BUYER_RELEASE_VAULT_PAYOUT',
                  signature: sig,
                  timestamp: Date.now(),
                },
              ],
            }
          : e
      )
    );

    await recordTransaction(
      'RELEASE_FUNDS',
      '0xEscrowVaultSmartContract',
      target.sellerAddress,
      target.totalAmount,
      { escrowId, finalState: 'RELEASED_TO_SELLER', splitYield: target.accruedYield },
      escrowId,
      target.currency
    );

    addNotification(
      `Funds Released & Yield Split: ${escrowId}`,
      `भुगतान जारी व ब्याज विभाजित: ${escrowId}`,
      `Released ${target.totalAmount} ${target.currency}. ${target.accruedYield > 0 ? `Bonus Yield of ${target.accruedYield} ${target.currency} split 50/50!` : ''}`,
      `${target.totalAmount} ${target.currency} जारी किया गया। ${target.accruedYield > 0 ? `${target.accruedYield} ${target.currency} का संचित ब्याज 50/50 बांटा गया!` : ''}`,
      'FUNDS_RELEASED',
      escrowId
    );

    return true;
  };

  // RELEASE MILESTONE
  const releaseMilestone = async (escrowId: string, milestoneId: string): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;
    const ms = target.milestones.find(m => m.id === milestoneId);
    if (!ms) return false;

    // Credit partial amount to seller
    setWallets(prev =>
      prev.map(w => {
        if (w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
          if (target.currency === 'ETH') {
            return { ...w, balance: Number((w.balance + ms.amount).toFixed(4)) };
          } else {
            const stable = target.currency as 'USDT' | 'USDC' | 'DAI';
            return {
              ...w,
              stablecoinBalances: {
                ...w.stablecoinBalances,
                [stable]: Number(((w.stablecoinBalances[stable] || 0) + ms.amount).toFixed(2)),
              },
            };
          }
        }
        return w;
      })
    );

    const updatedMilestones = target.milestones.map(m =>
      m.id === milestoneId ? { ...m, isApproved: true, approvedAt: Date.now() } : m
    );

    const allApproved = updatedMilestones.every(m => m.isApproved);

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: allApproved ? 'RELEASED' : e.status,
              releasedAt: allApproved ? Date.now() : e.releasedAt,
              milestones: updatedMilestones,
            }
          : e
      )
    );

    await recordTransaction(
      'RELEASE_MILESTONE',
      '0xEscrowVaultSmartContract',
      target.sellerAddress,
      ms.amount,
      { escrowId, milestoneId, amount: ms.amount },
      escrowId,
      target.currency
    );

    return true;
  };

  // CLAIM DEADLINE REFUND
  const claimDeadlineRefund = async (escrowId: string): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    setWallets(prev =>
      prev.map(w => {
        if (w.address.toLowerCase() === target.buyerAddress.toLowerCase()) {
          if (target.currency === 'ETH') {
            return { ...w, balance: Number((w.balance + target.totalAmount).toFixed(4)) };
          } else {
            const stable = target.currency as 'USDT' | 'USDC' | 'DAI';
            return {
              ...w,
              stablecoinBalances: {
                ...w.stablecoinBalances,
                [stable]: Number(((w.stablecoinBalances[stable] || 0) + target.totalAmount).toFixed(2)),
              },
            };
          }
        }
        return w;
      })
    );

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: 'REFUNDED',
              refundedAt: Date.now(),
            }
          : e
      )
    );

    await recordTransaction(
      'DEADLINE_REFUND',
      '0xEscrowVaultSmartContract',
      target.buyerAddress,
      target.totalAmount,
      { escrowId, reason: 'DEADLINE_EXPIRED_AUTOMATIC_REFUND' },
      escrowId,
      target.currency
    );

    addNotification(
      `Deadline Refund Claimed: ${escrowId}`,
      `अंतिम तिथि रिफंड प्राप्त हुआ: ${escrowId}`,
      `100% refund of ${target.totalAmount} ${target.currency} returned to buyer after delivery deadline expired.`,
      `अंतिम तिथि समाप्त होने पर खरीदार को ${target.totalAmount} ${target.currency} का 100% रिफंड वापस किया गया।`,
      'REFUND_TRIGGERED',
      escrowId
    );

    return true;
  };

  // RAISE DISPUTE WITH IPFS EVIDENCE & MULTI-LANGUAGE
  const raiseDispute = async (
    escrowId: string,
    reason: string,
    evidenceText?: string,
    fileUrl?: string,
    fileName?: string
  ): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    const evidenceList = [...target.disputeEvidence];
    if (evidenceText || fileUrl) {
      const pHash = '0x' + (await sha256((evidenceText || '') + (fileUrl || '') + Date.now())).substring(0, 32);
      evidenceList.push({
        id: `EVD-${evidenceList.length + 1}`,
        by: currentWallet.address,
        authorName: currentWallet.name,
        role: currentWallet.role,
        text: evidenceText || 'IPFS File attached as documentary evidence.',
        fileUrl: fileUrl || 'https://ipfs.io/ipfs/QmEvidenceFile' + Math.floor(Math.random() * 9000),
        fileName: fileName || 'claim_evidence.pdf',
        fileType: fileName?.endsWith('.jpg') || fileName?.endsWith('.png') ? 'image' : 'pdf',
        proofHash: pHash,
        timestamp: Date.now(),
      });
    }

    const sig = await signTransactionPayload(currentWallet.privateKey, {
      from: currentWallet.address,
      to: target.arbiterAddress,
      amount: 0,
      type: 'RAISE_DISPUTE',
      timestamp: Date.now(),
    });

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: 'DISPUTED',
              disputeReason: reason,
              disputedAt: Date.now(),
              disputeEvidence: evidenceList,
              signatures: [
                ...e.signatures,
                {
                  signer: currentWallet.address,
                  signerName: currentWallet.name,
                  action: 'INVOKE_DAO_ARBITRATION',
                  signature: sig,
                  timestamp: Date.now(),
                },
              ],
            }
          : e
      )
    );

    await recordTransaction(
      'RAISE_DISPUTE',
      currentWallet.address,
      target.arbiterAddress,
      0,
      { escrowId, reason },
      escrowId
    );

    addNotification(
      `Dispute Filed: ${escrowId}`,
      `विवाद दर्ज हुआ: ${escrowId}`,
      `A dispute was raised on contract ${escrowId}. Case is now open for DAO Community Jury voting.`,
      `अनुबंध ${escrowId} पर विवाद दर्ज हुआ। अब मामला DAO समुदाय जूरी मतदान के लिए खुला है।`,
      'DISPUTE_FILED',
      escrowId
    );

    return true;
  };

  // CAST DAO COMMUNITY JUROR VOTE
  const castDaoVote = async (
    escrowId: string,
    verdict: DisputeVerdict,
    comment?: string
  ): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    // Check if already voted
    if (target.daoVotes.some(v => v.jurorAddress.toLowerCase() === currentWallet.address.toLowerCase())) {
      alert('You have already cast your DAO juror vote on this case.');
      return false;
    }

    const newVote: DaoVote = {
      jurorAddress: currentWallet.address,
      jurorName: currentWallet.name,
      vote: verdict,
      stakedTokens: 10000,
      timestamp: Date.now(),
      comment: comment || 'DAO community vote submitted.',
    };

    const updatedVotes = [...target.daoVotes, newVote];
    const quorumReached = updatedVotes.length >= 3;

    // If quorum reached, automatically execute majority ruling!
    let finalVerdict = target.disputeVerdict;
    let finalStatus = target.status;

    if (quorumReached) {
      const counts: Record<DisputeVerdict, number> = {
        BUYER_REFUND: 0,
        SELLER_PAYOUT: 0,
        SPLIT_50_50: 0,
      };
      updatedVotes.forEach(v => {
        counts[v.vote] = (counts[v.vote] || 0) + 1;
      });

      let highestCount = -1;
      let majorityVerdict: DisputeVerdict = 'SPLIT_50_50';
      const verdictKeys: DisputeVerdict[] = ['BUYER_REFUND', 'SELLER_PAYOUT', 'SPLIT_50_50'];
      for (const k of verdictKeys) {
        if (counts[k] > highestCount) {
          highestCount = counts[k];
          majorityVerdict = k;
        }
      }

      finalVerdict = majorityVerdict;
      finalStatus = (majorityVerdict as DisputeVerdict) === 'BUYER_REFUND' ? 'REFUNDED' : 'RELEASED';

      // Distribute funds according to majority verdict
      const total = target.totalAmount;
      if ((majorityVerdict as DisputeVerdict) === 'BUYER_REFUND') {
        setWallets(prev =>
          prev.map(w => {
            if (w.address.toLowerCase() === target.buyerAddress.toLowerCase()) {
              if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + total).toFixed(4)) };
              const s = target.currency as 'USDT' | 'USDC' | 'DAI';
              return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + total } };
            }
            return w;
          })
        );
      } else if ((majorityVerdict as DisputeVerdict) === 'SELLER_PAYOUT') {
        setWallets(prev =>
          prev.map(w => {
            if (w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
              if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + total).toFixed(4)) };
              const s = target.currency as 'USDT' | 'USDC' | 'DAI';
              return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + total } };
            }
            return w;
          })
        );
      } else if ((majorityVerdict as DisputeVerdict) === 'SPLIT_50_50') {
        const half = Number((total / 2).toFixed(2));
        setWallets(prev =>
          prev.map(w => {
            if (w.address.toLowerCase() === target.buyerAddress.toLowerCase() || w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
              if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + half).toFixed(4)) };
              const s = target.currency as 'USDT' | 'USDC' | 'DAI';
              return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + half } };
            }
            return w;
          })
        );
      }
    }

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              daoVotes: updatedVotes,
              daoQuorumReached: quorumReached,
              disputeVerdict: finalVerdict,
              status: finalStatus,
              disputeResolvedAt: quorumReached ? Date.now() : e.disputeResolvedAt,
            }
          : e
      )
    );

    await recordTransaction(
      'DAO_JUROR_VOTE',
      currentWallet.address,
      '0xTrustLock_DAO_Court',
      0,
      { escrowId, vote: verdict, quorumReached },
      escrowId
    );

    addNotification(
      `DAO Vote Cast: ${escrowId}`,
      `DAO वोट दर्ज हुआ: ${escrowId}`,
      `${currentWallet.name} voted on ${escrowId}.${quorumReached ? ' Quorum reached and ruling executed!' : ''}`,
      `${currentWallet.name} ने ${escrowId} पर वोट दिया।${quorumReached ? ' कोरम पूरा हुआ और निर्णय लागू हुआ!' : ''}`,
      'DAO_VOTE',
      escrowId
    );

    return true;
  };

  // RESOLVE DISPUTE DIRECTLY BY ARBITER
  const resolveDispute = async (
    escrowId: string,
    verdict: DisputeVerdict,
    notes?: string
  ): Promise<boolean> => {
    const target = escrows.find(e => e.id === escrowId);
    if (!target) return false;

    const total = target.totalAmount;
    if (verdict === 'BUYER_REFUND') {
      setWallets(prev =>
        prev.map(w => {
          if (w.address.toLowerCase() === target.buyerAddress.toLowerCase()) {
            if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + total).toFixed(4)) };
            const s = target.currency as 'USDT' | 'USDC' | 'DAI';
            return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + total } };
          }
          return w;
        })
      );
    } else if (verdict === 'SELLER_PAYOUT') {
      setWallets(prev =>
        prev.map(w => {
          if (w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
            if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + total).toFixed(4)) };
            const s = target.currency as 'USDT' | 'USDC' | 'DAI';
            return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + total } };
          }
          return w;
        })
      );
    } else if (verdict === 'SPLIT_50_50') {
      const half = Number((total / 2).toFixed(2));
      setWallets(prev =>
        prev.map(w => {
          if (w.address.toLowerCase() === target.buyerAddress.toLowerCase() || w.address.toLowerCase() === target.sellerAddress.toLowerCase()) {
            if (target.currency === 'ETH') return { ...w, balance: Number((w.balance + half).toFixed(4)) };
            const s = target.currency as 'USDT' | 'USDC' | 'DAI';
            return { ...w, stablecoinBalances: { ...w.stablecoinBalances, [s]: (w.stablecoinBalances[s] || 0) + half } };
          }
          return w;
        })
      );
    }

    setEscrows(prev =>
      prev.map(e =>
        e.id === escrowId
          ? {
              ...e,
              status: verdict === 'BUYER_REFUND' ? 'REFUNDED' : 'RELEASED',
              disputeVerdict: verdict,
              disputeResolvedAt: Date.now(),
              disputeNotes: notes || 'Arbitrator final ruling issued.',
            }
          : e
      )
    );

    await recordTransaction(
      'RESOLVE_DISPUTE',
      currentWallet.address,
      '0xEscrowVaultSmartContract',
      target.totalAmount,
      { escrowId, verdict, notes },
      escrowId,
      target.currency
    );

    return true;
  };

  // SIMULATE CHAINLINK LOGISTICS ORACLE UPDATE
  const simulateLogisticsUpdate = async (
    escrowId: string,
    newStatus: ShipmentStatus,
    checkpoint: string
  ) => {
    setEscrows(prev =>
      prev.map(e => {
        if (e.id === escrowId && e.logistics) {
          return {
            ...e,
            logistics: {
              ...e.logistics,
              status: newStatus,
              checkpointLocation: checkpoint,
              lastUpdated: Date.now(),
            },
          };
        }
        return e;
      })
    );

    await recordTransaction(
      'LOGISTICS_ORACLE_UPDATE',
      '0xChainlink_Oracle_Feeder_Node',
      '0xSmartContractVault',
      0,
      { escrowId, status: newStatus, checkpoint },
      escrowId
    );

    addNotification(
      `Chainlink Oracle Feed: ${newStatus}`,
      `चैनलिंक ऑरेकल फीड: ${newStatus}`,
      `Shipment for ${escrowId} updated to ${newStatus} at ${checkpoint}.`,
      `${escrowId} का शिपमेंट ${checkpoint} पर ${newStatus} में अपडेट हुआ।`,
      'DELIVERY_UPDATE',
      escrowId
    );
  };

  // TAMPER DATA FOR INTEGRITY LAB
  const tamperBlockData = async (blockIndex: number, newTxAmount: number) => {
    if (blockIndex <= 0 || blockIndex >= chain.length) return;

    setChain(prev => {
      const copy = [...prev];
      const targetBlock = { ...copy[blockIndex] };
      const originalHash = targetBlock.originalHash || targetBlock.hash;

      const tamperedTxs = targetBlock.transactions.map((tx, idx) => {
        if (idx === 0) {
          return {
            ...tx,
            amount: newTxAmount,
            payload: { ...tx.payload, tampered: true, note: 'HACKED TRANSACTION DATA' },
          };
        }
        return tx;
      });

      targetBlock.transactions = tamperedTxs;
      targetBlock.isTampered = true;
      targetBlock.originalHash = originalHash;
      copy[blockIndex] = targetBlock;
      return copy;
    });

    setTimeout(async () => {
      const audit = await verifyChainIntegrity(chain);
      setIntegrityReport(audit);
    }, 100);
  };

  // HEAL BLOCKCHAIN
  const healBlockchain = async () => {
    setIsMining(true);
    const healedChain: Block[] = [];

    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      if (i === 0) {
        healedChain.push({ ...block, isTampered: false });
      } else {
        const prevBlock = healedChain[i - 1];
        const cleanedTxs = block.transactions.map(tx => {
          const { tampered, ...restPayload } = tx.payload;
          return {
            ...tx,
            amount: tx.amount === 999 ? 2500 : tx.amount,
            payload: restPayload,
          };
        });

        const merkle = await computeMerkleRoot(cleanedTxs);
        const validHash = await calculateBlockHash(
          block.index,
          prevBlock.hash,
          block.timestamp,
          merkle,
          block.nonce
        );

        healedChain.push({
          ...block,
          previousHash: prevBlock.hash,
          merkleRoot: merkle,
          hash: validHash,
          transactions: cleanedTxs,
          isTampered: false,
        });
      }
    }

    setChain(healedChain);
    setIsMining(false);

    const audit = await verifyChainIntegrity(healedChain);
    setIntegrityReport(audit);
  };

  // HIGH SPEED BURST
  const fireTransactionBurst = async (count: number = 15) => {
    setIsMining(true);
    const burstTxs: Transaction[] = [];

    for (let i = 0; i < count; i++) {
      const sender = wallets[i % wallets.length];
      const recipient = wallets[(i + 1) % wallets.length];
      const amt = Number((10 + i * 5).toFixed(2));
      const timestamp = Date.now() + i * 10;

      const tx: Transaction = {
        id: '0x' + (await sha256(`burst-${i}-${timestamp}`)),
        type: 'PEER_TRANSFER',
        from: sender.address,
        to: recipient.address,
        amount: amt,
        currency: 'USDC',
        timestamp,
        signature: '0x' + (await sha256(`sig-${i}-${sender.privateKey}`)).substring(0, 30) + '...sig',
        payload: { burstBatch: true, txIndex: i + 1 },
        gasUsed: 21000,
      };
      burstTxs.push(tx);
    }

    const lastBlock = chain[chain.length - 1];
    const newBlock = await mineBlock(
      lastBlock.index + 1,
      lastBlock.hash,
      burstTxs,
      INITIAL_WALLETS[3].address,
      1
    );

    const updated = [...chain, newBlock];
    setChain(updated);
    setTps(Math.floor(320 + Math.random() * 120));
    setIsMining(false);

    const audit = await verifyChainIntegrity(updated);
    setIntegrityReport(audit);
  };

  // MANUAL MINE MEMPOOL
  const mineMempoolNow = async () => {
    if (mempool.length === 0 || chain.length === 0) return;
    setIsMining(true);
    const lastBlock = chain[chain.length - 1];
    const txsToMine = [...mempool];
    setMempool([]);

    const newBlock = await mineBlock(
      lastBlock.index + 1,
      lastBlock.hash,
      txsToMine,
      currentWallet.address,
      1
    );

    const updated = [...chain, newBlock];
    setChain(updated);
    setIsMining(false);
    await verifyChainIntegrity(updated).then(setIntegrityReport);
  };

  return (
    <BlockchainContext.Provider
      value={{
        wallets,
        currentWallet,
        escrows,
        chain,
        mempool,
        notifications,
        unreadNotifsCount,
        miningMode,
        setMiningMode,
        isMining,
        tps,
        integrityReport,
        selectWallet,
        createNewWallet,
        createEscrow,
        fundEscrow,
        submitDelivery,
        releaseEscrowFunds,
        releaseMilestone,
        claimDeadlineRefund,
        raiseDispute,
        resolveDispute,
        castDaoVote,
        simulateLogisticsUpdate,
        markNotificationAsRead,
        clearAllNotifications,
        mineMempoolNow,
        tamperBlockData,
        healBlockchain,
        runIntegrityAudit,
        fireTransactionBurst,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
