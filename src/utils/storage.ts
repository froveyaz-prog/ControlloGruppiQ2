import { RilevazioneRecord, RilevazioneDati, Gruppo } from '../types';

export const LOCAL_STORAGE_KEY = 'rilevazioni-supporti-v2';
export const OPERATORS_HISTORY_KEY = 'quincinetto-operatori-recenti';
export const IDB_NAME = 'quincinetto-excel-link';
export const IDB_STORE = 'settings';
export const IDB_KEY_WORKBOOK = 'workbook';

/**
 * Normalizza il nome dell'operatore per il confronto (rimuove spazi multipli ed è case-insensitive per l'id)
 */
export function normalizeOperator(op: string): string {
  return op.trim();
}

/**
 * Genera una chiave identificativa univoca per la combinazione gruppo + data + operatore
 */
export function getRecordCompositeKey(gruppo: Gruppo, data: string, operatore: string): string {
  return `${gruppo}_${data}_${normalizeOperator(operatore).toLowerCase()}`;
}

/**
 * Carica tutte le rilevazioni salvate in localStorage
 */
export function loadRilevazioni(): RilevazioneRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Errore nel caricamento delle rilevazioni da localStorage:', err);
    return [];
  }
}

/**
 * Salva tutte le rilevazioni in localStorage
 */
export function saveRilevazioni(records: RilevazioneRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Errore nel salvataggio delle rilevazioni in localStorage:', err);
    throw new Error('Impossibile salvare i dati localmente nel browser. Memoria piena o permessi negati.');
  }
}

/**
 * Salva o aggiorna una rilevazione fondendola secondo la regola:
 * - Stesso gruppo, stesso giorno (data) e stesso operatore vengono uniti!
 * - Conserva i dati delle categorie già registrate in precedenza.
 * - Operatori diversi per lo stesso gruppo e giorno rimangono record distinti.
 */
export function upsertRilevazione(
  gruppo: Gruppo,
  data: string,
  ora: string,
  operatore: string,
  nuoviDati: Partial<RilevazioneDati>
): { records: RilevazioneRecord[]; updatedRecord: RilevazioneRecord; isUpdate: boolean } {
  const records = loadRilevazioni();
  const operatoreClean = normalizeOperator(operatore);
  const targetKey = getRecordCompositeKey(gruppo, data, operatoreClean);

  const existingIndex = records.findIndex(
    (r) => getRecordCompositeKey(r.gruppo, r.data, r.operatore) === targetKey
  );

  const now = Date.now();
  let updatedRecord: RilevazioneRecord;
  let isUpdate = false;

  if (existingIndex >= 0) {
    // Unione: sovrascrive solo i campi compilati, preservando i campi delle altre categorie!
    isUpdate = true;
    const existing = records[existingIndex];
    const mergedDati: RilevazioneDati = { ...existing.dati };

    // Fonde solo i campi definiti e non undefined
    for (const [key, val] of Object.entries(nuoviDati)) {
      if (val !== undefined) {
        // @ts-ignore
        mergedDati[key] = val;
      }
    }

    updatedRecord = {
      ...existing,
      ora, // aggiorna con l'ora dell'ultima rilevazione
      dati: mergedDati,
      updatedAt: now,
    };
    records[existingIndex] = updatedRecord;
  } else {
    // Nuovo record
    const id = `rec_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const mergedDati: RilevazioneDati = {};
    for (const [key, val] of Object.entries(nuoviDati)) {
      if (val !== undefined) {
        // @ts-ignore
        mergedDati[key] = val;
      }
    }

    updatedRecord = {
      id,
      gruppo,
      data,
      ora,
      timestamp: now,
      operatore: operatoreClean,
      dati: mergedDati,
      updatedAt: now,
    };
    records.unshift(updatedRecord); // Aggiunge in cima
  }

  // Ordina per data decrescente, poi ora decrescente
  records.sort((a, b) => {
    const comp = b.data.localeCompare(a.data);
    if (comp !== 0) return comp;
    return b.ora.localeCompare(a.ora);
  });

  saveRilevazioni(records);
  salvaOperatoreRecente(operatoreClean);

  return { records, updatedRecord, isUpdate };
}

/**
 * Elimina record specifici per id
 */
export function deleteRilevazioniByIds(idsToDelete: string[]): RilevazioneRecord[] {
  const records = loadRilevazioni();
  const idSet = new Set(idsToDelete);
  const remaining = records.filter((r) => !idSet.has(r.id));
  saveRilevazioni(remaining);
  return remaining;
}

/**
 * Memorizza gli ultimi operatori inseriti per suggerimenti veloci
 */
export function getOperatoriRecenti(): string[] {
  try {
    const raw = localStorage.getItem(OPERATORS_HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function salvaOperatoreRecente(op: string): void {
  try {
    const clean = normalizeOperator(op);
    if (!clean) return;
    const recenti = getOperatoriRecenti().filter((o) => o.toLowerCase() !== clean.toLowerCase());
    recenti.unshift(clean);
    localStorage.setItem(OPERATORS_HISTORY_KEY, JSON.stringify(recenti.slice(0, 10)));
  } catch {
    // ignora
  }
}

/**
 * Gestione IndexedDB per 'quincinetto-excel-link'
 */
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB non supportato da questo browser'));
      return;
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveExcelLinkToIDB(data: any): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(data, IDB_KEY_WORKBOOK);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Impossibile salvare il collegamento Excel in IndexedDB:', err);
  }
}

export async function loadExcelLinkFromIDB(): Promise<any> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY_WORKBOOK);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function clearExcelLinkFromIDB(): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(IDB_KEY_WORKBOOK);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignora
  }
}
