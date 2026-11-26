import { Gruppo, RilevazioneDati, RilevazioneRecord } from '../types';

export interface CleanBackupItem {
  voce: string;
  valore: string | number;
  operatore: string;
  data: string;
}

interface BackupFieldSpec {
  key: keyof RilevazioneDati;
  label: string;
  kind: 'number' | 'string' | 'pompa' | 'si_no';
}

const BACKUP_FIELDS: BackupFieldSpec[] = [
  { key: 'potenza_mw', label: '1. Potenza gruppo - Potenza (MW)', kind: 'number' },

  { key: 'guida_turbina_temp_olio', label: '2. Supporto guida turbina - Temperatura olio (°C)', kind: 'number' },
  { key: 'guida_turbina_livello_olio', label: '2. Supporto guida turbina - Livello olio', kind: 'string' },
  { key: 'guida_turbina_temp_pattino_1', label: '2. Supporto guida turbina - Temperatura pattino 1 (°C)', kind: 'number' },
  { key: 'guida_turbina_temp_pattino_2', label: '2. Supporto guida turbina - Temperatura pattino 2 (°C)', kind: 'number' },

  { key: 'alternatore_temp_olio', label: '3. Supporto alternatore - Temperatura olio (°C)', kind: 'number' },
  { key: 'alternatore_livello_olio', label: '3. Supporto alternatore - Livello olio', kind: 'string' },
  { key: 'alternatore_temp_pattino_1', label: '3. Supporto alternatore - Temperatura pattino 1 (°C)', kind: 'number' },
  { key: 'alternatore_temp_pattino_2', label: '3. Supporto alternatore - Temperatura pattino 2 (°C)', kind: 'number' },

  { key: 'combinato_temp_olio', label: '4. Supporto combinato - Temperatura olio (°C)', kind: 'number' },
  { key: 'combinato_livello_olio', label: '4. Supporto combinato - Livello olio', kind: 'string' },
  { key: 'combinato_temp_pattino_assiale', label: '4. Supporto combinato - Temperatura pattino assiale (°C)', kind: 'number' },
  { key: 'combinato_temp_pattino_radiale', label: '4. Supporto combinato - Temperatura pattino radiale (°C)', kind: 'number' },

  { key: 'colonnetta_pale_temp_olio', label: '5. Temp. olio colonnetta comando pale - Temperatura olio (°C)', kind: 'number' },

  { key: 'sod_temp_olio', label: '6. SOD - Temperatura olio (°C)', kind: 'number' },
  { key: 'sod_livello_olio', label: '6. SOD - Livello olio', kind: 'string' },
  { key: 'sod_livello_accumulatore', label: '6. SOD - Livello olio accumulatore', kind: 'string' },
  { key: 'sod_pressione_accumulatore_bar', label: '6. SOD - Pressione olio accumulatore (bar)', kind: 'number' },

  { key: 'pompa_in_servizio', label: '7. Pompa in servizio - Pompa attiva', kind: 'pompa' },
  { key: 'pompa_perdita_olio', label: '7. Pompa in servizio - Perdita olio', kind: 'si_no' },

  { key: 'perdite_servomotori', label: '8. Perdite Servomotori', kind: 'si_no' },

  { key: 'drenaggio_p1_ac_arresto_s', label: "9. Drenaggio tenuta d'albero - Pompa 1 AC Tempo arresto (s)", kind: 'number' },
  { key: 'drenaggio_p1_ac_funzionamento_s', label: "9. Drenaggio tenuta d'albero - Pompa 1 AC Tempo funzionamento (s)", kind: 'number' },
  { key: 'drenaggio_p2_ac_arresto_s', label: "9. Drenaggio tenuta d'albero - Pompa 2 AC Tempo arresto (s)", kind: 'number' },
  { key: 'drenaggio_p2_ac_funzionamento_s', label: "9. Drenaggio tenuta d'albero - Pompa 2 AC Tempo funzionamento (s)", kind: 'number' },
  { key: 'drenaggio_p3_dc_arresto_s', label: "9. Drenaggio tenuta d'albero - Pompa 3 DC Tempo arresto (s)", kind: 'number' },
  { key: 'drenaggio_p3_dc_funzionamento_s', label: "9. Drenaggio tenuta d'albero - Pompa 3 DC Tempo funzionamento (s)", kind: 'number' },
  { key: 'tempo_pompa_1_drenaggio_tenuta_albero', label: "9. Drenaggio tenuta d'albero - Tempo pompa 1 (storico)", kind: 'string' },

  { key: 'pressione_irrorazione_tenuta_bar', label: '10. Irrorazione tenuta - Pressione (bar)', kind: 'number' },
  { key: 'portata_irrorazione_tenuta_l_min', label: '10. Irrorazione tenuta - Portata (l/min)', kind: 'number' },

  { key: 'delta_p_monte_bar', label: '11. Delta pressione gruppo servovalvole - Pressione di monte (bar)', kind: 'number' },
  { key: 'delta_p_valle_bar', label: '11. Delta pressione gruppo servovalvole - Pressione di valle (bar)', kind: 'number' },

  { key: 'statore_temp_rame_1', label: '12. Temperature statore - Rame 1 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_2', label: '12. Temperature statore - Rame 2 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_3', label: '12. Temperature statore - Rame 3 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_4', label: '12. Temperature statore - Rame 4 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_5', label: '12. Temperature statore - Rame 5 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_6', label: '12. Temperature statore - Rame 6 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_7', label: '12. Temperature statore - Rame 7 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_8', label: '12. Temperature statore - Rame 8 (°C)', kind: 'number' },
  { key: 'statore_temp_rame_9', label: '12. Temperature statore - Rame 9 (°C)', kind: 'number' },
  { key: 'statore_temp_ferro_1', label: '12. Temperature statore - Ferro 1 (°C)', kind: 'number' },
  { key: 'statore_temp_ferro_2', label: '12. Temperature statore - Ferro 2 (°C)', kind: 'number' },
  { key: 'statore_temp_ferro_3', label: '12. Temperature statore - Ferro 3 (°C)', kind: 'number' },

  { key: 'statore_aria_esterna_1', label: '13. Temperatura aria zona statore - Esterna 1 (°C)', kind: 'number' },
  { key: 'statore_aria_esterna_2', label: '13. Temperatura aria zona statore - Esterna 2 (°C)', kind: 'number' },
  { key: 'statore_aria_esterna_3', label: '13. Temperatura aria zona statore - Esterna 3 (°C)', kind: 'number' },
  { key: 'statore_aria_esterna_4', label: '13. Temperatura aria zona statore - Esterna 4 (°C)', kind: 'number' },
  { key: 'statore_aria_interna_1', label: '13. Temperatura aria zona statore - Interna 1 (°C)', kind: 'number' },
  { key: 'statore_aria_interna_2', label: '13. Temperatura aria zona statore - Interna 2 (°C)', kind: 'number' },
  { key: 'statore_aria_interna_3', label: '13. Temperatura aria zona statore - Interna 3 (°C)', kind: 'number' },
  { key: 'statore_aria_interna_4', label: '13. Temperatura aria zona statore - Interna 4 (°C)', kind: 'number' },

  { key: 'trasf_eccitatrice_ch1', label: '14. Temperatura trasformatore eccitatrice - CH1 (°C)', kind: 'number' },
  { key: 'trasf_eccitatrice_ch2', label: '14. Temperatura trasformatore eccitatrice - CH2 (°C)', kind: 'number' },
  { key: 'trasf_eccitatrice_ch3', label: '14. Temperatura trasformatore eccitatrice - CH3 (°C)', kind: 'number' },
  { key: 'trasf_eccitatrice_ch4', label: '14. Temperatura trasformatore eccitatrice - CH4 (°C)', kind: 'number' },

  { key: 'note', label: '15. Annotazioni', kind: 'string' },
];

const LABEL_TO_SPEC = new Map<string, BackupFieldSpec>(
  BACKUP_FIELDS.map((f) => [f.label.toLowerCase(), f])
);

/**
 * Converte i record locali in un elenco JSON pulito e leggibile contenente
 * solo i 4 campi funzionali: voce, valore, operatore, data.
 */
export function recordsToCleanBackup(records: RilevazioneRecord[]): CleanBackupItem[] {
  const items: CleanBackupItem[] = [];

  for (const rec of records) {
    const dati = rec.dati || {};
    for (const field of BACKUP_FIELDS) {
      const rawValue = dati[field.key];
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        continue;
      }
      if (typeof rawValue === 'string' && rawValue.trim() === '') {
        continue;
      }
      if (
        field.key === 'tempo_pompa_1_drenaggio_tenuta_albero' &&
        dati.drenaggio_p1_ac_funzionamento_s !== null &&
        dati.drenaggio_p1_ac_funzionamento_s !== undefined
      ) {
        continue;
      }

      items.push({
        voce: `${rec.gruppo} - ${field.label}`,
        valore: rawValue,
        operatore: rec.operatore || '',
        data: rec.data || '',
      });
    }
  }

  return items;
}

function isCleanBackupItem(item: unknown): item is CleanBackupItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as any).voce === 'string' &&
    'valore' in item &&
    typeof (item as any).data === 'string'
  );
}

function parseValueForField(raw: unknown, kind: BackupFieldSpec['kind']): any {
  if (raw === null || raw === undefined || raw === '') return null;
  if (kind === 'number') {
    if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw;
    const parsed = parseFloat(String(raw).replace(',', '.'));
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (kind === 'pompa') {
    const s = String(raw).trim();
    return s === 'Pompa 1' || s === 'Pompa 2' ? s : null;
  }
  if (kind === 'si_no') {
    const s = String(raw).trim().toLowerCase();
    if (s === 'sì' || s === 'si') return 'Sì';
    if (s === 'no') return 'No';
    return null;
  }
  return String(raw);
}

/**
 * Ricostruisce i record interni dall'elenco JSON leggibile (o dal vecchio formato legacy).
 */
export function parseBackupJsonToRecords(parsed: unknown): RilevazioneRecord[] {
  // 1. Vecchio formato oggetto wrapper { records: [...] }
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as any).records)
  ) {
    return (parsed as any).records as RilevazioneRecord[];
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Formato file non riconosciuto. Il file deve contenere un elenco di controlli.');
  }

  if (parsed.length === 0) {
    throw new Error('Nessuna registrazione trovata nel file JSON.');
  }

  // 2. Vecchio formato array diretto di RilevazioneRecord (ha proprietà "dati")
  if (typeof parsed[0] === 'object' && parsed[0] !== null && 'dati' in parsed[0]) {
    return parsed as RilevazioneRecord[];
  }

  // 3. Nuovo formato compatto e leggibile: [{ voce, valore, operatore, data }]
  if (!parsed.every(isCleanBackupItem)) {
    throw new Error(
      'Formato file non riconosciuto. Ogni voce deve contenere: voce, valore, operatore e data.'
    );
  }

  const grouped = new Map<string, RilevazioneRecord>();
  const now = Date.now();
  let counter = 0;

  for (const item of parsed) {
    let gruppo: Gruppo = 'Gruppo 1';
    let labelPart = item.voce.trim();

    if (/^Gruppo\s*2\s*-\s*/i.test(labelPart)) {
      gruppo = 'Gruppo 2';
      labelPart = labelPart.replace(/^Gruppo\s*2\s*-\s*/i, '').trim();
    } else if (/^Gruppo\s*1\s*-\s*/i.test(labelPart)) {
      gruppo = 'Gruppo 1';
      labelPart = labelPart.replace(/^Gruppo\s*1\s*-\s*/i, '').trim();
    }

    const spec = LABEL_TO_SPEC.get(labelPart.toLowerCase());
    if (!spec) {
      continue;
    }

    const data = item.data.trim();
    const operatore = (item.operatore || '').trim();
    const compositeKey = `${gruppo}_${data}_${operatore.toLowerCase()}`;

    let record = grouped.get(compositeKey);
    if (!record) {
      counter += 1;
      record = {
        id: `bkp_${now}_${counter}`,
        gruppo,
        data,
        ora: '08:00',
        timestamp: now,
        operatore,
        dati: {},
        updatedAt: now,
      };
      grouped.set(compositeKey, record);
    }

    const parsedVal = parseValueForField(item.valore, spec.kind);
    if (parsedVal !== null && parsedVal !== undefined) {
      (record.dati as any)[spec.key] = parsedVal;
    }
  }

  const result = Array.from(grouped.values()).sort((a, b) => b.data.localeCompare(a.data));
  if (result.length === 0) {
    throw new Error('Nessuna voce valida riconosciuta nel file di backup JSON.');
  }
  return result;
}
