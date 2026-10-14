import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FolderOpen,
  Info,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { RilevazioneRecord } from '../types';
import { saveOrUpdateExcel, createWorkbookFromRecords } from '../utils/excel';
import {
  saveExcelLinkToIDB,
  clearExcelLinkFromIDB,
  loadRilevazioni,
  saveRilevazioni,
  LOCAL_STORAGE_KEY,
} from '../utils/storage';
import * as XLSX from 'xlsx';

interface ExcelManagerProps {
  records: RilevazioneRecord[];
  onRecordsChanged: (records: RilevazioneRecord[]) => void;
  excelFileHandle: any;
  setExcelFileHandle: (h: any) => void;
  excelFileName: string | null;
  setExcelFileName: (name: string | null) => void;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  records,
  onRecordsChanged,
  excelFileHandle,
  setExcelFileHandle,
  excelFileName,
  setExcelFileName,
}) => {
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const excelUploadInputRef = useRef<HTMLInputElement>(null);

  const hasFileSystemAccess = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  // Collega un file Excel esistente tramite File System Access API
  const handleConnectFile = async () => {
    setStatusMessage(null);
    if (!hasFileSystemAccess) {
      setStatusMessage({
        type: 'info',
        text: 'File System Access API non disponibile su questo browser (es. su Android mobile o anteprima iframe). È possibile usare la funzione di esportazione diretta XLSX.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Cartella di lavoro di Excel (*.xlsx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
        multiple: false,
      });

      if (!handle) {
        setIsProcessing(false);
        return;
      }

      // Richiede permessi in lettura e scrittura
      const perm = await handle.requestPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        setStatusMessage({
          type: 'error',
          text: 'Permesso di scrittura negato per il file selezionato. Il collegamento non è stato attivato.',
        });
        setIsProcessing(false);
        return;
      }

      const file = await handle.getFile();
      setExcelFileHandle(handle);
      setExcelFileName(file.name);
      await saveExcelLinkToIDB(handle);

      setStatusMessage({
        type: 'success',
        text: `File collegato con successo: "${file.name}". Ora puoi usare "Aggiorna file Excel" per sincronizzare i dati.`,
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // L'utente ha annullato la selezione, nessun errore
      } else {
        setStatusMessage({
          type: 'error',
          text: `Impossibile collegare il file: ${err.message || 'Errore sconosciuto'}`,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Salva in un'altra cartella (Salva con nome)
  const handleSaveAsNewFile = async () => {
    setStatusMessage(null);
    if (!hasFileSystemAccess) {
      // Fallback: download diretto
      handleDirectDownload();
      return;
    }

    try {
      setIsProcessing(true);
      const defaultName = `Controlli_Quincinetto2_${new Date().toISOString().slice(0, 10)}.xlsx`;
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: defaultName,
        types: [
          {
            description: 'Cartella di lavoro di Excel (*.xlsx)',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      });

      if (!handle) {
        setIsProcessing(false);
        return;
      }

      // Genera workbook con i record attuali
      const wb = createWorkbookFromRecords(records);
      const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const writable = await handle.createWritable();
      await writable.write(wbOut);
      await writable.close();

      // Collega solo se la scrittura è riuscita
      const file = await handle.getFile();
      setExcelFileHandle(handle);
      setExcelFileName(file.name);
      await saveExcelLinkToIDB(handle);

      setStatusMessage({
        type: 'success',
        text: `Nuovo file salvato e collegato con successo: "${file.name}"`,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStatusMessage({
          type: 'error',
          text: `Errore durante il salvataggio: ${err.message || 'Impossibile completare la scrittura'}`,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Esegue l'aggiornamento del file collegato
  const handleUpdateExcel = async () => {
    setStatusMessage(null);
    if (records.length === 0) {
      setStatusMessage({
        type: 'info',
        text: 'Nessuna rilevazione registrata al momento da aggiornare su Excel.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const result = await saveOrUpdateExcel(records, excelFileHandle);
      if (result.success) {
        if (result.handle) {
          setExcelFileHandle(result.handle);
        }
        setStatusMessage({
          type: 'success',
          text: result.message,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Errore durante l'aggiornamento Excel: ${err.message}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Scollega file
  const handleDisconnect = async () => {
    if (window.confirm('Vuoi scollegare il file Excel attuale? I dati locali non verranno toccati.')) {
      setExcelFileHandle(null);
      setExcelFileName(null);
      await clearExcelLinkFromIDB();
      setStatusMessage({
        type: 'info',
        text: 'File Excel scollegato. Puoi ricollegarlo in qualsiasi momento.',
      });
    }
  };

  // Download diretto XLSX (compatibile sempre su qualsiasi browser e smartphone)
  const handleDirectDownload = () => {
    try {
      const wb = createWorkbookFromRecords(records);
      const fileName = `Controlli_Quincinetto2_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      setStatusMessage({
        type: 'success',
        text: `File Excel scaricato: "${fileName}". Contiene i fogli "Gruppo 1" e "Gruppo 2" con le righe storiche normalizzate.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Impossibile generare il download: ${err.message}`,
      });
    }
  };

  // Esporta Backup JSON (richiesto da specifica per trasferire dati tra dispositivi)
  const handleExportJSON = () => {
    try {
      const allRecords = loadRilevazioni();
      const exportData = {
        app: 'Controlli sistematici centrale di Quincinetto 2',
        versione: '1.0.0',
        exportDate: new Date().toISOString(),
        totalRecords: allRecords.length,
        records: allRecords,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_quincinetto2_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({
        type: 'success',
        text: 'Backup JSON scaricato con successo. Puoi usarlo per ripristinare i dati locali su un altro dispositivo o browser.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Errore esportazione backup: ${err.message}`,
      });
    }
  };

  // Ripristina Backup JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let recordsToImport: RilevazioneRecord[] = [];

        if (Array.isArray(parsed)) {
          recordsToImport = parsed;
        } else if (parsed && Array.isArray(parsed.records)) {
          recordsToImport = parsed.records;
        } else {
          throw new Error('Formato file non riconosciuto. Il file deve contenere un array di rilevazioni.');
        }

        if (recordsToImport.length === 0) {
          throw new Error('Nessuna registrazione trovata nel file JSON.');
        }

        if (
          window.confirm(
            `Trovate ${recordsToImport.length} registrazioni nel file di backup. Vuoi ripristinarle nel registro locale del browser?`
          )
        ) {
          saveRilevazioni(recordsToImport);
          onRecordsChanged(recordsToImport);
          setStatusMessage({
            type: 'success',
            text: `Ripristino completato! ${recordsToImport.length} registrazioni caricate nella memoria locale.`,
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: `Errore durante il ripristino del backup: ${err.message}`,
        });
      } finally {
        if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Messaggi di stato */}
      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-start gap-2.5 shadow-md ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-700 text-rose-200'
              : 'bg-sky-950/90 border-sky-700 text-sky-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs sm:text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* SCHEDA 1: Stato Collegamento File Excel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Collegamento File Excel Cumulativo
              </h3>
              <p className="text-xs text-slate-400">
                Unico file con due fogli: "Gruppo 1" e "Gruppo 2"
              </p>
            </div>
          </div>
          {excelFileName && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
            >
              Scollega
            </button>
          )}
        </div>

        {/* Box informativo stato collegamento */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Stato attuale:</span>
            <span
              className={`font-bold flex items-center gap-1 ${
                excelFileName ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {excelFileName ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Collegato</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Nessun file collegato</span>
                </>
              )}
            </span>
          </div>

          {excelFileName && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nome file collegato:</span>
              <span className="font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                {excelFileName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
            <span className="text-slate-400">Rilevazioni pronte per l'aggiornamento:</span>
            <span className="font-bold text-sky-400 font-mono">{records.length}</span>
          </div>
        </div>

        {/* Azioni Principali Excel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Aggiorna file Excel */}
          <button
            type="button"
            onClick={handleUpdateExcel}
            disabled={isProcessing}
            className={`py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              excelFileName
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 cursor-pointer'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Aggiorna File Excel</span>
          </button>

          {/* Collega file esistente / spostato */}
          <button
            type="button"
            onClick={handleConnectFile}
            disabled={isProcessing}
            className="py-3.5 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-sky-400" />
            <span>Collega File Esistente</span>
          </button>
        </div>

        {/* Opzioni Aggiuntive: Salva con nome & Download diretto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleSaveAsNewFile}
            disabled={isProcessing}
            className="py-3 px-3 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Salva in Nuova Cartella</span>
          </button>

          <button
            type="button"
            onClick={handleDirectDownload}
            className="py-3 px-3 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Scarica File XLSX (Download)</span>
          </button>
        </div>

        {/* Note sulle regole Excel */}
        <div className="text-[11px] text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-900 space-y-1">
          <p className="font-semibold text-slate-300">Regole centrali dello storico Excel:</p>
          <p>• Conserva tutte le date precedenti; le righe archiviate non vengono mai cancellate dall'app.</p>
          <p>• Riconosce e normalizza vecchie intestazioni (es. "Pressione Olio campana" e pattini combinato).</p>
          <p>• Due fogli distinti "Gruppo 1" e "Gruppo 2" nello stesso file.</p>
        </div>
      </div>

      {/* SCHEDA 2: Backup e Ripristino Dati Locali (JSON) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Backup & Ripristino Dati Locali (JSON)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Utile per trasferire l'elenco locale delle registrazioni tra browser o dispositivi diversi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Esporta Backup */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Esporta Backup JSON ({records.length})</span>
          </button>

          {/* Importa Backup */}
          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Ripristina da Backup JSON</span>
          </button>
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
