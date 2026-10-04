import React, { useState } from 'react';
import { useBlockchain } from '../context/BlockchainContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Check, Trash2, ExternalLink, Zap, Truck, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationCenterProps {
  onSelectEscrowId?: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectEscrowId }) => {
  const { notifications, unreadNotifsCount, markNotificationAsRead, clearAllNotifications, escrows } = useBlockchain();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY_UPDATE':
        return <Truck className="w-4 h-4 text-sky-400" />;
      case 'YIELD_ACCRUED':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'DISPUTE_FILED':
      case 'DAO_VOTE':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Zap className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
        title={t('notificationsTitle')}
      >
        <Bell className="w-4 h-4" />
        {unreadNotifsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900 animate-pulse">
            {unreadNotifsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">{t('notificationsTitle')}</span>
              {unreadNotifsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                  {unreadNotifsCount}
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('clearAll')}</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                {t('noNotifications')}
              </div>
            ) : (
              notifications.map(n => {
                const title = language === 'hi' ? n.titleHi : n.titleEn;
                const message = language === 'hi' ? n.messageHi : n.messageEn;
                const dateStr = new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.escrowId && onSelectEscrowId) {
                        onSelectEscrowId(n.escrowId);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl transition-colors cursor-pointer text-left flex items-start gap-2.5 ${
                      !n.read ? 'bg-sky-950/30 hover:bg-sky-950/50' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-white truncate">{title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">{dateStr}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{message}</p>
                      {n.escrowId && (
                        <div className="text-[10px] text-sky-400 mt-1 font-mono flex items-center gap-1">
                          <span>{n.escrowId}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
