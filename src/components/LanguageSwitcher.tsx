import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '../i18n/translations';
import { Globe, Check, ChevronDown, Sparkles, X } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User-friendly Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-150 group"
        title="Select Language / भाषा चुनें"
      >
        <span className="text-sm">{currentLangMeta.flag}</span>
        <span className="font-sans font-semibold tracking-tight">{currentLangMeta.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-sky-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Elegant Dropdown with Top 10 Indian Languages */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Select Language / भाषा चुनें</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              10+ Languages
            </span>
          </div>

          <div className="my-1.5 max-h-72 overflow-y-auto space-y-1 pr-1">
            {SUPPORTED_LANGUAGES.map(langMeta => {
              const isSelected = langMeta.code === language;
              return (
                <button
                  key={langMeta.code}
                  type="button"
                  onClick={() => {
                    setLanguage(langMeta.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-400/40 text-white font-bold shadow-sm'
                      : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{langMeta.flag}</span>
                    <div>
                      <div className="text-xs font-bold leading-tight font-sans">
                        {langMeta.nativeName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {langMeta.name}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/40">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-800/80 bg-slate-950/40 rounded-xl text-[10px] text-slate-400 text-center">
            Instant on-chain &amp; UI translation across all smart contract features
          </div>
        </div>
      )}
    </div>
  );
};
