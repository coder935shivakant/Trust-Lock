import React, { useState } from 'react';
import { BlockchainProvider, useBlockchain } from './context/BlockchainContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { EscrowVaultView } from './components/EscrowVaultView';
import { LedgerExplorerView } from './components/LedgerExplorerView';
import { IntegrityLabView } from './components/IntegrityLabView';
import { SmartContractInspectorView } from './components/SmartContractInspectorView';
import { KidsAcademyView } from './components/KidsAcademyView';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { EscrowDetailsModal } from './components/EscrowDetailsModal';
import { EscrowContract } from './types/blockchain';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'escrow' | 'ledger' | 'integrity' | 'contracts' | 'academy'>('escrow');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null);

  const { escrows } = useBlockchain();
  const { language } = useLanguage();

  const activeEscrow = selectedEscrow
    ? escrows.find(e => e.id === selectedEscrow.id) || selectedEscrow
    : null;

  const handleSelectEscrowById = (id: string) => {
    const found = escrows.find(e => e.id === id);
    if (found) {
      setSelectedEscrow(found);
      setActiveTab('escrow');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onSelectEscrowId={handleSelectEscrowById}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'escrow' && (
          <EscrowVaultView
            onSelectEscrow={esc => setSelectedEscrow(esc)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onNavigateToAcademy={() => setActiveTab('academy')}
          />
        )}

        {activeTab === 'ledger' && <LedgerExplorerView />}

        {activeTab === 'integrity' && <IntegrityLabView />}

        {activeTab === 'contracts' && <SmartContractInspectorView />}

        {activeTab === 'academy' && <KidsAcademyView />}
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateEscrowModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={newId => {
            setIsCreateModalOpen(false);
            const created = escrows.find(e => e.id === newId);
            if (created) setSelectedEscrow(created);
          }}
        />
      )}

      {activeEscrow && (
        <EscrowDetailsModal
          escrow={activeEscrow}
          onClose={() => setSelectedEscrow(null)}
        />
      )}

      {/* Modern Footer */}
      <footer className="border-t border-slate-850 bg-slate-950/90 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            TrustLock · {language === 'hi' ? 'विकेंद्रीकृत एस्क्रो एवं डेटा अखंडता प्लेटफॉर्म' : 'Decentralized Escrow & Integrity Protocol'}
          </div>
          <div className="flex items-center gap-3">
            <span>Aave v3 Yield</span>
            <span>·</span>
            <span>Chainlink Logistics Oracles</span>
            <span>·</span>
            <span>Soulbound Tokens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BlockchainProvider>
        <AppContent />
      </BlockchainProvider>
    </LanguageProvider>
  );
}
