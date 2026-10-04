import React, { useState } from 'react';
import { EscrowContract, Role, DisputeVerdict, ShipmentStatus } from '../types/blockchain';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCode,
  ShieldCheck,
  Send,
  Gavel,
  ArrowRight,
  ExternalLink,
  Copy,
  Sparkles,
  Truck,
  Coins,
  Users,
  FileText,
  Upload,
} from 'lucide-react';

interface EscrowDetailsModalProps {
  escrow: EscrowContract;
  onClose: () => void;
}

export const EscrowDetailsModal: React.FC<EscrowDetailsModalProps> = ({
  escrow,
  onClose,
}) => {
  const {
    currentWallet,
    fundEscrow,
    submitDelivery,
    releaseEscrowFunds,
    releaseMilestone,
    claimDeadlineRefund,
    raiseDispute,
    resolveDispute,
    castDaoVote,
    simulateLogisticsUpdate,
  } = useBlockchain();

  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'logistics' | 'yield' | 'dao' | 'signatures' | 'solidity'>('overview');
  const [deliveryInput, setDeliveryInput] = useState('');
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  const [disputeEvidenceInput, setDisputeEvidenceInput] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<DisputeVerdict>('BUYER_REFUND');
  const [verdictNotes, setVerdictNotes] = useState('');
  const [daoJurorVerdict, setDaoJurorVerdict] = useState<DisputeVerdict>('SPLIT_50_50');
  const [daoComment, setDaoComment] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isBuyer = currentWallet.address.toLowerCase() === escrow.buyerAddress.toLowerCase();
  const isSeller = currentWallet.address.toLowerCase() === escrow.sellerAddress.toLowerCase();
  const isArbiter = currentWallet.address.toLowerCase() === escrow.arbiterAddress.toLowerCase();
  const isPastDeadline = Date.now() > escrow.deadline;

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortHash = (hash?: string) => {
    if (!hash) return '';
    return hash.length > 18 ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : hash;
  };

  const handleFund = async () => {
    setIsProcessing(true);
    await fundEscrow(escrow.id);
    setIsProcessing(false);
  };

  const handleDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryInput.trim()) return;
    setIsProcessing(true);
    await submitDelivery(escrow.id, deliveryInput.trim());
    setDeliveryInput('');
    setIsProcessing(false);
  };

  const handleRelease = async () => {
    setIsProcessing(true);
    const success = await releaseEscrowFunds(escrow.id);
    if (success) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
    setIsProcessing(false);
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    await claimDeadlineRefund(escrow.id);
    setIsProcessing(false);
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReasonInput.trim()) return;
    setIsProcessing(true);
    await raiseDispute(
      escrow.id,
      disputeReasonInput.trim(),
      disputeEvidenceInput.trim(),
      evidenceFileName ? `https://ipfs.io/ipfs/Qm${Math.floor(Math.random() * 900000)}` : undefined,
      evidenceFileName || undefined
    );
    setIsProcessing(false);
    setActiveTab('dao');
  };

  const handleDaoVoteSubmit = async () => {
    setIsProcessing(true);
    await castDaoVote(escrow.id, daoJurorVerdict, daoComment);
    setIsProcessing(false);
  };

  const copySmartContract = () => {
    navigator.clipboard.writeText(escrow.smartContractCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 flex-wrap">
              <span className="font-mono text-sky-400 font-bold">{escrow.id}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {escrow.currency}
              </span>
              <span>·</span>
              <span>{formatDate(escrow.createdAt)}</span>
              <span>·</span>
              <span className="font-semibold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
                ● {escrow.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {escrow.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">{escrow.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls (Segmented bar) */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('allContracts')} &amp; Actions
          </button>

          {escrow.logistics && (
            <button
              onClick={() => setActiveTab('logistics')}
              className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'logistics'
                  ? 'border-sky-400 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('logisticsTab')}</span>
            </button>
          )}

          {escrow.yieldEnabled && (
            <button
              onClick={() => setActiveTab('yield')}
              className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'yield'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('yieldTab')} (${escrow.accruedYield.toFixed(2)})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('dao')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dao'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gavel className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('daoVotingTab')}</span>
            {escrow.status === 'DISPUTED' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            className={`py-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'signatures'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('auditTrailTab')} ({escrow.signatures.length})
          </button>

          <button
            onClick={() => setActiveTab('solidity')}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'solidity'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{t('solidityCodeTab')}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial & Time Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow">
                  <div className="text-xs text-slate-400 font-semibold">{t('lockedAmount')}</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                    {escrow.totalAmount} <span className="text-sm font-normal">{escrow.currency}</span>
                  </div>
                  {escrow.yieldEnabled && (
                    <div className="text-[11px] text-amber-300 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Yield Accrued: +{escrow.accruedYield} {escrow.currency}</span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow">
                  <div className="text-xs text-slate-400 font-semibold">{t('deadline')}</div>
                  <div className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>{formatDate(escrow.deadline)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {isPastDeadline ? (
                      <span className="text-rose-400 font-bold">{t('pastDeadline')}</span>
                    ) : (
                      <span className="text-sky-300">Within valid delivery window</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow">
                  <div className="text-xs text-slate-400 font-semibold">Governance &amp; Oracles</div>
                  <div className="text-base font-bold text-white mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Chainlink Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    DAO Community Jury Protected
                  </div>
                </div>
              </div>

              {/* Stakeholders */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  On-Chain Participants
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">{t('buyer')} {isBuyer && '(You)'}</div>
                    <div className="font-mono text-white mt-0.5">{shortHash(escrow.buyerAddress)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">{t('seller')} {isSeller && '(You)'}</div>
                    <div className="font-mono text-white mt-0.5">{shortHash(escrow.sellerAddress)}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-400">{t('arbiter')} {isArbiter && '(You)'}</div>
                    <div className="font-mono text-white mt-0.5">{shortHash(escrow.arbiterAddress)}</div>
                  </div>
                </div>
              </div>

              {/* Action Center */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Smart Contract Execution Center</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Active: <strong className="text-sky-300">{currentWallet.name}</strong> ({currentWallet.role})
                  </div>
                </div>

                {escrow.status === 'CREATED' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-sm font-bold text-white">Deposit {escrow.totalAmount} {escrow.currency}</div>
                      <div className="text-xs text-slate-400">Buyer locks funds into the decentralized vault.</div>
                    </div>
                    {isBuyer ? (
                      <button
                        onClick={handleFund}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{t('fundEscrowBtn')}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-amber-400 italic">Waiting for buyer ({shortHash(escrow.buyerAddress)})</span>
                    )}
                  </div>
                )}

                {escrow.status === 'FUNDED' && (
                  <div className="space-y-3">
                    {isSeller ? (
                      <form onSubmit={handleDelivery} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <label className="text-xs font-bold text-white block">
                          Submit Work / IPFS Hash / Delivery Tracking Proof:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. IPFS CID hash, courier tracking code, or git commit"
                          value={deliveryInput}
                          onChange={e => setDeliveryInput(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isProcessing || !deliveryInput.trim()}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{t('submitDeliveryBtn')}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300">Funds locked in vault. Seller is preparing and dispatching delivery.</span>
                        {isPastDeadline && isBuyer && (
                          <button
                            onClick={handleRefund}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                          >
                            {t('claimRefundBtn')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {escrow.status === 'DELIVERED' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Seller delivery confirmed on-chain!</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Approve inspection to release {escrow.totalAmount} {escrow.currency} (+ split accrued yield 50/50).
                      </div>
                    </div>
                    {isBuyer && (
                      <button
                        onClick={handleRelease}
                        disabled={isProcessing}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>{t('releaseFundsBtn')}</span>
                      </button>
                    )}
                  </div>
                )}

                {escrow.status === 'RELEASED' && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Deal successfully completed &amp; settled!
                    </span>
                    {escrow.yieldEnabled && (
                      <span className="font-mono font-bold text-amber-300">
                        Aave Yield Paid: +{escrow.accruedYield} {escrow.currency}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHAINLINK LOGISTICS TRACKING */}
          {activeTab === 'logistics' && escrow.logistics && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-sky-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{escrow.logistics.carrier}</h4>
                      <p className="text-xs font-mono text-slate-400">Tracking #: {escrow.logistics.trackingNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ● {escrow.logistics.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">{t('origin')}</span>
                    <div className="font-bold text-white mt-0.5">{escrow.logistics.origin}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">{t('destination')}</span>
                    <div className="font-bold text-white mt-0.5">{escrow.logistics.destination}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">{t('estArrival')}</span>
                    <div className="font-bold text-sky-300 mt-0.5">{escrow.logistics.estimatedArrival}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Latest Checkpoint</span>
                    <div className="font-bold text-emerald-400 mt-0.5">{escrow.logistics.checkpointLocation}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex items-center justify-between text-sky-300 font-semibold">
                    <span>{t('chainlinkOracle')}</span>
                    <span>Feed Node: {escrow.logistics.oracleNode}</span>
                  </div>
                  <div className="break-all text-slate-400">
                    Proof Digest: {escrow.logistics.chainlinkVerificationProof}
                  </div>
                </div>

                {/* Simulated Oracle Update buttons for testing */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">Simulate Real-time Oracle Feed:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => simulateLogisticsUpdate(escrow.id, 'IN_TRANSIT', 'Customs Cleared at Sorting Facility')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg font-medium"
                    >
                      In Transit
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateLogisticsUpdate(escrow.id, 'OUT_FOR_DELIVERY', 'With Courier Driver')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg font-medium"
                    >
                      Out for Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateLogisticsUpdate(escrow.id, 'DELIVERED', 'Delivered & Signed')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg font-medium"
                    >
                      Delivered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AAVE YIELD STREAM */}
          {activeTab === 'yield' && escrow.yieldEnabled && (
            <div className="space-y-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{t('yieldActive')}</h4>
                      <p className="text-xs text-amber-300">Automated Aave v3 Liquidity Pool Integration</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Annual APY</span>
                    <div className="text-xl font-bold font-mono text-emerald-400">5.40%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">{t('accruedYield')}</span>
                    <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                      +${escrow.accruedYield.toFixed(2)} {escrow.currency}
                    </div>
                    <div className="text-[10px] text-slate-400">Grows continuously while contract is locked</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Buyer / Seller 50-50 Split</span>
                    <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                      +${(escrow.accruedYield / 2).toFixed(2)} <span className="text-xs text-slate-400 font-sans">each</span>
                    </div>
                    <div className="text-[10px] text-emerald-400">Awarded automatically upon release</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850 leading-relaxed">
                  {t('splitUponCompletion')}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: DAO DISPUTE COURT */}
          {activeTab === 'dao' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-rose-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{t('daoArbitrationTitle')}</h4>
                      <p className="text-xs text-slate-400">{t('daoVotingInstructions')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
                    {escrow.daoVotes.length} / 3 Quorum Votes
                  </span>
                </div>

                {/* Evidence List */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Submitted Evidence &amp; IPFS Documents ({escrow.disputeEvidence.length})
                  </h5>
                  {escrow.disputeEvidence.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 text-xs text-slate-400 italic">
                      No evidence filed yet. File a dispute below if there is an issue.
                    </div>
                  ) : (
                    escrow.disputeEvidence.map(ev => (
                      <div key={ev.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-300">{ev.authorName} ({ev.role})</span>
                          <span className="text-slate-400 text-[10px]">{formatDate(ev.timestamp)}</span>
                        </div>
                        <p className="text-slate-200">{ev.text}</p>
                        {ev.fileName && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-sky-400 font-mono bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{ev.fileName}</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate">IPFS: {ev.proofHash}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Cast DAO Vote Section */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-400" />
                      <span>Cast Staked DAO Juror Vote</span>
                    </span>
                    <span className="text-[10px] text-slate-400">10,000 Governance Staked Weight</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDaoJurorVerdict('BUYER_REFUND')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        daoJurorVerdict === 'BUYER_REFUND'
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-400'
                      }`}
                    >
                      {t('voteRefundBuyer')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaoJurorVerdict('SELLER_PAYOUT')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        daoJurorVerdict === 'SELLER_PAYOUT'
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-400'
                      }`}
                    >
                      {t('votePaySeller')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaoJurorVerdict('SPLIT_50_50')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        daoJurorVerdict === 'SPLIT_50_50'
                          ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-850 text-slate-400'
                      }`}
                    >
                      {t('voteSplit5050')}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Juror Rationale or Comment (optional)..."
                    value={daoComment}
                    onChange={e => setDaoComment(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />

                  <button
                    onClick={handleDaoVoteSubmit}
                    disabled={isProcessing}
                    className="w-full py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>{t('castVoteBtn')}</span>
                  </button>
                </div>

                {/* Dispute Filing Form if not yet disputed */}
                {escrow.status !== 'DISPUTED' && (
                  <form onSubmit={handleDisputeSubmit} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                    <h5 className="text-xs font-bold text-rose-300">File a Formal Dispute Claim to DAO Jury</h5>
                    <input
                      type="text"
                      placeholder="Reason for dispute (e.g. damaged goods, missing items)..."
                      value={disputeReasonInput}
                      onChange={e => setDisputeReasonInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Details of the issue & claim..."
                      value={disputeEvidenceInput}
                      onChange={e => setDisputeEvidenceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Attach Document/Photo Name (e.g. proof.jpg)"
                        value={evidenceFileName}
                        onChange={e => setEvidenceFileName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !disputeReasonInput.trim()}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                      >
                        {t('submitEvidenceBtn')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SIGNATURES */}
          {activeTab === 'signatures' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Every state transition is secured with cryptographic ECDSA/SHA-256 digital signatures.
              </div>
              <div className="space-y-2">
                {escrow.signatures.map((sig, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {sig.action}
                      </span>
                      <span className="text-slate-400">{formatDate(sig.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Signer: <strong className="text-white">{sig.signerName}</strong> ({shortHash(sig.signer)})
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 break-all bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                      {sig.signature}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SOLIDITY */}
          {activeTab === 'solidity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Solidity 0.8.20 Smart Contract deployed for this escrow instance
                </span>
                <button
                  onClick={copySmartContract}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? 'Copied!' : 'Copy Solidity'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96">
                {escrow.smartContractCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
