import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { EscrowContract } from '../types/blockchain';
import {
  FileCode,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Code2,
  Workflow,
  ArrowRight,
} from 'lucide-react';

export const SmartContractInspectorView: React.FC = () => {
  const { escrows } = useBlockchain();
  const [selectedEscrowId, setSelectedEscrowId] = useState<string>(escrows[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const selectedEscrow = escrows.find(e => e.id === selectedEscrowId) || escrows[0];

  const handleCopy = () => {
    if (!selectedEscrow) return;
    navigator.clipboard.writeText(selectedEscrow.smartContractCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-sky-400">Ethereum &amp; EVM Compatible Contract</span>
            <span>·</span>
            <span>Solidity 0.8.20</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Smart Contract Security &amp; State Machine</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              Reentrancy Guarded
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Inspect the decentralized bytecode contracts that govern all fund movements without centralized gatekeepers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEscrowId}
            onChange={e => setSelectedEscrowId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
          >
            {escrows.map(e => (
              <option key={e.id} value={e.id}>
                {e.id} - {e.title.slice(0, 24)}... ({e.status})
              </option>
            ))}
          </select>

          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Source'}</span>
          </button>
        </div>
      </div>

      {/* State Transitions Visual Machine */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Workflow className="w-4 h-4 text-sky-400" />
          <span>Formal State Machine Flow (ALG-BC-02)</span>
        </h3>
        <p className="text-xs text-slate-400">
          The smart contract enforces strict non-invertible state transitions. Funds cannot be released without verified deliveries.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-sky-400 flex items-center gap-1.5">
              <span>1. Created</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Contract deployed with immutable buyer, seller, amount, and deadline.
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Trigger: constructor()
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <span>2. Funded</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Buyer sends exact ETH value. Vault locks balance and begins countdown timer.
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Trigger: depositFunds()
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span>3. Delivered</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Seller publishes cryptographic delivery proof hash to the contract.
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Trigger: submitDelivery()
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span>4. Released</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Buyer releases payment, or Arbiter resolves dispute with payout.
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Trigger: releaseFunds()
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture & Solidity Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Security Audit Checklist */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Smart Contract Security Audits</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reentrancy Guard</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Prevents recursive external call attacks (such as the DAO exploit) via a lock mutex flag.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Checks-Effects-Interactions</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Contract state is updated (<code className="text-sky-300">currentState = Released</code>) before emitting value transfer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deadline Refund Edge Case</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Protects buyers: if seller goes offline after funding, the buyer can safely trigger <code className="text-sky-300">claimDeadlineRefund()</code> once the block timestamp expires.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Role-Based Access Control</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Guaranteed by <code className="text-sky-300">onlyBuyer</code>, <code className="text-sky-300">onlySeller</code>, and <code className="text-sky-300">onlyArbiter</code> modifiers.
              </p>
            </div>
          </div>
        </div>

        {/* Live Solidity Code */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>TrustLockEscrow_{selectedEscrow?.id}.sol</span>
            </span>
            <span className="font-mono text-slate-400">Solidity ^0.8.20</span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {selectedEscrow?.smartContractCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
