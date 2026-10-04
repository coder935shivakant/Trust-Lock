import React from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import { Wallet } from '../types/blockchain';
import {
  X,
  Shield,
  Award,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Lock,
  ExternalLink,
  Coins,
  History,
} from 'lucide-react';

interface UserProfileModalProps {
  wallet: Wallet;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ wallet, onClose }) => {
  const { t, language } = useLanguage();

  const shortAddress = `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Profile Banner */}
        <div className="relative p-6 sm:p-7 bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-sky-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
              {wallet.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{wallet.name}</h2>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {wallet.role}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                <span>{shortAddress}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'hi' ? 'ऑन-चेन सत्यापित' : 'On-Chain Verified'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reputation Metrics Grid */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold">{t('trustScore')}</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                {wallet.reputationScore}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Tier 1 Rating</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold">{t('successfulDeals')}</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {wallet.successfulEscrows}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Completed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold">{t('disputeRatio')}</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                {wallet.totalEscrows > 0 ? `${Math.round(((wallet.totalEscrows - wallet.disputedEscrows) / wallet.totalEscrows) * 100)}%` : '100%'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{wallet.disputedEscrows} Disputes</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-semibold">Soulbound Badges</div>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
                {wallet.sbtTokens.length} SBT
              </div>
              <div className="text-[10px] text-purple-300 mt-0.5">ERC-5114 Minted</div>
            </div>
          </div>

          {/* Stablecoin & Native Balances */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? 'वॉलेट संपत्ति व स्टेबलकॉइन शेष' : 'Wallet Assets & Stablecoin Balances'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">Ethereum (ETH)</span>
                <div className="font-mono text-base font-bold text-white mt-0.5">{wallet.balance.toFixed(2)} ETH</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">Tether (USDT)</span>
                <div className="font-mono text-base font-bold text-emerald-400 mt-0.5">${wallet.stablecoinBalances?.USDT || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">USD Coin (USDC)</span>
                <div className="font-mono text-base font-bold text-sky-400 mt-0.5">${wallet.stablecoinBalances?.USDC || 0}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px]">Dai Stablecoin (DAI)</span>
                <div className="font-mono text-base font-bold text-amber-400 mt-0.5">${wallet.stablecoinBalances?.DAI || 0}</div>
              </div>
            </div>
          </div>

          {/* Soulbound Tokens (SBT) Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{t('sbtTitle')}</span>
                </h3>
                <p className="text-xs text-slate-400">{t('sbtSubtitle')}</p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {t('nonTransferableBadge')}
              </span>
            </div>

            {wallet.sbtTokens.length === 0 ? (
              <div className="p-5 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 italic">
                {language === 'hi'
                  ? 'इस खाते के लिए अभी कोई सोलबाउंड टोकन नहीं बना है। सफल एस्क्रो लेनदेन पूरा करके पहला SBT अर्जित करें।'
                  : 'No Soulbound Tokens minted for this identity yet. Complete dispute-free escrows to earn your first SBT credential.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wallet.sbtTokens.map(sbt => (
                  <div
                    key={sbt.id}
                    className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/30 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{sbt.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{sbt.name}</h4>
                          <span className="text-[10px] font-mono text-sky-400">{sbt.tokenId}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-purple-300 uppercase px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {sbt.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">{sbt.description}</p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Tx: {sbt.transactionHash.slice(0, 10)}...</span>
                      <span className="text-emerald-400 font-semibold">Bound to Soul</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
