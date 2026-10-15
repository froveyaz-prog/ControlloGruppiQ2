import * as XLSX from 'xlsx';
import { RilevazioneRecord, Gruppo } from '../types';
import { saveExcelLinkToIDB, loadExcelLinkFromIDB } from './storage';

/**
 * Intestazioni canoniche per ciascun foglio Gruppo 1 e Gruppo 2
 */
export const EXCEL_COLUMNS = [
  'Data',
  'Ora',
  'Operatore',
  'Potenza (MW)',
  'T. Olio Guida Turbina (°C)',
  'Liv. Olio Guida Turbina',
  'T. Pattino 1 Guida (°C)',
  'T. Pattino 2 Guida (°C)',
  'T. Olio Alternatore (°C)',
  'Liv. Olio Alternatore',
  'T. Pattino 1 Alt. (°C)',
  'T. Pattino 2 Alt. (°C)',
  'T. Olio Combinato (°C)',
  'Liv. Olio Combinato',
  'T. Pattino Assiale (°C)',
  'T. Pattino Radiale (°C)',
  'T. Olio Colonnetta Pale (°C)',
  'T. Olio SOD (°C)',
  'Liv. Olio SOD',
  'Liv. Olio Accumulatore',
  'Pressione Olio Accumulatore (bar)',
  'Pompa in Servizio',
  'Perdita Olio Pompa',
  'Perdite Servomotori',
  'Pompa 1 AC Tempo Arresto (s)',
  'Pompa 1 AC Tempo Funzionamento (s)',
  'Pompa 2 AC Tempo Arresto (s)',
  'Pompa 2 AC Tempo Funzionamento (s)',
  'Pompa 3 DC Tempo Arresto (s)',
  'Pompa 3 DC Tempo Funzionamento (s)',
  'Pressione Irrorazione Tenuta (bar)',
  'Portata Irrorazione Tenuta (l/min)',
  'Pressione Monte Servovalvole (bar)',
  'Pressione Valle Servovalvole (bar)',
  'Delta P Servovalvole (bar)',
  'Note',
];

/**
 * Mappatura sinonimi e vecchie intestazioni per retrocompatibilità
 */
const HEADER_ALIASES: Record<string, string> = {
  'pressione olio campana': 'Pressione Olio Accumulatore (bar)',
  'pressione olio accumulatore': 'Pressione Olio Accumulatore (bar)',
  'pressione olio accumulatore (bar)': 'Pressione Olio Accumulatore (bar)',
  't. pattino 1 combinato': 'T. Pattino Assiale (°C)',
  't. pattino 1 combinato (°c)': 'T. Pattino Assiale (°C)',
  'pattino 1 combinato': 'T. Pattino Assiale (°C)',
  't. pattino 2 combinato': 'T. Pattino Radiale (°C)',
  't. pattino 2 combinato (°c)': 'T. Pattino Radiale (°C)',
  'pattino 2 combinato': 'T. Pattino Radiale (°C)',
  'potenza': 'Potenza (MW)',
  'potenza (mw)': 'Potenza (MW)',
  'potenza mw': 'Potenza (MW)',
  'pompa': 'Pompa in Servizio',
  'perdita pompa': 'Perdita Olio Pompa',
  'perdite servomotore': 'Perdite Servomotori',
  'perdite servomotori': 'Perdite Servomotori',
  // Retrocompatibilità vecchia colonna singola drenaggio
  "tempo pompa 1 drenaggio tenuta d'albero": 'Pompa 1 AC Tempo Funzionamento (s)',
  'tempo pompa 1 drenaggio tenuta albero': 'Pompa 1 AC Tempo Funzionamento (s)',
  'tempo pompa drenaggio tenuta albero': 'Pompa 1 AC Tempo Funzionamento (s)',
  'tempo pompa 1 drenaggio': 'Pompa 1 AC Tempo Funzionamento (s)',
  'pompa 1 drenaggio tenuta albero': 'Pompa 1 AC Tempo Funzionamento (s)',
  // Sinonimi 3 pompe drenaggio
  'pompa 1 ac arresto': 'Pompa 1 AC Tempo Arresto (s)',
  'pompa 1 ac funzionamento': 'Pompa 1 AC Tempo Funzionamento (s)',
  'pompa 2 ac arresto': 'Pompa 2 AC Tempo Arresto (s)',
  'pompa 2 ac funzionamento': 'Pompa 2 AC Tempo Funzionamento (s)',
  'pompa 3 dc arresto': 'Pompa 3 DC Tempo Arresto (s)',
  'pompa 3 dc funzionamento': 'Pompa 3 DC Tempo Funzionamento (s)',
  // Sinonimi irrorazione tenuta
  'pressione irrorazione tenuta': 'Pressione Irrorazione Tenuta (bar)',
  'pressione irrorazione': 'Pressione Irrorazione Tenuta (bar)',
  'pressione irrorazione tenuta (bar)': 'Pressione Irrorazione Tenuta (bar)',
  'pressione irrorazione (bar)': 'Pressione Irrorazione Tenuta (bar)',
  'portata irrorazione tenuta': 'Portata Irrorazione Tenuta (l/min)',
  'portata irrorazione': 'Portata Irrorazione Tenuta (l/min)',
  'portata irrorazione tenuta (l/min)': 'Portata Irrorazione Tenuta (l/min)',
  'portata irrorazione (l/min)': 'Portata Irrorazione Tenuta (l/min)',
  'portata irrorazione tenuta (l/m)': 'Portata Irrorazione Tenuta (l/min)',
  // Sinonimi delta pressione servovalvole
  'pressione monte': 'Pressione Monte Servovalvole (bar)',
  'pressione di monte': 'Pressione Monte Servovalvole (bar)',
  'pressione monte servovalvole': 'Pressione Monte Servovalvole (bar)',
  'pressione monte servovalvole (bar)': 'Pressione Monte Servovalvole (bar)',
  'pressione monte (bar)': 'Pressione Monte Servovalvole (bar)',
  'pressione valle': 'Pressione Valle Servovalvole (bar)',
  'pressione di valle': 'Pressione Valle Servovalvole (bar)',
  'pressione valle servovalvole': 'Pressione Valle Servovalvole (bar)',
  'pressione valle servovalvole (bar)': 'Pressione Valle Servovalvole (bar)',
  'pressione valle (bar)': 'Pressione Valle Servovalvole (bar)',
  'delta p': 'Delta P Servovalvole (bar)',
  'delta p servovalvole': 'Delta P Servovalvole (bar)',
  'delta p servovalvole (bar)': 'Delta P Servovalvole (bar)',
  'delta pressione': 'Delta P Servovalvole (bar)',
  'delta pressione servovalvole': 'Delta P Servovalvole (bar)',
};

export function normalizeHeader(h: string): string {
  const clean = h.trim().toLowerCase();
  if (HEADER_ALIASES[clean]) {
    return HEADER_ALIASES[clean];
  }
  // Cerca corrispondenza esatta case-insensitive nelle colonne standard
  const matched = EXCEL_COLUMNS.find((col) => col.toLowerCase() === clean);
  return matched || h.trim();
}

/**
 * Converte un record dell'app in una riga conforme a EXCEL_COLUMNS
 */
export function recordToExcelRow(r: RilevazioneRecord): Record<string, any> {
  const d = r.dati || {};
  return {
    'Data': r.data,
    'Ora': r.ora,
    'Operatore': r.operatore || '',
    'Potenza (MW)': d.potenza_mw ?? '',
    'T. Olio Guida Turbina (°C)': d.guida_turbina_temp_olio ?? '',
    'Liv. Olio Guida Turbina': d.guida_turbina_livello_olio ?? '',
    'T. Pattino 1 Guida (°C)': d.guida_turbina_temp_pattino_1 ?? '',
    'T. Pattino 2 Guida (°C)': d.guida_turbina_temp_pattino_2 ?? '',
    'T. Olio Alternatore (°C)': d.alternatore_temp_olio ?? '',
    'Liv. Olio Alternatore': d.alternatore_livello_olio ?? '',
    'T. Pattino 1 Alt. (°C)': d.alternatore_temp_pattino_1 ?? '',
    'T. Pattino 2 Alt. (°C)': d.alternatore_temp_pattino_2 ?? '',
    'T. Olio Combinato (°C)': d.combinato_temp_olio ?? '',
    'Liv. Olio Combinato': d.combinato_livello_olio ?? '',
    'T. Pattino Assiale (°C)': d.combinato_temp_pattino_assiale ?? '',
    'T. Pattino Radiale (°C)': d.combinato_temp_pattino_radiale ?? '',
    'T. Olio Colonnetta Pale (°C)': d.colonnetta_pale_temp_olio ?? '',
    'T. Olio SOD (°C)': d.sod_temp_olio ?? '',
    'Liv. Olio SOD': d.sod_livello_olio ?? '',
    'Liv. Olio Accumulatore': d.sod_livello_accumulatore ?? '',
    'Pressione Olio Accumulatore (bar)': d.sod_pressione_accumulatore_bar ?? '',
    'Pompa in Servizio': d.pompa_in_servizio ?? '',
    'Perdita Olio Pompa': d.pompa_perdita_olio ?? '',
    'Perdite Servomotori': d.perdite_servomotori ?? '',
    'Pompa 1 AC Tempo Arresto (s)': d.drenaggio_p1_ac_arresto_s ?? '',
    'Pompa 1 AC Tempo Funzionamento (s)':
      d.drenaggio_p1_ac_funzionamento_s ?? d.tempo_pompa_1_drenaggio_tenuta_albero ?? '',
    'Pompa 2 AC Tempo Arresto (s)': d.drenaggio_p2_ac_arresto_s ?? '',
    'Pompa 2 AC Tempo Funzionamento (s)': d.drenaggio_p2_ac_funzionamento_s ?? '',
    'Pompa 3 DC Tempo Arresto (s)': d.drenaggio_p3_dc_arresto_s ?? '',
    'Pompa 3 DC Tempo Funzionamento (s)': d.drenaggio_p3_dc_funzionamento_s ?? '',
    'Pressione Irrorazione Tenuta (bar)': d.pressione_irrorazione_tenuta_bar ?? '',
    'Portata Irrorazione Tenuta (l/min)': d.portata_irrorazione_tenuta_l_min ?? '',
    'Pressione Monte Servovalvole (bar)': d.delta_p_monte_bar ?? '',
    'Pressione Valle Servovalvole (bar)': d.delta_p_valle_bar ?? '',
    'Delta P Servovalvole (bar)':
      d.delta_p_monte_bar !== null &&
      d.delta_p_monte_bar !== undefined &&
      d.delta_p_valle_bar !== null &&
      d.delta_p_valle_bar !== undefined
        ? Number((d.delta_p_monte_bar - d.delta_p_valle_bar).toFixed(2))
        : '',
    'Note': d.note ?? '',
  };
}

/**
 * Converte una riga Excel letta in dati normalizzati
 */
function parseExcelRow(rawRow: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, val] of Object.entries(rawRow)) {
    const normKey = normalizeHeader(key);
    normalized[normKey] = val !== undefined && val !== null ? val : '';
  }
  return normalized;
}

/**
 * Fonde righe esistenti in un foglio con i nuovi record da esportare
 * Regola:
 * - Le righe precedenti dell'Excel NON vengono mai eliminate (archivio cumulativo).
 * - Per stessa combinazione Data + Operatore, i nuovi valori sovrascrivono/aggiornano i campi compilati
 *   mentre i campi non toccati restano conservati.
 * - Operatori diversi restano su righe distinte.
 */
export function mergeSheetData(
  existingRows: Record<string, any>[],
  recordsPerGruppo: RilevazioneRecord[]
): Record<string, any>[] {
  const mergedRows = existingRows.map((r) => parseExcelRow(r));

  for (const rec of recordsPerGruppo) {
    const newRow = recordToExcelRow(rec);
    const opNorm = (rec.operatore || '').trim().toLowerCase();
    const dataNorm = (rec.data || '').trim();

    const matchIndex = mergedRows.findIndex((row) => {
      const rData = String(row['Data'] || '').trim();
      const rOp = String(row['Operatore'] || '').trim().toLowerCase();
      return rData === dataNorm && (rOp === opNorm || (!rOp && !opNorm));
    });

    if (matchIndex >= 0) {
      // Aggiorna la riga esistente preservando i valori non toccati
      const existing = mergedRows[matchIndex];
      for (const col of EXCEL_COLUMNS) {
        const newVal = newRow[col];
        if (newVal !== '' && newVal !== undefined && newVal !== null) {
          existing[col] = newVal;
        }
      }
      mergedRows[matchIndex] = existing;
    } else {
      // Aggiunge la nuova riga
      mergedRows.push(newRow);
    }
  }

  // Ordina le righe per Data crescente o decrescente (standard: decrescente per praticità)
  mergedRows.sort((a, b) => {
    const da = String(a['Data'] || '');
    const db = String(b['Data'] || '');
    return da.localeCompare(db);
  });

  return mergedRows;
}

/**
 * Genera un nuovo workbook con i due fogli "Gruppo 1" e "Gruppo 2"
 */
export function createWorkbookFromRecords(
  records: RilevazioneRecord[],
  existingWorkbook?: XLSX.WorkBook
): XLSX.WorkBook {
  const wb = existingWorkbook || XLSX.utils.book_new();

  const g1Records = records.filter((r) => r.gruppo === 'Gruppo 1');
  const g2Records = records.filter((r) => r.gruppo === 'Gruppo 2');

  const sheetsToProcess: { name: Gruppo; records: RilevazioneRecord[] }[] = [
    { name: 'Gruppo 1', records: g1Records },
    { name: 'Gruppo 2', records: g2Records },
  ];

  for (const item of sheetsToProcess) {
    let existingRows: Record<string, any>[] = [];
    if (wb.SheetNames.includes(item.name)) {
      const ws = wb.Sheets[item.name];
      existingRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    } else if (wb.SheetNames.includes('Storico') && item.name === 'Gruppo 1') {
      // Retrocompatibilità vecchio foglio unico 'Storico'
      const ws = wb.Sheets['Storico'];
      existingRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    }

    const merged = mergeSheetData(existingRows, item.records);

    // Se non ci sono righe, crea almeno una riga con intestazioni
    const finalRows = merged.length > 0 ? merged : [Object.fromEntries(EXCEL_COLUMNS.map((c) => [c, '']))];
    const newWs = XLSX.utils.json_to_sheet(finalRows, { header: EXCEL_COLUMNS });

    // Imposta larghezza colonne per leggibilità su Excel
    newWs['!cols'] = EXCEL_COLUMNS.map((col) => ({
      wch: Math.max(col.length + 3, 12),
    }));

    if (wb.SheetNames.includes(item.name)) {
      wb.Sheets[item.name] = newWs;
    } else {
      XLSX.utils.book_append_sheet(wb, newWs, item.name);
    }
  }

  return wb;
}

/**
 * Salva il file Excel tramite File System Access API o download diretto
 */
export async function saveOrUpdateExcel(
  records: RilevazioneRecord[],
  fileHandle?: any
): Promise<{ success: boolean; method: 'handle' | 'download'; message: string; handle?: any }> {
  try {
    let targetHandle = fileHandle;

    // Se non è stato passato un handle, tenta di recuperarlo da IndexedDB
    if (!targetHandle) {
      targetHandle = await loadExcelLinkFromIDB();
    }

    // Se supportato File System Access API
    if (targetHandle && typeof targetHandle.createWritable === 'function') {
      // Verifica o richiede permessi
      let perm = await targetHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') {
        perm = await targetHandle.requestPermission({ mode: 'readwrite' });
      }

      if (perm === 'granted') {
        const file = await targetHandle.getFile();
        const arrayBuf = await file.arrayBuffer();
        let existingWb: XLSX.WorkBook | undefined;
        try {
          existingWb = XLSX.read(arrayBuf, { type: 'array' });
        } catch {
          // Se il file era vuoto o appena creato
        }

        const wb = createWorkbookFromRecords(records, existingWb);
        const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        const writable = await targetHandle.createWritable();
        await writable.write(wbOut);
        await writable.close();

        await saveExcelLinkToIDB(targetHandle);
        return {
          success: true,
          method: 'handle',
          message: `File Excel aggiornato con successo: ${file.name}`,
          handle: targetHandle,
        };
      }
    }

    // Fallback: Genera il workbook ed esegue il download
    const wb = createWorkbookFromRecords(records);
    const fileName = `Controlli_Quincinetto2_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return {
      success: true,
      method: 'download',
      message: `File scaricato: ${fileName} (seleziona "Collega file Excel" per aggiornamento diretto su PC)`,
    };
  } catch (err: any) {
    console.error('Errore durante il salvataggio Excel:', err);
    return {
      success: false,
      method: 'download',
      message: `Errore: ${err.message || 'Impossibile aggiornare il file Excel'}`,
    };
  }
}

/**
 * Converte righe lette da un foglio Excel in record per l'app
 */
export function excelRowsToRecords(
  rows: Record<string, any>[],
  gruppo: Gruppo
): RilevazioneRecord[] {
  const records: RilevazioneRecord[] = [];

  for (const rawRow of rows) {
    const row = parseExcelRow(rawRow);
    const data = String(row['Data'] || '').trim();
    if (!data) continue; // ignora righe vuote

    const ora = String(row['Ora'] || '').trim() || '08:00';
    const operatore = String(row['Operatore'] || '').trim();
    const id = `imp_${gruppo.replace(/\s+/g, '')}_${data}_${ora}_${Math.random().toString(36).substring(2, 6)}`;

    const numOrNull = (val: any) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = parseFloat(String(val).replace(',', '.'));
      return isNaN(parsed) ? null : parsed;
    };

    const strOrNull = (val: any) => {
      if (val === undefined || val === null || val === '') return null;
      return String(val).trim();
    };

    records.push({
      id,
      gruppo,
      data,
      ora,
      operatore,
      timestamp: Date.now(),
      updatedAt: Date.now(),
      dati: {
        potenza_mw: numOrNull(row['Potenza (MW)']),
        guida_turbina_temp_olio: numOrNull(row['T. Olio Guida Turbina (°C)']),
        guida_turbina_livello_olio: strOrNull(row['Liv. Olio Guida Turbina']),
        guida_turbina_temp_pattino_1: numOrNull(row['T. Pattino 1 Guida (°C)']),
        guida_turbina_temp_pattino_2: numOrNull(row['T. Pattino 2 Guida (°C)']),
        alternatore_temp_olio: numOrNull(row['T. Olio Alternatore (°C)']),
        alternatore_livello_olio: strOrNull(row['Liv. Olio Alternatore']),
        alternatore_temp_pattino_1: numOrNull(row['T. Pattino 1 Alt. (°C)']),
        alternatore_temp_pattino_2: numOrNull(row['T. Pattino 2 Alt. (°C)']),
        combinato_temp_olio: numOrNull(row['T. Olio Combinato (°C)']),
        combinato_livello_olio: strOrNull(row['Liv. Olio Combinato']),
        combinato_temp_pattino_assiale: numOrNull(row['T. Pattino Assiale (°C)']),
        combinato_temp_pattino_radiale: numOrNull(row['T. Pattino Radiale (°C)']),
        colonnetta_pale_temp_olio: numOrNull(row['T. Olio Colonnetta Pale (°C)']),
        sod_temp_olio: numOrNull(row['T. Olio SOD (°C)']),
        sod_livello_olio: strOrNull(row['Liv. Olio SOD']),
        sod_livello_accumulatore: strOrNull(row['Liv. Olio Accumulatore']),
        pompa_in_servizio:
          row['Pompa in Servizio'] === 'Pompa 1'
            ? 'Pompa 1'
            : row['Pompa in Servizio'] === 'Pompa 2'
            ? 'Pompa 2'
            : null,
        pompa_perdita_olio:
          row['Perdita Olio Pompa'] === 'Sì'
            ? 'Sì'
            : row['Perdita Olio Pompa'] === 'No'
            ? 'No'
            : null,
        perdite_servomotori:
          row['Perdite Servomotori'] === 'Sì'
            ? 'Sì'
            : row['Perdite Servomotori'] === 'No'
            ? 'No'
            : null,
        drenaggio_p1_ac_arresto_s: numOrNull(row['Pompa 1 AC Tempo Arresto (s)']),
        drenaggio_p1_ac_funzionamento_s:
          numOrNull(row['Pompa 1 AC Tempo Funzionamento (s)']) ??
          numOrNull(row["Tempo Pompa 1 Drenaggio Tenuta d'Albero"]),
        drenaggio_p2_ac_arresto_s: numOrNull(row['Pompa 2 AC Tempo Arresto (s)']),
        drenaggio_p2_ac_funzionamento_s: numOrNull(row['Pompa 2 AC Tempo Funzionamento (s)']),
        drenaggio_p3_dc_arresto_s: numOrNull(row['Pompa 3 DC Tempo Arresto (s)']),
        drenaggio_p3_dc_funzionamento_s: numOrNull(row['Pompa 3 DC Tempo Funzionamento (s)']),
        tempo_pompa_1_drenaggio_tenuta_albero: strOrNull(row["Tempo Pompa 1 Drenaggio Tenuta d'Albero"]),
        pressione_irrorazione_tenuta_bar: numOrNull(row['Pressione Irrorazione Tenuta (bar)']),
        portata_irrorazione_tenuta_l_min: numOrNull(row['Portata Irrorazione Tenuta (l/min)']),
        delta_p_monte_bar: numOrNull(row['Pressione Monte Servovalvole (bar)']),
        delta_p_valle_bar: numOrNull(row['Pressione Valle Servovalvole (bar)']),
        note: strOrNull(row['Note']) || undefined,
      },
    });
  }

  return records;
}

/**
 * Legge un file Excel esistente dallo smartphone/PC, fonde tutte le righe storiche con i nuovi record,
 * e scarica il file Excel aggiornato senza perdere nessuna riga passata.
 */
export async function mergeAndDownloadExcelFile(
  file: File,
  currentRecords: RilevazioneRecord[]
): Promise<{
  success: boolean;
  message: string;
  totalRows: number;
  mergedRecords: RilevazioneRecord[];
}> {
  try {
    const buffer = await file.arrayBuffer();
    const existingWb = XLSX.read(buffer, { type: 'array' });

    // Estrae i record storici dal file esistente
    const importedFromExcel: RilevazioneRecord[] = [];

    const sheets: { name: Gruppo; legacyName?: string }[] = [
      { name: 'Gruppo 1', legacyName: 'Storico' },
      { name: 'Gruppo 2' },
    ];

    for (const s of sheets) {
      let rawRows: Record<string, any>[] = [];
      if (existingWb.SheetNames.includes(s.name)) {
        const ws = existingWb.Sheets[s.name];
        rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      } else if (s.legacyName && existingWb.SheetNames.includes(s.legacyName)) {
        const ws = existingWb.Sheets[s.legacyName];
        rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      }

      if (rawRows.length > 0) {
        const parsed = excelRowsToRecords(rawRows, s.name);
        importedFromExcel.push(...parsed);
      }
    }

    // Fonde con i record correnti dell'app
    // Le nuove rilevazioni aggiornano/completano quelle con stessa data e gruppo
    const combinedRecords = [...importedFromExcel];
    for (const cur of currentRecords) {
      const idx = combinedRecords.findIndex(
        (r) =>
          r.gruppo === cur.gruppo &&
          r.data === cur.data &&
          (r.operatore || '').trim().toLowerCase() === (cur.operatore || '').trim().toLowerCase()
      );
      if (idx >= 0) {
        // Unisci i dati preservando i valori storici preesistenti
        combinedRecords[idx] = {
          ...combinedRecords[idx],
          ora: cur.ora || combinedRecords[idx].ora,
          dati: {
            ...combinedRecords[idx].dati,
            ...Object.fromEntries(
              Object.entries(cur.dati || {}).filter(([_, v]) => v !== null && v !== undefined && v !== '')
            ),
          },
        };
      } else {
        combinedRecords.push(cur);
      }
    }

    // Genera il workbook aggiornato partendo dal file esistente
    const updatedWb = createWorkbookFromRecords(combinedRecords, existingWb);

    // Scarica direttamente il file aggiornato con nome chiaro
    const baseName = file.name.replace(/\.xlsx$/i, '');
    const outFileName = `${baseName}_aggiornato.xlsx`;
    XLSX.writeFile(updatedWb, outFileName);

    return {
      success: true,
      message: `File Excel aggiornato con successo! Conservate tutte le ${importedFromExcel.length} righe storiche precedenti + integrate le nuove rilevazioni (${combinedRecords.length} totali nel file scaricato).`,
      totalRows: combinedRecords.length,
      mergedRecords: combinedRecords,
    };
  } catch (err: any) {
    console.error('Errore durante la fusione Excel:', err);
    return {
      success: false,
      message: `Impossibile aggiornare il file Excel: ${err.message || 'Errore di lettura'}`,
      totalRows: 0,
      mergedRecords: currentRecords,
    };
  }
}
