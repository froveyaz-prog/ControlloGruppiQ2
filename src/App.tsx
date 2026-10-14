import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DataEntryForm } from './components/DataEntryForm';
import { HistoryList } from './components/HistoryList';
import { ExcelManager } from './components/ExcelManager';
import { Gruppo, RilevazioneRecord } from './types';
import {
  loadRilevazioni,
  deleteRilevazioniByIds,
  loadExcelLinkFromIDB,
} from './utils/storage';
import { saveOrUpdateExcel } from './utils/excel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inserimento' | 'storico' | 'excel'>('inserimento');
  const [selectedGruppo, setSelectedGruppo] = useState<Gruppo>('Gruppo 1');
  const [records, setRecords] = useState<RilevazioneRecord[]>([]);
  const [excelFileHandle, setExcelFileHandle] = useState<any>(null);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);

  // Caricamento iniziale dei dati da localStorage e IndexedDB
  useEffect(() => {
    const saved = loadRilevazioni();
    setRecords(saved);

    // Recupera eventuale collegamento Excel salvato in IndexedDB
    loadExcelLinkFromIDB().then(async (handle) => {
      if (handle) {
        setExcelFileHandle(handle);
        try {
          if (typeof handle.getFile === 'function') {
            const file = await handle.getFile();
            setExcelFileName(file.name);
          } else if (handle.name) {
            setExcelFileName(handle.name);
          }
        } catch {
          // Permessi scaduti o handle da rinnovare
          setExcelFileName('File salvato (richiede autorizzazione)');
        }
      }
    });
  }, []);

  // Gestione installazione PWA (WebAPK / Schermata Home su Android)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Callback quando una rilevazione viene salvata
  const handleRecordSaved = (updatedRecord: RilevazioneRecord, isUpdate: boolean) => {
    setRecords(loadRilevazioni());
  };

  // Callback eliminazione record
  const handleDeleteRecords = (ids: string[]) => {
    const remaining = deleteRilevazioniByIds(ids);
    setRecords(remaining);
  };

  // Callback auto sync con Excel se collegato
  const handleAutoSyncExcel = async () => {
    if (excelFileHandle) {
      try {
        await saveOrUpdateExcel(loadRilevazioni(), excelFileHandle);
      } catch (err) {
        console.warn('Auto-sync Excel non riuscito in background:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Intestazione e Navigazione */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedGruppo={selectedGruppo}
        recordCount={records.length}
        hasExcelLink={!!excelFileName}
        excelFileName={excelFileName}
      />

      {/* Banner Installazione PWA (WebAPK / Schermata Home) */}
      {showInstallBanner && (
        <aside aria-label="Installazione app" className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-700/60 px-4 py-2.5 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src="./icon-192.png" alt="Quincinetto 2" className="w-8 h-8 rounded-lg shadow-sm shrink-0 border border-sky-500/30" />
              <div>
                <p className="text-xs font-bold text-white">Installa Quincinetto 2 sul tuo telefono</p>
                <p className="text-[11px] text-sky-300">Usa l'app a schermo intero offline e con icona dedicata</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallApp}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Installa App
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-1"
                title="Chiudi"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Contenuto Principale con Larghezza Ottimizzata Mobile & Desktop */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'inserimento' && (
          <DataEntryForm
            selectedGruppo={selectedGruppo}
            setSelectedGruppo={setSelectedGruppo}
            onRecordSaved={handleRecordSaved}
            onAutoSyncExcel={handleAutoSyncExcel}
            hasExcelLink={!!excelFileHandle}
          />
        )}

        {activeTab === 'storico' && (
          <HistoryList
            records={records}
            onDeleteRecords={handleDeleteRecords}
          />
        )}

        {activeTab === 'excel' && (
          <ExcelManager
            records={records}
            onRecordsChanged={setRecords}
            excelFileHandle={excelFileHandle}
            setExcelFileHandle={setExcelFileHandle}
            excelFileName={excelFileName}
            setExcelFileName={setExcelFileName}
          />
        )}
      </main>

      {/* Footer Tecnico Leggero */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-center text-[11px] text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>Centrale di Quincinetto 2 • Controlli Sistematici Gruppo 1 & Gruppo 2</span>
          <span>Versione 1.0.0 • Controlli Sistematici Standalone & Mobile Ready</span>
        </div>
      </footer>
    </div>
  );
}
