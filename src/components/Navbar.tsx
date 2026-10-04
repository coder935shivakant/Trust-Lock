import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, ChevronDown, Plus, Cpu, UserCheck, User, Award } from 'lucide-react';
import { Role } from '../types/blockchain';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationCenter } from './NotificationCenter';
import { UserProfileModal } from './UserProfileModal';

interface NavbarProps {
  activeTab: 'escrow' | 'ledger' | 'integrity' | 'contracts' | 'academy';
  setActiveTab: (tab: 'escrow' | 'ledger' | 'integrity' | 'contracts' | 'academy') => void;
  onOpenCreateModal: () => void;
  onSelectEscrowId?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onSelectEscrowId,
}) => {
  const { wallets, currentWallet, selectWallet, createNewWallet, chain, integrityReport } = useBlockchain();
  const { t, language } = useLanguage();
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletRole, setNewWalletRole] = useState<Role>('BUYER');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleCreateWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    createNewWallet(newWalletName.trim(), newWalletRole);
    setNewWalletName('');
    setIsAddingWallet(false);
    setWalletDropdownOpen(false);
  };

  const isChainValid = integrityReport ? integrityReport.isValid : true;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-2xl shadow-sky-950/20">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('escrow')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform border border-sky-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
              TrustLock
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40">
                v2.0 DeFi
              </span>
            </span>
          </div>
        </button>

        {/* Zone 2: Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <button
            onClick={() => setActiveTab('escrow')}
            className={`transition-all py-1 ${
              activeTab === 'escrow'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('navEscrow')}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`transition-all py-1 flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>{t('navLedger')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
              #{chain.length - 1}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('integrity')}
            className={`transition-all py-1 flex items-center gap-1.5 ${
              activeTab === 'integrity'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>{t('navIntegrity')}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isChainValid ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-rose-500 animate-ping'
              }`}
            />
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`transition-all py-1 ${
              activeTab === 'contracts'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('navContracts')}
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`transition-all py-1 flex items-center gap-1.5 ${
              activeTab === 'academy'
                ? 'text-amber-400 font-bold border-b-2 border-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <span>✨ {t('navAcademy')}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Language, Notifications, Wallet Switcher, + New Escrow) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-language Switcher (EN / HI) */}
          <LanguageSwitcher />

          {/* Real-time Notification Center */}
          <NotificationCenter onSelectEscrowId={onSelectEscrowId} />

          {/* Wallet Selector Dropdown & Profile Trigger */}
          <div className="relative">
            <button
              onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all text-left shadow-sm"
              title={t('switchAccount')}
            >
              <span className="text-lg">{currentWallet.avatar}</span>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span className="truncate max-w-[90px]">{currentWallet.name}</span>
                  <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    {currentWallet.role}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 tabular-nums font-semibold flex items-center gap-1">
                  <span>{currentWallet.balance.toFixed(2)} ETH</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-sky-400">${currentWallet.stablecoinBalances?.USDC || 0} USDC</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {walletDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-800 flex justify-between items-center">
                  <span>{t('switchAccount')}</span>
                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setWalletDropdownOpen(false);
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>{t('viewProfile')}</span>
                  </button>
                </div>

                <div className="space-y-1 my-2 max-h-60 overflow-y-auto">
                  {wallets.map(w => {
                    const isSelected = w.address.toLowerCase() === currentWallet.address.toLowerCase();
                    return (
                      <button
                        key={w.address}
                        onClick={() => {
                          selectWallet(w.address);
                          setWalletDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-sky-500/20 text-white border border-sky-500/30'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{w.avatar}</span>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1">
                              {w.name}
                              {isSelected && <UserCheck className="w-3 h-3 text-sky-400" />}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {w.address.slice(0, 6)}...{w.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                            {w.balance.toFixed(1)} ETH
                          </div>
                          <div className="text-[10px] text-amber-400 font-mono">
                            {t('reputation')}: {w.reputationScore}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!isAddingWallet ? (
                  <button
                    onClick={() => setIsAddingWallet(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors border border-dashed border-slate-700 hover:border-sky-500/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'नई विकेंद्रीकृत पहचान बनाएं' : 'Create Custom Identity'}</span>
                  </button>
                ) : (
                  <form onSubmit={handleCreateWalletSubmit} className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Sam the Student"
                      value={newWalletName}
                      onChange={e => setNewWalletName(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {(['BUYER', 'SELLER', 'ARBITER'] as Role[]).map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNewWalletRole(r)}
                          className={`flex-1 py-1 text-[10px] font-semibold rounded-lg ${
                            newWalletRole === r
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Generate Key
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingWallet(false)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* New Escrow CTA */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('createEscrowBtn')}</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* User Profile Modal Trigger */}
      {isProfileOpen && (
        <UserProfileModal
          wallet={currentWallet}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Mobile Nav strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 text-xs font-medium text-slate-400 bg-slate-950/90">
        <button
          onClick={() => setActiveTab('escrow')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'escrow' ? 'text-sky-400 font-bold bg-sky-950/60' : ''}`}
        >
          {t('navEscrow')}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'ledger' ? 'text-sky-400 font-bold bg-sky-950/60' : ''}`}
        >
          {t('navLedger')}
        </button>
        <button
          onClick={() => setActiveTab('integrity')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'integrity' ? 'text-sky-400 font-bold bg-sky-950/60' : ''}`}
        >
          {t('navIntegrity')}
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'contracts' ? 'text-sky-400 font-bold bg-sky-950/60' : ''}`}
        >
          {t('navContracts')}
        </button>
        <button
          onClick={() => setActiveTab('academy')}
          className={`px-2 py-1 rounded-lg text-amber-400 ${activeTab === 'academy' ? 'font-bold bg-amber-950/60' : ''}`}
        >
          {t('navAcademy')}
        </button>
      </div>
    </header>
  );
};
