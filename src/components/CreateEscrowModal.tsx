import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import { CurrencyType, LogisticsCarrier } from '../types/blockchain';
import { X, Plus, Trash2, Shield, Calendar, DollarSign, ListChecks, Sparkles, Truck } from 'lucide-react';

interface CreateEscrowModalProps {
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { wallets, currentWallet, createEscrow } = useBlockchain();
  const { t, language } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sellerAddress, setSellerAddress] = useState(
    wallets.find(w => w.role === 'SELLER')?.address || wallets[1]?.address || ''
  );
  const [currency, setCurrency] = useState<CurrencyType>('USDC');
  const [totalAmount, setTotalAmount] = useState<number>(1500);
  const [deadlineHours, setDeadlineHours] = useState<number>(72);
  const [yieldEnabled, setYieldEnabled] = useState(true);

  // Logistics
  const [includeLogistics, setIncludeLogistics] = useState(false);
  const [carrier, setCarrier] = useState<LogisticsCarrier>('DHL Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Milestones
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<{ title: string; percentage: number }[]>([
    { title: 'Initial Prototype / Blueprint', percentage: 30 },
    { title: 'Working Beta / Verification', percentage: 40 },
    { title: 'Final Handover & Approval', percentage: 30 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addMilestone = () => {
    if (milestones.length >= 5) return;
    setMilestones(prev => [...prev, { title: `Milestone Stage ${prev.length + 1}`, percentage: 20 }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: 'title' | 'percentage', value: any) => {
    setMilestones(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया अनुबंध का शीर्षक दर्ज करें।' : 'Please enter an escrow project title.');
      return;
    }

    if (totalAmount <= 0) {
      setErrorMsg(language === 'hi' ? 'राशि 0 से अधिक होनी चाहिए।' : 'Amount must be greater than 0.');
      return;
    }

    if (useMilestones && totalPercentage !== 100) {
      setErrorMsg(`Milestone percentages must sum up to exactly 100% (currently ${totalPercentage}%).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createEscrow({
        title: title.trim(),
        description: description.trim() || 'Verifiable decentralized escrow agreement.',
        sellerAddress,
        totalAmount,
        currency,
        deadlineHours,
        yieldEnabled,
        carrier: includeLogistics ? carrier : undefined,
        trackingNumber: includeLogistics && trackingNumber.trim() ? trackingNumber.trim() : undefined,
        milestones: useMilestones ? milestones : [],
      });
      onSuccess(id);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create escrow contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">{t('createEscrowBtn')}</h3>
              <p className="text-xs text-slate-400">Stablecoins, Chainlink Oracles &amp; Yield Automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi' ? 'परियोजना या वस्तु का शीर्षक *' : 'Project / Item Title *'}
            </label>
            <input
              type="text"
              placeholder="e.g. 3D Robotics Assets & Rigged Models"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {language === 'hi' ? 'विवरण व विनिर्देश' : 'Description & Specifications'}
            </label>
            <textarea
              rows={2}
              placeholder="Detailed deliverable specifications..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {language === 'hi' ? 'विक्रेता चुनें *' : 'Seller Counterparty *'}
              </label>
              <select
                value={sellerAddress}
                onChange={e => setSellerAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              >
                {wallets
                  .filter(w => w.address.toLowerCase() !== currentWallet.address.toLowerCase())
                  .map(w => (
                    <option key={w.address} value={w.address}>
                      {w.avatar} {w.name} ({w.role})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t('currencyLabel')}
              </label>
              <div className="flex gap-1">
                {(['USDC', 'USDT', 'ETH', 'DAI'] as CurrencyType[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCurrency(c);
                      if (c === 'ETH' && totalAmount > 50) setTotalAmount(2.0);
                      if (c !== 'ETH' && totalAmount <= 5) setTotalAmount(1500);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                      currency === c
                        ? 'bg-sky-600 text-white shadow'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t('lockedAmount')} ({currency}) *
            </label>
            <input
              type="number"
              step={currency === 'ETH' ? '0.01' : '1'}
              min="0.01"
              value={totalAmount}
              onChange={e => setTotalAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono tabular-nums"
              required
            />
          </div>

          {/* DeFi Yield Farming Toggle */}
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {language === 'hi' ? 'Aave v3 यील्ड जनरेशन सक्रिय करें' : 'Enable Automated Aave v3 Yield Farming'}
                </span>
                <span className="text-[11px] text-amber-300">
                  {language === 'hi' ? '5.4% वार्षिक ब्याज उत्पन्न होगा, जो पूरा होने पर 50/50 बंटेगा' : 'Earn ~5.4% APY while locked, split 50/50 upon release'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={yieldEnabled}
              onChange={e => setYieldEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-700"
            />
          </div>

          {/* Chainlink Logistics Courier Option */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={includeLogistics}
                  onChange={e => setIncludeLogistics(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-400" />
                  {language === 'hi' ? 'चैनलिंक ऑरेकल लॉजिस्टिक्स ट्रैकिंग जोड़ें' : 'Attach Chainlink Oracle Logistics Tracking'}
                </span>
              </label>
            </div>

            {includeLogistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">{t('carrier')}:</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value as LogisticsCarrier)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="DHL Express">DHL Express</option>
                    <option value="FedEx Global">FedEx Global</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">{t('trackingNumber')}:</label>
                  <input
                    type="text"
                    placeholder="e.g. DHL-9812-4412"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmitting ? 'Deploying...' : t('createEscrowBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
