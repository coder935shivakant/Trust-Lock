import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Bug,
  Lock,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';

export const IntegrityLabView: React.FC = () => {
  const {
    chain,
    integrityReport,
    tamperBlockData,
    healBlockchain,
    runIntegrityAudit,
    isMining,
  } = useBlockchain();

  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [tamperAmount, setTamperAmount] = useState<number>(999.0);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  const isChainValid = integrityReport ? integrityReport.isValid : true;

  const handleTamper = async () => {
    await tamperBlockData(selectedBlockIndex, tamperAmount);
  };

  const handleHeal = async () => {
    await healBlockchain();
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    await runIntegrityAudit();
    setTimeout(() => setIsAuditing(false), 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-sky-400">Decentralized Security Verification</span>
              <span>·</span>
              <span>SHA-256 + Merkle Trees</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              Cryptographic Integrity Lab &amp; Tamper Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Experience firsthand why blockchain is tamper-evident. Try modifying transaction data in a past block and observe how mathematical hash chains immediately detect fraud.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleAudit}
              disabled={isAuditing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>Audit Whole Chain</span>
            </button>
            {!isChainValid && (
              <button
                onClick={handleHeal}
                disabled={isMining}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 animate-bounce"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Heal Ledger &amp; Restore Consensus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Ledger Integrity Status Alert Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 ${
          isChainValid
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-xl shadow-rose-950/50'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isChainValid
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            {isChainValid ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">
                {isChainValid
                  ? 'Cryptographic Ledger Integrity: 100% Intact & Verified'
                  : 'CRITICAL ALARM: Tampered Block Detected! Blockchain Chain Severed!'}
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              {isChainValid
                ? `All ${chain.length} blocks checked. Every transaction Merkle root matches, every block hash conforms to header specifications, and all parent pointers are valid.`
                : integrityReport?.details ||
                  'A transaction or header within the blockchain was maliciously modified. Subsequent blocks cannot verify the cryptographic chain.'}
            </p>

            {!isChainValid && integrityReport && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 font-mono text-xs space-y-1.5">
                <div className="text-rose-400 font-bold">
                  Broken At Block Height #{integrityReport.brokenBlockIndex}
                </div>
                {integrityReport.expectedHash && (
                  <div className="text-[11px] text-slate-400 break-all">
                    Expected Hash: <span className="text-emerald-400">{integrityReport.expectedHash}</span>
                  </div>
                )}
                {integrityReport.actualHash && (
                  <div className="text-[11px] text-slate-400 break-all">
                    Actual Hash:&nbsp;&nbsp;&nbsp;<span className="text-rose-400">{integrityReport.actualHash}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Tampering Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Tamper Controls */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Bug className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Simulate Adversarial Attack</h4>
                <p className="text-xs text-slate-400">Attempt to tamper with historic escrow transactions</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              Interactive Test
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Select Block to Target for Tampering:
              </label>
              <select
                value={selectedBlockIndex}
                onChange={e => setSelectedBlockIndex(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              >
                {chain
                  .filter(b => b.index > 0)
                  .map(b => (
                    <option key={b.index} value={b.index}>
                      Block #{b.index} ({b.transactions.length} txs) · Hash: {b.hash.slice(0, 10)}...
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Alter Transaction Payout Amount (ETH):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tamperAmount}
                  onChange={e => setTamperAmount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
                <span className="text-xs text-slate-400 font-mono">ETH</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Simulates an attacker trying to rewrite ledger history to pay themselves {tamperAmount} ETH!
              </p>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={handleTamper}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Bug className="w-4 h-4" />
                <span>Simulate Malicious Tampering</span>
              </button>

              <button
                onClick={handleHeal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Chain</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: How the Math Protects the Ledger */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">How Cryptography Guarantees Integrity</h4>
              <p className="text-xs text-slate-400">The 3 unbreakable pillars of blockchain</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>1. One-Way SHA-256 Avalanche Effect</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Changing even a single letter or digit causes the entire 256-bit hash output to scramble unpredictably. You cannot guess a replacement hash.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Binary Merkle Tree Verification</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Transactions are hashed in pairs into a root digest. If any transaction in a block is modified, the Merkle root changes immediately.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>3. Immutable Parent Hash Pointers</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Every block embeds the previous block's hash. Tampering with Block #1 immediately invalidates Block #2, Block #3, and all following blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
