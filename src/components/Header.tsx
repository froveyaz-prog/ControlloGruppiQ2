import React from 'react';
import { Activity, Database, FileSpreadsheet, History, PlusCircle } from 'lucide-react';
import { Gruppo } from '../types';

interface HeaderProps {
  activeTab: 'inserimento' | 'storico' | 'excel';
  setActiveTab: (tab: 'inserimento' | 'storico' | 'excel') => void;
  selectedGruppo: Gruppo;
  recordCount: number;
  hasExcelLink: boolean;
  excelFileName?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedGruppo,
  recordCount,
  hasExcelLink,
  excelFileName,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo e Titolo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Quincinetto 2
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-950 text-sky-300 border border-sky-800/60">
                  v1.0.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Controlli sistematici centrale idroelettrica • {selectedGruppo}
              </p>
            </div>
          </div>

          {/* Badge di stato Excel & Registrazioni */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                hasExcelLink
                  ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-800/50 text-amber-300'
              }`}
              title={hasExcelLink ? `Collegato: ${excelFileName || 'File Excel'}` : 'Nessun file Excel collegato'}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">
                {hasExcelLink ? (excelFileName || 'Excel collegato') : 'Excel non collegato'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{recordCount} {recordCount === 1 ? 'salvato' : 'salvati'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation per Smartphone & Desktop */}
        <nav className="flex items-center gap-1 mt-3 border-t border-slate-800/80 pt-2" aria-label="Sezioni applicazione">
          <button
            type="button"
            onClick={() => setActiveTab('inserimento')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'inserimento'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Nuovo Controllo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storico')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all relative ${
              activeTab === 'storico'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Storico</span>
            {recordCount > 0 && (
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-700 text-sky-200">
                {recordCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'excel'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Gestione Excel</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
