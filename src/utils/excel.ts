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
  "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
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
  "tempo pompa 1 drenaggio tenuta d'albero": "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
  'tempo pompa 1 drenaggio tenuta albero': "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
  'tempo pompa drenaggio tenuta albero': "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
  'tempo pompa 1 drenaggio': "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
  'pompa 1 drenaggio tenuta albero': "Tempo Pompa 1 Drenaggio Tenuta d'Albero",
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
    "Tempo Pompa 1 Drenaggio Tenuta d'Albero": d.tempo_pompa_1_drenaggio_tenuta_albero ?? '',
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
