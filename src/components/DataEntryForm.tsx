import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gauge,
  HelpCircle,
  Plus,
  Save,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { CATEGORIES, CategoryId, Gruppo, RilevazioneDati, RilevazioneRecord } from '../types';
import { getOperatoriRecenti, upsertRilevazione } from '../utils/storage';

interface DataEntryFormProps {
  selectedGruppo: Gruppo;
  setSelectedGruppo: (g: Gruppo) => void;
  onRecordSaved: (record: RilevazioneRecord, isUpdate: boolean) => void;
  onAutoSyncExcel?: () => void;
  hasExcelLink: boolean;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({
  selectedGruppo,
  setSelectedGruppo,
  onRecordSaved,
  onAutoSyncExcel,
  hasExcelLink,
}) => {
  // Campi Comuni
  const todayStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [data, setData] = useState<string>(todayStr);
  const [ora, setOra] = useState<string>(nowTimeStr);
  const [operatore, setOperatore] = useState<string>('');
  const [operatoriRecenti, setOperatoriRecenti] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('potenza');

  // Bozza corrente dei dati per il controllo
  const [bozza, setBozza] = useState<RilevazioneDati>({});

  // Errori di convalida
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal di conferma salvataggio
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    setOperatoriRecenti(getOperatoriRecenti());
  }, []);

  // Aggiorna un singolo campo della bozza
  const updateBozzaField = (key: keyof RilevazioneDati, value: any) => {
    setBozza((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };

  // Pulisce la bozza per ricominciare
  const handleClearBozza = () => {
    if (Object.keys(bozza).length === 0) return;
    if (window.confirm('Sei sicuro di voler cancellare i dati inseriti nella bozza attuale?')) {
      setBozza({});
      setErrorMessage(null);
    }
  };

  // Verifica se ci sono campi compilati nella bozza
  const countFilledFields = () => {
    return Object.values(bozza).filter((v) => v !== null && v !== undefined && v !== '').length;
  };

  // Prepara il salvataggio
  const handleInitiateSave = () => {
    setErrorMessage(null);
    if (!operatore.trim()) {
      setErrorMessage("Inserire il nome dell'operatore prima di salvare (campo obbligatorio).");
      return;
    }
    if (!data) {
      setErrorMessage('Selezionare la data del controllo.');
      return;
    }
    if (countFilledFields() === 0) {
      setErrorMessage('Nessun dato inserito. Compilare almeno una categoria prima di salvare.');
      return;
    }
    // Apre la finestra di conferma obbligatoria da specifica
    setShowConfirmModal(true);
  };

  // Conferma finale salvataggio
  const handleConfirmSave = () => {
    try {
      const { updatedRecord, isUpdate } = upsertRilevazione(
        selectedGruppo,
        data,
        ora,
        operatore,
        bozza
      );

      setShowConfirmModal(false);
      setSuccessToast(
        isUpdate
          ? `Dati aggiornati per ${selectedGruppo} del ${data} (${operatore})`
          : `Nuovo controllo salvato per ${selectedGruppo} (${operatore})`
      );

      // Aggiorna la lista degli operatori recenti
      setOperatoriRecenti(getOperatoriRecenti());

      // Notifica al genitore
      onRecordSaved(updatedRecord, isUpdate);

      // Se collegato a Excel, triggera eventuale salvataggio automatico
      if (hasExcelLink && onAutoSyncExcel) {
        onAutoSyncExcel();
      }

      // Reimposta la bozza
      setBozza({});
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Errore durante il salvataggio dei dati.');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast di successo */}
      {successToast && (
        <div className="bg-emerald-950/90 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-400 hover:text-emerald-100 font-bold px-2 py-1"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Messaggio di errore */}
      {errorMessage && (
        <div className="bg-rose-950/90 border border-rose-600 text-rose-200 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* SCHEDA 1: Selettore Gruppo (Pulsantoni Touch-Friendly) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          1. Seleziona Gruppo della Centrale
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['Gruppo 1', 'Gruppo 2'] as Gruppo[]).map((g) => {
            const isSelected = selectedGruppo === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGruppo(g)}
                className={`py-4 px-4 rounded-xl border-2 font-bold text-base sm:text-lg flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <Zap className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-sky-400'}`} />
                <span>{g}</span>
                <span className="text-[11px] font-normal opacity-85">
                  {isSelected ? 'Attualmente attivo' : 'Tocca per selezionare'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SCHEDA 2: Campi Comuni (Data, Ora, Operatore) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          2. Informazioni della Rilevazione
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Data del controllo
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Ora */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Ora</span>
            </label>
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Operatore (Obbligatorio) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Operatore <span className="text-rose-400">*</span></span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Obbligatorio</span>
            </label>
            <input
              type="text"
              placeholder="Nome e cognome"
              value={operatore}
              onChange={(e) => setOperatore(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-medium focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Chip Operatori Recenti per inserimento rapido touch su smartphone */}
        {operatoriRecenti.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block mb-1.5">Operatori recenti:</span>
            <div className="flex flex-wrap gap-1.5">
              {operatoriRecenti.map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperatore(op)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    operatore.toLowerCase() === op.toLowerCase()
                      ? 'bg-sky-700 border-sky-500 text-white font-medium'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SCHEDA 3: Menu "Dato da inserire" e Campi Categoria */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            3. Dato da Inserire (Scegli Categoria)
          </label>
          <span className="text-xs text-sky-400 font-medium">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.label}
          </span>
        </div>

        {/* Menu a tendina Categoria */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
            className="w-full appearance-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-semibold text-sm sm:text-base focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none pr-10 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label} ({cat.shortDesc})
              </option>
            ))}
          </select>
          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* FORM SPECIFICO DELLA CATEGORIA SELEZIONATA */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 sm:p-5 mt-2">
          {/* Categoria 1: Potenza gruppo */}
          {selectedCategory === 'potenza' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Potenza Gruppo {selectedGruppo}</h3>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Valore in MW
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    inputMode="decimal"
                    placeholder="Es. 12.50"
                    value={bozza.potenza_mw ?? ''}
                    onChange={(e) =>
                      updateBozzaField('potenza_mw', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold focus:ring-2 focus:ring-sky-500 outline-none pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    MW
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 2: Supporto guida turbina */}
          {selectedCategory === 'guida_turbina' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Supporto Guida Turbina</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura olio supporto (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.guida_turbina_temp_olio ?? ''}
                    onChange={(e) =>
                      updateBozzaField('guida_turbina_temp_olio', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Livello olio
                  </label>
                  <input
                    type="text"
                    placeholder="Valore / Indicazione"
                    value={bozza.guida_turbina_livello_olio ?? ''}
                    onChange={(e) => updateBozzaField('guida_turbina_livello_olio', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino n. 1 (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.guida_turbina_temp_pattino_1 ?? ''}
                    onChange={(e) =>
                      updateBozzaField('guida_turbina_temp_pattino_1', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino n. 2 (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.guida_turbina_temp_pattino_2 ?? ''}
                    onChange={(e) =>
                      updateBozzaField('guida_turbina_temp_pattino_2', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categoria 3: Supporto alternatore */}
          {selectedCategory === 'alternatore' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Supporto Alternatore</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura olio supporto (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.alternatore_temp_olio ?? ''}
                    onChange={(e) =>
                      updateBozzaField('alternatore_temp_olio', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Livello olio
                  </label>
                  <input
                    type="text"
                    placeholder="Valore / Indicazione"
                    value={bozza.alternatore_livello_olio ?? ''}
                    onChange={(e) => updateBozzaField('alternatore_livello_olio', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino n. 1 (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.alternatore_temp_pattino_1 ?? ''}
                    onChange={(e) =>
                      updateBozzaField('alternatore_temp_pattino_1', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino n. 2 (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.alternatore_temp_pattino_2 ?? ''}
                    onChange={(e) =>
                      updateBozzaField('alternatore_temp_pattino_2', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categoria 4: Supporto combinato (MAI chimare pattino 1 e 2!) */}
          {selectedCategory === 'combinato' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Supporto Combinato</h3>
                <span className="text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  Pattino assiale e radiale
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura olio supporto (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.combinato_temp_olio ?? ''}
                    onChange={(e) =>
                      updateBozzaField('combinato_temp_olio', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Livello olio
                  </label>
                  <input
                    type="text"
                    placeholder="Valore / Indicazione"
                    value={bozza.combinato_livello_olio ?? ''}
                    onChange={(e) => updateBozzaField('combinato_livello_olio', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino assiale (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.combinato_temp_pattino_assiale ?? ''}
                    onChange={(e) =>
                      updateBozzaField('combinato_temp_pattino_assiale', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura pattino radiale (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.combinato_temp_pattino_radiale ?? ''}
                    onChange={(e) =>
                      updateBozzaField('combinato_temp_pattino_radiale', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Categoria 5: Colonnetta comando pale */}
          {selectedCategory === 'colonnetta_pale' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Colonnetta Comando Pale</h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Temperatura olio colonnetta comando pale (°C)
                </label>
                <div className="relative max-w-sm">
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.colonnetta_pale_temp_olio ?? ''}
                    onChange={(e) =>
                      updateBozzaField('colonnetta_pale_temp_olio', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    °C
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 6: SOD */}
          {selectedCategory === 'sod' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">SOD (Sistema Olio a Pressione)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Temperatura olio SOD (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="°C"
                    value={bozza.sod_temp_olio ?? ''}
                    onChange={(e) =>
                      updateBozzaField('sod_temp_olio', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Livello olio SOD
                  </label>
                  <input
                    type="text"
                    placeholder="Valore / Indicazione"
                    value={bozza.sod_livello_olio ?? ''}
                    onChange={(e) => updateBozzaField('sod_livello_olio', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Livello olio Accumulatore
                  </label>
                  <input
                    type="text"
                    placeholder="Valore / Indicazione"
                    value={bozza.sod_livello_accumulatore ?? ''}
                    onChange={(e) => updateBozzaField('sod_livello_accumulatore', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Pressione Olio accumulatore (bar)</span>
                    <span className="text-[10px] text-slate-400">ex "Pressione campana"</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      placeholder="bar"
                      value={bozza.sod_pressione_accumulatore_bar ?? ''}
                      onChange={(e) =>
                        updateBozzaField('sod_pressione_accumulatore_bar', e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      bar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 7: Pompa in servizio & Perdita olio */}
          {selectedCategory === 'pompa_servizio' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Pompa in Servizio</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Registra la pompa attualmente in marcia e l'eventuale perdita associata.
                </p>

                {/* Scelta Pompa 1 / Pompa 2 */}
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Seleziona la pompa in servizio:
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {(['Pompa 1', 'Pompa 2'] as const).map((p) => {
                    const isSelected = bozza.pompa_in_servizio === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateBozzaField('pompa_in_servizio', p)}
                        className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scelta Sì / No per Perdita Olio: PARTE SENZA SCELTA */}
              <div className="pt-3 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Perdita olio sulla pompa in servizio:
                  </span>
                  {bozza.pompa_perdita_olio === undefined || bozza.pompa_perdita_olio === null ? (
                    <span className="text-[11px] text-amber-300 font-normal italic">
                      (scelta obbligatoria dell'operatore)
                    </span>
                  ) : null}
                </label>

                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => updateBozzaField('pompa_perdita_olio', 'Sì')}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                      bozza.pompa_perdita_olio === 'Sì'
                        ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Sì (Presenza perdita)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBozzaField('pompa_perdita_olio', 'No')}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                      bozza.pompa_perdita_olio === 'No'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    No (Regolare)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 8: Perdite Servomotori: PARTE SENZA SCELTA */}
          {selectedCategory === 'perdite_servomotori' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Controllo Perdite Servomotori</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Verificare visivamente la presenza di trasudamenti o perdite d'olio sui servomotori del {selectedGruppo}.
                </p>

                <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Presenza perdite d'olio sui servomotori:</span>
                  {bozza.perdite_servomotori === undefined || bozza.perdite_servomotori === null ? (
                    <span className="text-[11px] text-amber-300 font-normal italic">
                      (selezionare esito del controllo)
                    </span>
                  ) : null}
                </label>

                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <button
                    type="button"
                    onClick={() => updateBozzaField('perdite_servomotori', 'Sì')}
                    className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all ${
                      bozza.perdite_servomotori === 'Sì'
                        ? 'bg-rose-600 border-rose-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Sì (Perdita presente)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBozzaField('perdite_servomotori', 'No')}
                    className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all ${
                      bozza.perdite_servomotori === 'No'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    No (Regolare / Nessuna)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 9: Drenaggio tenuta d'albero */}
          {(selectedCategory === 'drenaggio_tenuta_albero' || selectedCategory === 'tempo_pompa_drenaggio') && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span>9. Drenaggio tenuta d'albero</span>
                  <span className="text-xs font-normal text-sky-400">({selectedGruppo})</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Rileva i tempi di arresto e funzionamento (in secondi) per le 3 pompe di drenaggio tenuta d'albero del {selectedGruppo}.
                </p>
              </div>

              {/* Pompa 1 AC */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Pompa 1</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
                      AC
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Pompa alternata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Arresto
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 180"
                        value={bozza.drenaggio_p1_ac_arresto_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p1_ac_arresto_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Funzionamento
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 25"
                        value={bozza.drenaggio_p1_ac_funzionamento_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p1_ac_funzionamento_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pompa 2 AC */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Pompa 2</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
                      AC
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Pompa alternata</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Arresto
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 180"
                        value={bozza.drenaggio_p2_ac_arresto_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p2_ac_arresto_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Funzionamento
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 25"
                        value={bozza.drenaggio_p2_ac_funzionamento_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p2_ac_funzionamento_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pompa 3 DC */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Pompa 3</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                      DC
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Pompa continua / riserva</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Arresto
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 240"
                        value={bozza.drenaggio_p3_dc_arresto_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p3_dc_arresto_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tempo di Funzionamento
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 30"
                        value={bozza.drenaggio_p3_dc_funzionamento_s ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'drenaggio_p3_dc_funzionamento_s',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-10"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 10: Irrorazione tenuta */}
          {selectedCategory === 'irrorazione_tenuta' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span>10. Irrorazione tenuta</span>
                  <span className="text-xs font-normal text-sky-400">({selectedGruppo})</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Rileva la pressione (in bar) e la portata (in litri/minuto) del circuito di irrorazione della tenuta per il {selectedGruppo}.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pressione irrorazione tenuta */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Pressione irrorazione tenuta
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 4.5"
                        value={bozza.pressione_irrorazione_tenuta_bar ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'pressione_irrorazione_tenuta_bar',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-sky-400 font-bold">bar</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Unità di misura: bar</p>
                  </div>

                  {/* Portata irrorazione tenuta */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Portata irrorazione tenuta
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 12"
                        value={bozza.portata_irrorazione_tenuta_l_min ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'portata_irrorazione_tenuta_l_min',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-16"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-sky-400 font-bold">l/min</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Unità di misura: litri al minuto (l/min)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categoria 11: Delta pressione gruppo servovalvole */}
          {selectedCategory === 'delta_pressione_servovalvole' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <span>11. Delta pressione gruppo servovalvole</span>
                  <span className="text-xs font-normal text-sky-400">({selectedGruppo})</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Rileva la pressione di monte e la pressione di valle (in bar) del gruppo servovalvole per il {selectedGruppo}.
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pressione di monte */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Pressione di monte
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 120"
                        value={bozza.delta_p_monte_bar ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'delta_p_monte_bar',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-sky-400 font-bold">bar</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Unità di misura: bar</p>
                  </div>

                  {/* Pressione di valle */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Pressione di valle
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder="es. 115"
                        value={bozza.delta_p_valle_bar ?? ''}
                        onChange={(e) =>
                          updateBozzaField(
                            'delta_p_valle_bar',
                            e.target.value === '' ? null : parseFloat(e.target.value)
                          )
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-sky-400 font-bold">bar</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Unità di misura: bar</p>
                  </div>
                </div>

                {/* Calcolo automatico Delta P differenziale */}
                {bozza.delta_p_monte_bar !== undefined &&
                  bozza.delta_p_monte_bar !== null &&
                  bozza.delta_p_valle_bar !== undefined &&
                  bozza.delta_p_valle_bar !== null && (
                    <div className="bg-sky-950/60 border border-sky-800/70 rounded-xl p-3 flex items-center justify-between text-xs">
                      <span className="text-sky-300 font-medium">Differenziale calcolato (ΔP = Monte - Valle):</span>
                      <span className="text-white font-mono font-bold text-sm bg-slate-900 px-3 py-1 rounded-lg border border-sky-700">
                        {(bozza.delta_p_monte_bar - bozza.delta_p_valle_bar).toFixed(2)} bar
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIEPILOGO BOZZA ATTUALE & PULSANTE SALVATAGGIO */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">Dati in bozza per il salvataggio</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
              {countFilledFields()} campi inseriti
            </span>
          </div>
          {countFilledFields() > 0 && (
            <button
              type="button"
              onClick={handleClearBozza}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Svuota bozza</span>
            </button>
          )}
        </div>

        {/* Anteprima sintetica campi compilati nella bozza */}
        {countFilledFields() > 0 ? (
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
            {bozza.potenza_mw !== undefined && bozza.potenza_mw !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Potenza:</span>
                <span className="font-semibold text-sky-300">{bozza.potenza_mw} MW</span>
              </div>
            )}
            {bozza.guida_turbina_temp_olio !== undefined && bozza.guida_turbina_temp_olio !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Guida Turbina - T. Olio / Livello:</span>
                <span className="font-semibold text-slate-200">
                  {bozza.guida_turbina_temp_olio}°C {bozza.guida_turbina_livello_olio ? `(${bozza.guida_turbina_livello_olio})` : ''}
                </span>
              </div>
            )}
            {bozza.alternatore_temp_olio !== undefined && bozza.alternatore_temp_olio !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Alternatore - T. Olio / Livello:</span>
                <span className="font-semibold text-slate-200">
                  {bozza.alternatore_temp_olio}°C {bozza.alternatore_livello_olio ? `(${bozza.alternatore_livello_olio})` : ''}
                </span>
              </div>
            )}
            {bozza.combinato_temp_olio !== undefined && bozza.combinato_temp_olio !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Combinato - T. Olio:</span>
                <span className="font-semibold text-slate-200">{bozza.combinato_temp_olio}°C</span>
              </div>
            )}
            {bozza.combinato_temp_pattino_assiale !== undefined && bozza.combinato_temp_pattino_assiale !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Combinato - Pattino Assiale:</span>
                <span className="font-semibold text-slate-200">{bozza.combinato_temp_pattino_assiale}°C</span>
              </div>
            )}
            {bozza.combinato_temp_pattino_radiale !== undefined && bozza.combinato_temp_pattino_radiale !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Combinato - Pattino Radiale:</span>
                <span className="font-semibold text-slate-200">{bozza.combinato_temp_pattino_radiale}°C</span>
              </div>
            )}
            {bozza.colonnetta_pale_temp_olio !== undefined && bozza.colonnetta_pale_temp_olio !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Colonnetta pale - T. Olio:</span>
                <span className="font-semibold text-slate-200">{bozza.colonnetta_pale_temp_olio}°C</span>
              </div>
            )}
            {bozza.sod_temp_olio !== undefined && bozza.sod_temp_olio !== null && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">SOD - T. Olio / Pressione:</span>
                <span className="font-semibold text-slate-200">
                  {bozza.sod_temp_olio}°C {bozza.sod_pressione_accumulatore_bar ? `(${bozza.sod_pressione_accumulatore_bar} bar)` : ''}
                </span>
              </div>
            )}
            {bozza.pompa_in_servizio && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Pompa in servizio:</span>
                <span className="font-semibold text-slate-200">
                  {bozza.pompa_in_servizio} (Perdita: {bozza.pompa_perdita_olio || 'Non indicata'})
                </span>
              </div>
            )}
            {bozza.perdite_servomotori && (
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Perdite Servomotori:</span>
                <span className={`font-semibold ${bozza.perdite_servomotori === 'Sì' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {bozza.perdite_servomotori}
                </span>
              </div>
            )}
            {(bozza.drenaggio_p1_ac_arresto_s !== undefined ||
              bozza.drenaggio_p1_ac_funzionamento_s !== undefined ||
              bozza.drenaggio_p2_ac_arresto_s !== undefined ||
              bozza.drenaggio_p2_ac_funzionamento_s !== undefined ||
              bozza.drenaggio_p3_dc_arresto_s !== undefined ||
              bozza.drenaggio_p3_dc_funzionamento_s !== undefined) && (
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-1">
                <span className="text-slate-400">Drenaggio tenuta d'albero:</span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono text-sky-300">
                  {(bozza.drenaggio_p1_ac_arresto_s !== null || bozza.drenaggio_p1_ac_funzionamento_s !== null) && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      P1 AC: Arr. {bozza.drenaggio_p1_ac_arresto_s ?? '-'}s | Funz. {bozza.drenaggio_p1_ac_funzionamento_s ?? '-'}s
                    </span>
                  )}
                  {(bozza.drenaggio_p2_ac_arresto_s !== null || bozza.drenaggio_p2_ac_funzionamento_s !== null) && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      P2 AC: Arr. {bozza.drenaggio_p2_ac_arresto_s ?? '-'}s | Funz. {bozza.drenaggio_p2_ac_funzionamento_s ?? '-'}s
                    </span>
                  )}
                  {(bozza.drenaggio_p3_dc_arresto_s !== null || bozza.drenaggio_p3_dc_funzionamento_s !== null) && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      P3 DC: Arr. {bozza.drenaggio_p3_dc_arresto_s ?? '-'}s | Funz. {bozza.drenaggio_p3_dc_funzionamento_s ?? '-'}s
                    </span>
                  )}
                </div>
              </div>
            )}
            {bozza.tempo_pompa_1_drenaggio_tenuta_albero !== undefined && bozza.tempo_pompa_1_drenaggio_tenuta_albero !== null && bozza.tempo_pompa_1_drenaggio_tenuta_albero !== '' && (
              <div className="flex justify-between">
                <span className="text-slate-400">Tempo Pompa 1 (Storico):</span>
                <span className="font-semibold text-sky-300 font-mono">
                  {bozza.tempo_pompa_1_drenaggio_tenuta_albero}
                </span>
              </div>
            )}
            {((bozza.pressione_irrorazione_tenuta_bar !== undefined && bozza.pressione_irrorazione_tenuta_bar !== null) ||
              (bozza.portata_irrorazione_tenuta_l_min !== undefined && bozza.portata_irrorazione_tenuta_l_min !== null)) && (
              <div className="flex justify-between border-t border-slate-900 pt-1">
                <span className="text-slate-400">Irrorazione tenuta:</span>
                <span className="font-semibold text-sky-300 font-mono">
                  P: {bozza.pressione_irrorazione_tenuta_bar !== null && bozza.pressione_irrorazione_tenuta_bar !== undefined ? `${bozza.pressione_irrorazione_tenuta_bar} bar` : '-'}
                  {' • '}
                  Q: {bozza.portata_irrorazione_tenuta_l_min !== null && bozza.portata_irrorazione_tenuta_l_min !== undefined ? `${bozza.portata_irrorazione_tenuta_l_min} l/min` : '-'}
                </span>
              </div>
            )}
            {((bozza.delta_p_monte_bar !== undefined && bozza.delta_p_monte_bar !== null) ||
              (bozza.delta_p_valle_bar !== undefined && bozza.delta_p_valle_bar !== null)) && (
              <div className="flex justify-between border-t border-slate-900 pt-1">
                <span className="text-slate-400">Delta P servovalvole:</span>
                <span className="font-semibold text-sky-300 font-mono">
                  Monte: {bozza.delta_p_monte_bar !== null && bozza.delta_p_monte_bar !== undefined ? `${bozza.delta_p_monte_bar} bar` : '-'}
                  {' • '}
                  Valle: {bozza.delta_p_valle_bar !== null && bozza.delta_p_valle_bar !== undefined ? `${bozza.delta_p_valle_bar} bar` : '-'}
                  {bozza.delta_p_monte_bar !== null &&
                    bozza.delta_p_monte_bar !== undefined &&
                    bozza.delta_p_valle_bar !== null &&
                    bozza.delta_p_valle_bar !== undefined && (
                      <span className="text-emerald-400 ml-1">
                        (ΔP: {(bozza.delta_p_monte_bar - bozza.delta_p_valle_bar).toFixed(2)} bar)
                      </span>
                    )}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            I valori inseriti compariranno qui prima del salvataggio definitivo. Puoi cambiare categoria e inserire più dati nella stessa bozza.
          </p>
        )}

        {/* TASTONE SALVA NEL REGISTRO (Touch friendly) */}
        <button
          type="button"
          onClick={handleInitiateSave}
          disabled={countFilledFields() === 0}
          className={`w-full py-4 px-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            countFilledFields() > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
          }`}
        >
          <Save className="w-5 h-5" />
          <span>Salva nel Registro ({selectedGruppo})</span>
        </button>
      </div>

      {/* POPUP MODALE DI CONFERMA SALVATAGGIO (Da specifica rigorosa) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Vuoi salvare i dati del {selectedGruppo}?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Operatore responsabile:{' '}
                  <span className="font-semibold text-sky-300">{operatore}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Data e Ora:</span>
                <span className="font-mono">{data} alle {ora}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gruppo:</span>
                <span className="font-semibold text-white">{selectedGruppo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Regola di unione:</span>
                <span className="text-emerald-400">Unisce dati dello stesso giorno e operatore</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all"
              >
                Sì, Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
