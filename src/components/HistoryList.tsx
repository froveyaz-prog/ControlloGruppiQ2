import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Square,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { Gruppo, RilevazioneRecord } from '../types';

interface HistoryListProps {
  records: RilevazioneRecord[];
  onDeleteRecords: (ids: string[]) => void;
  onSelectForEdit?: (record: RilevazioneRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  onDeleteRecords,
  onSelectForEdit,
}) => {
  const [filterGruppo, setFilterGruppo] = useState<'Tutti' | Gruppo>('Tutti');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Modal conferma cancellazione
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  // Filtra record
  const filteredRecords = records.filter((r) => {
    if (filterGruppo !== 'Tutti' && r.gruppo !== filterGruppo) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOp = (r.operatore || '').toLowerCase().includes(q);
      const matchData = (r.data || '').toLowerCase().includes(q);
      return matchOp || matchData;
    }
    return true;
  });

  const toggleSelectRecord = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setPendingDeleteIds(selectedIds);
    setShowDeleteModal(true);
  };

  const handleDeleteSingle = (id: string) => {
    setPendingDeleteIds([id]);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDeleteRecords(pendingDeleteIds);
    setSelectedIds((prev) => prev.filter((id) => !pendingDeleteIds.includes(id)));
    setPendingDeleteIds([]);
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra Filtri e Ricerca */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filtro Gruppo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Gruppo:
            </span>
            {(['Tutti', 'Gruppo 1', 'Gruppo 2'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGruppo(g)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                  filterGruppo === g
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Ricerca per operatore o data */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per data o operatore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Barra di Selezione Multipla */}
        {filteredRecords.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium"
            >
              {selectedIds.length === filteredRecords.length && filteredRecords.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-sky-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {selectedIds.length === filteredRecords.length && filteredRecords.length > 0
                  ? 'Deseleziona tutti'
                  : 'Seleziona tutti'}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-lg font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina {selectedIds.length} selezionati</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lista Record a Schede Mobile / Espandibile */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Nessuna registrazione trovata</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {records.length === 0
              ? 'Non ci sono ancora controlli salvati nella memoria locale. Inserisci una nuova rilevazione per iniziare.'
              : 'Nessun risultato corrisponde ai filtri di ricerca impostati.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((r) => {
            const isExpanded = !!expandedIds[r.id];
            const isSelected = selectedIds.includes(r.id);
            const d = r.dati || {};

            return (
              <div
                key={r.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-sm ${
                  isSelected
                    ? 'border-sky-500/80 bg-slate-900/95 ring-1 ring-sky-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Intestazione Scheda */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectRecord(r.id)}
                      className="text-slate-400 hover:text-sky-400 p-0.5"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-sky-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            r.gruppo === 'Gruppo 1'
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          {r.gruppo}
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          {r.data}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          alle {r.ora}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-semibold text-slate-200">{r.operatore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsante Espandi / Contrai */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(r.id)}
                      className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg font-medium transition-all"
                    >
                      <span>{isExpanded ? 'Chiudi' : 'Dettagli'}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(r.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all"
                      title="Elimina registrazione dall'app"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Valori Chiave in Sintesi */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Potenza</span>
                    <span className="font-bold font-mono text-sky-300">
                      {d.potenza_mw !== undefined && d.potenza_mw !== null ? `${d.potenza_mw} MW` : '-'}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Pompa in servizio</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {d.pompa_in_servizio || '-'}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Perdita Pompa</span>
                    <span
                      className={`font-semibold ${
                        d.pompa_perdita_olio === 'Sì'
                          ? 'text-rose-400'
                          : d.pompa_perdita_olio === 'No'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.pompa_perdita_olio || '-'}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Perdite Servomotori</span>
                    <span
                      className={`font-semibold ${
                        d.perdite_servomotori === 'Sì'
                          ? 'text-rose-400'
                          : d.perdite_servomotori === 'No'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.perdite_servomotori || '-'}
                    </span>
                  </div>
                </div>

                {/* Scheda Dettagli Espansa con tutti i valori */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                    {/* Supporto Guida Turbina */}
                    <div>
                      <h5 className="font-bold text-sky-400 mb-1">Supporto Guida Turbina</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>T. Olio: <span className="text-white font-mono">{d.guida_turbina_temp_olio ?? '-'}°C</span></div>
                        <div>Livello: <span className="text-white">{d.guida_turbina_livello_olio || '-'}</span></div>
                        <div>Pattino 1: <span className="text-white font-mono">{d.guida_turbina_temp_pattino_1 ?? '-'}°C</span></div>
                        <div>Pattino 2: <span className="text-white font-mono">{d.guida_turbina_temp_pattino_2 ?? '-'}°C</span></div>
                      </div>
                    </div>

                    {/* Supporto Alternatore */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1">Supporto Alternatore</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>T. Olio: <span className="text-white font-mono">{d.alternatore_temp_olio ?? '-'}°C</span></div>
                        <div>Livello: <span className="text-white">{d.alternatore_livello_olio || '-'}</span></div>
                        <div>Pattino 1: <span className="text-white font-mono">{d.alternatore_temp_pattino_1 ?? '-'}°C</span></div>
                        <div>Pattino 2: <span className="text-white font-mono">{d.alternatore_temp_pattino_2 ?? '-'}°C</span></div>
                      </div>
                    </div>

                    {/* Supporto Combinato */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-amber-400 mb-1">Supporto Combinato</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>T. Olio: <span className="text-white font-mono">{d.combinato_temp_olio ?? '-'}°C</span></div>
                        <div>Livello: <span className="text-white">{d.combinato_livello_olio || '-'}</span></div>
                        <div>Pattino Assiale: <span className="text-white font-mono">{d.combinato_temp_pattino_assiale ?? '-'}°C</span></div>
                        <div>Pattino Radiale: <span className="text-white font-mono">{d.combinato_temp_pattino_radiale ?? '-'}°C</span></div>
                      </div>
                    </div>

                    {/* Colonnetta Comando Pale & SOD */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1">Colonnetta Pale & SOD</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>T. Pale: <span className="text-white font-mono">{d.colonnetta_pale_temp_olio ?? '-'}°C</span></div>
                        <div>T. SOD: <span className="text-white font-mono">{d.sod_temp_olio ?? '-'}°C</span></div>
                        <div>Liv. SOD / Accum.: <span className="text-white">{d.sod_livello_olio || '-'} / {d.sod_livello_accumulatore || '-'}</span></div>
                        <div>Pressione Accum.: <span className="text-white font-mono">{d.sod_pressione_accumulatore_bar ?? '-'} bar</span></div>
                      </div>
                    </div>

                    {/* Pompa in Servizio & Perdite */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1">Pompa in Servizio & Perdite</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>Pompa in servizio: <span className="text-white font-semibold">{d.pompa_in_servizio || '-'}</span></div>
                        <div>Perdita pompa: <span className="text-white font-semibold">{d.pompa_perdita_olio || '-'}</span></div>
                        <div>Perdite servomotori: <span className="text-white font-semibold">{d.perdite_servomotori || '-'}</span></div>
                      </div>
                    </div>

                    {/* Drenaggio Tenuta d'Albero (3 Pompe: P1 AC, P2 AC, P3 DC) */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1 flex items-center gap-2">
                        <span>Drenaggio Tenuta d'Albero</span>
                        <span className="text-[10px] text-slate-400 font-normal">(secondi)</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="font-bold text-sky-300 block mb-0.5">Pompa 1 AC:</span>
                          <div>Arresto: <span className="text-white font-mono font-semibold">{d.drenaggio_p1_ac_arresto_s !== null && d.drenaggio_p1_ac_arresto_s !== undefined ? `${d.drenaggio_p1_ac_arresto_s} s` : '-'}</span></div>
                          <div>Funzionamento: <span className="text-white font-mono font-semibold">{d.drenaggio_p1_ac_funzionamento_s !== null && d.drenaggio_p1_ac_funzionamento_s !== undefined ? `${d.drenaggio_p1_ac_funzionamento_s} s` : '-'}</span></div>
                        </div>

                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="font-bold text-sky-300 block mb-0.5">Pompa 2 AC:</span>
                          <div>Arresto: <span className="text-white font-mono font-semibold">{d.drenaggio_p2_ac_arresto_s !== null && d.drenaggio_p2_ac_arresto_s !== undefined ? `${d.drenaggio_p2_ac_arresto_s} s` : '-'}</span></div>
                          <div>Funzionamento: <span className="text-white font-mono font-semibold">{d.drenaggio_p2_ac_funzionamento_s !== null && d.drenaggio_p2_ac_funzionamento_s !== undefined ? `${d.drenaggio_p2_ac_funzionamento_s} s` : '-'}</span></div>
                        </div>

                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="font-bold text-amber-300 block mb-0.5">Pompa 3 DC:</span>
                          <div>Arresto: <span className="text-white font-mono font-semibold">{d.drenaggio_p3_dc_arresto_s !== null && d.drenaggio_p3_dc_arresto_s !== undefined ? `${d.drenaggio_p3_dc_arresto_s} s` : '-'}</span></div>
                          <div>Funzionamento: <span className="text-white font-mono font-semibold">{d.drenaggio_p3_dc_funzionamento_s !== null && d.drenaggio_p3_dc_funzionamento_s !== undefined ? `${d.drenaggio_p3_dc_funzionamento_s} s` : '-'}</span></div>
                        </div>
                      </div>
                      {d.tempo_pompa_1_drenaggio_tenuta_albero && (
                        <div className="mt-1 text-[11px] text-slate-400">
                          Tempo P1 storico registrato: <span className="text-slate-200 font-mono">{d.tempo_pompa_1_drenaggio_tenuta_albero}</span>
                        </div>
                      )}
                    </div>

                    {/* 10. Irrorazione Tenuta */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1 flex items-center gap-2">
                        <span>10. Irrorazione Tenuta</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Pressione irrorazione:</span>
                          <span className="text-white font-mono font-semibold">
                            {d.pressione_irrorazione_tenuta_bar !== null && d.pressione_irrorazione_tenuta_bar !== undefined
                              ? `${d.pressione_irrorazione_tenuta_bar} bar`
                              : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Portata irrorazione:</span>
                          <span className="text-white font-mono font-semibold">
                            {d.portata_irrorazione_tenuta_l_min !== null && d.portata_irrorazione_tenuta_l_min !== undefined
                              ? `${d.portata_irrorazione_tenuta_l_min} l/min`
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 11. Delta Pressione Gruppo Servovalvole */}
                    <div className="border-t border-slate-900 pt-2">
                      <h5 className="font-bold text-sky-400 mb-1 flex items-center justify-between">
                        <span>11. Delta Pressione Gruppo Servovalvole</span>
                        {d.delta_p_monte_bar !== null &&
                          d.delta_p_monte_bar !== undefined &&
                          d.delta_p_valle_bar !== null &&
                          d.delta_p_valle_bar !== undefined && (
                            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-emerald-800">
                              ΔP: {(d.delta_p_monte_bar - d.delta_p_valle_bar).toFixed(2)} bar
                            </span>
                          )}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Pressione di monte:</span>
                          <span className="text-white font-mono font-semibold">
                            {d.delta_p_monte_bar !== null && d.delta_p_monte_bar !== undefined
                              ? `${d.delta_p_monte_bar} bar`
                              : '-'}
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Pressione di valle:</span>
                          <span className="text-white font-mono font-semibold">
                            {d.delta_p_valle_bar !== null && d.delta_p_valle_bar !== undefined
                              ? `${d.delta_p_valle_bar} bar`
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODALE DI ELIMINAZIONE CON AVVISO DA SPECIFICA RIGOROSA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Confermi l'eliminazione?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Stai per eliminare {pendingDeleteIds.length} {pendingDeleteIds.length === 1 ? 'registrazione' : 'registrazioni'} dall'archivio dell'applicazione.
                </p>
              </div>
            </div>

            {/* AVVISO ESPLICITO PRESCRITTO DALLE SPECIFICHE:
                "L'eliminazione nell'app NON deve eliminare dati già presenti in Excel. Il messaggio deve chiarire che i dati non ancora esportati possono invece andare persi." */}
            <div className="bg-amber-950/70 border border-amber-800/80 rounded-xl p-3.5 text-xs text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Nota importante su Excel:
              </p>
              <p>
                • Questa operazione <strong>NON elimina</strong> le righe già salvate o archiviate nel file Excel.
              </p>
              <p>
                • Attenzione: eventuali dati locali eliminati che non sono ancora stati esportati su Excel <strong>andranno persi definitivamente</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/40 transition-all"
              >
                Sì, Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
