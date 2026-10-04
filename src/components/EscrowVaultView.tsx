import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import { EscrowContract, EscrowStatus } from '../types/blockchain';
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
  Truck,
  Coins,
  Gavel,
  HelpCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface EscrowVaultViewProps {
  onSelectEscrow: (escrow: EscrowContract) => void;
  onOpenCreateModal: () => void;
  onNavigateToAcademy: () => void;
}

export const EscrowVaultView: React.FC<EscrowVaultViewProps> = ({
  onSelectEscrow,
  onOpenCreateModal,
  onNavigateToAcademy,
}) => {
  const { escrows, currentWallet, wallets, selectWallet } = useBlockchain();
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'DISPUTED' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  // Metrics
  const tvl = escrows
    .filter(e => e.status === 'FUNDED' || e.status === 'DELIVERED' || e.status === 'DISPUTED')
    .reduce((sum, e) => {
      const multiplier = e.currency === 'ETH' ? 2600 : 1;
      return sum + e.totalAmount * multiplier;
    }, 0);

  const totalYield = escrows.reduce((sum, e) => sum + (e.accruedYield || 0), 0);

  const activeCount = escrows.filter(e => e.status === 'FUNDED' || e.status === 'DELIVERED').length;
  const disputeCount = escrows.filter(e => e.status === 'DISPUTED').length;

  const filteredEscrows = escrows.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.logistics?.trackingNumber && e.logistics.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'ACTIVE') return e.status === 'FUNDED';
    if (filter === 'DELIVERED') return e.status === 'DELIVERED';
    if (filter === 'DISPUTED') return e.status === 'DISPUTED';
    if (filter === 'COMPLETED') return e.status === 'RELEASED' || e.status === 'REFUNDED';
    return true;
  });

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case 'RELEASED':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'DISPUTED':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'FUNDED':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'DELIVERED':
        return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
      case 'REFUNDED':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  const getCurrencyBadge = (currency: string) => {
    if (currency === 'USDC') return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (currency === 'USDT') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Eye-Catchy Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-sky-400/40 shadow-xl shadow-sky-500/20 shrink-0 bg-slate-800">
              <img
                src="/src/assets/images/escrow_vault_mascot_1791113025713.jpg"
                alt="Blocky the Vault Guardian"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30">
                  {t('heroBadge')}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  ● Chainlink Oracles + Aave v3 Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5 font-sans">
                {t('heroTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToAcademy}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('learnAcademyBtn')}</span>
            </button>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/30 transition-all flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>{t('createEscrowBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* USER-FRIENDLY QUICK DEMO ROLE BAR */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-sky-400" />
            <span>{language === 'hi' ? 'त्वरित टेस्ट हेतु खाता बदलें:' : 'Quick Participant Switcher (Test Any Role):'}</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 text-[11px]">
            {language === 'hi' ? 'सक्रिय:' : 'Active:'} <strong className="text-sky-300">{currentWallet.name}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {wallets.map(w => {
            const isSelected = w.address.toLowerCase() === currentWallet.address.toLowerCase();
            return (
              <button
                key={w.address}
                onClick={() => selectWallet(w.address)}
                className={`px-2.5 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-sky-500/20 border border-sky-400/50 text-white font-bold shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{w.avatar}</span>
                <span>{w.name.split(' ')[0]}</span>
                <span className="text-[10px] uppercase font-mono text-slate-400 font-normal">({w.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* USER-FRIENDLY 3-STEP GUIDE CARD */}
      {showHowItWorks && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 space-y-3 relative shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {language === 'hi' ? 'एस्क्रो 3 आसान चरणों में कैसे काम करता है:' : 'How Decentralized Escrow Works in 3 Simple Steps:'}
              </h3>
            </div>
            <button
              onClick={() => setShowHowItWorks(false)}
              className="text-slate-400 hover:text-white text-xs"
              title="Dismiss guide"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-xs">1</span>
                <span>{language === 'hi' ? 'खरीदार धन लॉक करता है' : 'Buyer Locks Funds'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'रुपया स्मार्ट कॉन्ट्रैक्ट वॉल्ट में सुरक्षित रहता है। विक्रेता को तब तक पैसा नहीं मिलता जब तक आप संतुष्ट न हों।'
                  : 'Funds lock safely in the smart contract vault. The seller cannot touch the money until delivery is verified.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-indigo-400">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                <span>{language === 'hi' ? 'विक्रेता डिलीवरी करता है' : 'Seller Dispatches Goods'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'पार्सल DHL/FedEx और चैनलिंक ऑरेकल द्वारा ऑन-चेन ट्रैक होता है। विक्रेता डिजिटल डिलीवरी प्रमाण सबमिट करता है।'
                  : 'Tracked on-chain via DHL / FedEx Chainlink Oracles. Seller submits cryptographic proof of delivery.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                <span>{language === 'hi' ? 'स्वीकृति व 50/50 ब्याज' : 'Release & Split Yield'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {language === 'hi'
                  ? 'सामान चेक करके खरीदार भुगतान जारी करता है। Aave से कमाया गया ब्याज खरीदार व विक्रेता में आधा-आधा बंटता है!'
                  : 'Buyer approves release. Accrued Aave DeFi interest is automatically split 50/50 as a bonus payout!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('tvlLabel')}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            ${tvl.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {activeCount + disputeCount} {language === 'hi' ? 'सक्रिय अनुबंध' : 'contracts in vault'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('yieldEarnedLabel')}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            ${totalYield.toFixed(2)} <span className="text-xs font-normal text-slate-400">5.4% APY</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            {language === 'hi' ? 'खरीदार व विक्रेता में 50/50 बंटवारा' : 'Splits 50/50 to Buyer & Seller'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('activeAgreementsLabel')}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {disputeCount > 0 ? (
              <span className="text-rose-400 font-semibold">{disputeCount} in DAO Jury</span>
            ) : (
              '100% nominal'
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('trustIndexLabel')}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            99.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Soulbound Token Backed
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950/80 rounded-xl">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('allContracts')} ({escrows.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'ACTIVE'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('activeFunded')} ({escrows.filter(e => e.status === 'FUNDED').length})
          </button>
          <button
            onClick={() => setFilter('DELIVERED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'DELIVERED'
                ? 'bg-slate-800 text-indigo-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('deliveredTab')} ({escrows.filter(e => e.status === 'DELIVERED').length})
          </button>
          <button
            onClick={() => setFilter('DISPUTED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'DISPUTED'
                ? 'bg-slate-800 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('disputesTab')} ({escrows.filter(e => e.status === 'DISPUTED').length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'COMPLETED'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('resolvedTab')} ({escrows.filter(e => e.status === 'RELEASED' || e.status === 'REFUNDED').length})
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Escrow Cards Grid */}
      {filteredEscrows.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No escrows found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filter tags, or create a new escrow transaction.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEscrows.map(escrow => {
            const isUserBuyer = currentWallet.address.toLowerCase() === escrow.buyerAddress.toLowerCase();
            const isUserSeller = currentWallet.address.toLowerCase() === escrow.sellerAddress.toLowerCase();
            const isUserArbiter = currentWallet.address.toLowerCase() === escrow.arbiterAddress.toLowerCase();

            return (
              <div
                key={escrow.id}
                onClick={() => onSelectEscrow(escrow)}
                className="group p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition-all duration-200 cursor-pointer shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Top line metadata & Stablecoin Badge */}
                  <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400">{escrow.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getCurrencyBadge(escrow.currency)}`}>
                        {escrow.currency}
                      </span>
                      {escrow.yieldEnabled && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Aave v3
                        </span>
                      )}
                    </div>

                    <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getStatusColor(escrow.status)}`}>
                      {escrow.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors tracking-tight line-clamp-1">
                    {escrow.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {escrow.description}
                  </p>

                  {/* Chainlink Oracle Logistics Live Feed pill */}
                  {escrow.logistics && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-semibold text-white">{escrow.logistics.carrier}:</span>
                        <span className="font-mono text-slate-300">{escrow.logistics.trackingNumber}</span>
                      </div>
                      <span className="text-emerald-400 font-medium">
                        {escrow.logistics.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* DAO Dispute Court pill if disputed */}
                  {escrow.status === 'DISPUTED' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-300 font-semibold">
                        <Gavel className="w-3.5 h-3.5 text-rose-400" />
                        <span>DAO Community Jury Active</span>
                      </div>
                      <span className="font-mono text-xs text-white">
                        {escrow.daoVotes.length} votes cast
                      </span>
                    </div>
                  )}

                  {/* Stakeholders representation */}
                  <div className="my-3.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🧒</span>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('buyer')}</div>
                        <div className="font-mono text-white text-[11px]">
                          {escrow.buyerAddress.slice(0, 6)}...{escrow.buyerAddress.slice(-4)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                        {escrow.status === 'RELEASED' ? '🎉' : escrow.status === 'DISPUTED' ? '⚖️' : '🔒'}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-0.5">Smart Contract</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-right">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('seller')}</div>
                        <div className="font-mono text-white text-[11px]">
                          {escrow.sellerAddress.slice(0, 6)}...{escrow.sellerAddress.slice(-4)}
                        </div>
                      </div>
                      <span className="text-base">👨‍💻</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Amount, Yield & Action hint */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('lockedAmount')}</span>
                    <div className="text-base font-bold font-mono text-emerald-400 tabular-nums flex items-center gap-1.5">
                      <span>{escrow.totalAmount} {escrow.currency}</span>
                      {escrow.accruedYield > 0 && (
                        <span className="text-[11px] font-normal text-amber-300">
                          (+{escrow.accruedYield} yield)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sky-400 group-hover:translate-x-0.5 transition-transform font-bold text-xs">
                    <span>
                      {isUserBuyer && escrow.status === 'CREATED'
                        ? `${t('fundEscrowBtn')} →`
                        : isUserBuyer && escrow.status === 'DELIVERED'
                        ? `${t('releaseFundsBtn')} →`
                        : isUserSeller && escrow.status === 'FUNDED'
                        ? `${t('submitDeliveryBtn')} →`
                        : escrow.status === 'DISPUTED'
                        ? `DAO Arbitration →`
                        : 'View Details →'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
