import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { Block, Transaction } from '../types/blockchain';
import {
  Boxes,
  Zap,
  Play,
  Pause,
  Clock,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Hash,
  Database,
  RefreshCw,
  Search,
  Activity,
  Flame,
} from 'lucide-react';

export const LedgerExplorerView: React.FC = () => {
  const {
    chain,
    mempool,
    miningMode,
    setMiningMode,
    isMining,
    tps,
    mineMempoolNow,
    fireTransactionBurst,
  } = useBlockchain();

  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(chain.length > 0 ? chain.length - 1 : 0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const selectedBlock = chain.find(b => b.index === selectedBlockIndex) || chain[chain.length - 1];

  const shortHash = (hash: string) => {
    if (!hash) return '';
    return hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;
  };

  const totalTxsInChain = chain.reduce((acc, b) => acc + b.transactions.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: High Speed Engine Controls */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-sky-400">Decentralized High-Speed Ledger Engine</span>
            <span>·</span>
            <span>Proof of Authority / PoW Consensus</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Blockchain Explorer &amp; Mempool Pipeline</span>
            {isMining && (
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Mining Block...
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time block stream with cryptographic SHA-256 parent links, Merkle tree trees, and high-throughput pipeline.
          </p>
        </div>

        {/* Engine Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mining Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMiningMode('INSTANT')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                miningMode === 'INSTANT'
                  ? 'bg-sky-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transactions are mined instantly on submission"
            >
              Instant
            </button>
            <button
              onClick={() => setMiningMode('AUTO_FAST')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                miningMode === 'AUTO_FAST'
                  ? 'bg-sky-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transactions queue in mempool and are batched every 3.5s"
            >
              Auto (3.5s)
            </button>
            <button
              onClick={() => setMiningMode('MANUAL')}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                miningMode === 'MANUAL'
                  ? 'bg-sky-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Manual block production on demand"
            >
              Manual
            </button>
          </div>

          {/* High-speed burst button */}
          <button
            onClick={() => fireTransactionBurst(15)}
            disabled={isMining}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Injects 15 simultaneous high-speed peer transactions into the ledger"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>⚡ Fire Burst (15 TXs)</span>
          </button>

          {miningMode === 'MANUAL' && mempool.length > 0 && (
            <button
              onClick={mineMempoolNow}
              disabled={isMining}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Mine Mempool ({mempool.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Telemetry strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Current Block Height</div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            #{chain.length - 1}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">● Consensus finalized</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Ledger Txs</div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {totalTxsInChain}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">100% verified signatures</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Mempool Queue</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {mempool.length} <span className="text-xs font-normal text-slate-400">pending</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {miningMode === 'AUTO_FAST' ? 'Batching next block' : 'Ready to pack'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Processing Throughput</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1 tabular-nums flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{tps} TPS</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Zero network bottlenecks</div>
        </div>
      </div>

      {/* Visual Block Chain Train */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-sky-400" />
            <span>Cryptographic Block Chain Sequence</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click any block to inspect its Merkle root and transaction payloads
          </span>
        </div>

        {/* Scrollable Block Chain horizontal layout */}
        <div className="overflow-x-auto pb-3 pt-1">
          <div className="flex items-center gap-2 min-w-max">
            {chain.map((b, idx) => {
              const isSelected = selectedBlock?.index === b.index;
              return (
                <React.Fragment key={b.index}>
                  <button
                    onClick={() => {
                      setSelectedBlockIndex(b.index);
                      setSelectedTx(null);
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition-all duration-150 min-w-[170px] ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 shadow-md shadow-sky-500/10'
                        : b.isTampered
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-mono font-bold ${b.isTampered ? 'text-rose-400' : 'text-sky-400'}`}>
                        Block #{b.index}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {b.index === 0 ? 'Genesis' : `${b.transactions.length} txs`}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 truncate mb-1">
                      Hash: {shortHash(b.hash)}
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Prev: {shortHash(b.previousHash)}
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                      <span>Nonce: {b.nonce}</span>
                      <span className="text-emerald-400 text-[10px] font-semibold">
                        {b.isTampered ? '⚠️ TAMPERED' : '✓ VALID'}
                      </span>
                    </div>
                  </button>

                  {/* Cryptographic Link Cable */}
                  {idx < chain.length - 1 && (
                    <div className="flex flex-col items-center justify-center px-1 text-sky-400/60 font-mono text-xs">
                      <div className="w-5 h-0.5 bg-gradient-to-r from-sky-400 to-indigo-500" />
                      <span className="text-[9px] text-slate-400">SHA</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Block Inspector & Transactions Detail */}
      {selectedBlock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Block Header Info (Left) */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-sky-400" />
                <span>Block #{selectedBlock.index} Details</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {new Date(selectedBlock.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">Block SHA-256 Hash</div>
                <div className="font-mono text-white text-[11px] break-all bg-slate-950 p-2 rounded-lg border border-slate-800 mt-0.5">
                  {selectedBlock.hash}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Previous Block Hash</div>
                <div className="font-mono text-slate-300 text-[11px] break-all bg-slate-950 p-2 rounded-lg border border-slate-800 mt-0.5">
                  {selectedBlock.previousHash}
                </div>
              </div>

              <div>
                <div className="text-slate-400 text-[11px]">Merkle Tree Root</div>
                <div className="font-mono text-emerald-300 text-[11px] break-all bg-slate-950 p-2 rounded-lg border border-slate-800 mt-0.5">
                  {selectedBlock.merkleRoot}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Mining Nonce</div>
                  <div className="font-mono text-white font-semibold mt-0.5">{selectedBlock.nonce}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Validator</div>
                  <div className="font-mono text-sky-300 text-[10px] truncate mt-0.5">
                    {shortHash(selectedBlock.validator)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions in Block (Right) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Transactions in Block ({selectedBlock.transactions.length})</span>
              </span>
              <span className="text-xs text-slate-400">Click a transaction to inspect its signature</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {selectedBlock.transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedTx?.id === tx.id
                      ? 'bg-sky-500/15 border-sky-400'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sky-400 font-mono">#{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                        {tx.type}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {tx.amount > 0 ? `${tx.amount} ETH` : '0 ETH (Call)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 my-1">
                    <div>
                      From: <span className="font-mono text-slate-300">{shortHash(tx.from)}</span>
                    </div>
                    <div>
                      To: <span className="font-mono text-slate-300">{shortHash(tx.to)}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Tx ID: {tx.id}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Tx Detail Drawer */}
            {selectedTx && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Cryptographic Payload &amp; Digital Seal</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Signature
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 break-all">
                  Sig: {selectedTx.signature}
                </div>
                <div className="text-[11px] text-slate-400">
                  Payload: {JSON.stringify(selectedTx.payload)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
