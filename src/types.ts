export type Gruppo = 'Gruppo 1' | 'Gruppo 2';

export type CategoryId =
  | 'potenza'
  | 'guida_turbina'
  | 'alternatore'
  | 'combinato'
  | 'colonnetta_pale'
  | 'sod'
  | 'pompa_servizio'
  | 'perdite_servomotori'
  | 'drenaggio_tenuta_albero'
  | 'tempo_pompa_drenaggio'
  | 'irrorazione_tenuta'
  | 'delta_pressione_servovalvole'
  | 'temperature_statore'
  | 'temperatura_aria_statore'
  | 'temperatura_trasformatore_eccitatrice';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  shortDesc: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'potenza', label: '1. Potenza gruppo', shortDesc: 'Valore in MW' },
  { id: 'guida_turbina', label: '2. Supporto guida turbina', shortDesc: 'Temperature e livello' },
  { id: 'alternatore', label: '3. Supporto alternatore', shortDesc: 'Temperature e livello' },
  { id: 'combinato', label: '4. Supporto combinato', shortDesc: 'Pattino assiale e radiale' },
  { id: 'colonnetta_pale', label: '5. Temp. olio colonnetta comando pale', shortDesc: 'Temperatura olio' },
  { id: 'sod', label: '6. SOD', shortDesc: 'Olio, livelli e pressione' },
  { id: 'pompa_servizio', label: '7. Pompa in servizio', shortDesc: 'Pompa 1/2 e perdita olio' },
  { id: 'perdite_servomotori', label: '8. Perdite Servomotori', shortDesc: 'Verifica presenza perdite' },
  {
    id: 'drenaggio_tenuta_albero',
    label: "9. Drenaggio tenuta d'albero",
    shortDesc: 'Pompa 1 AC, Pompa 2 AC, Pompa 3 DC (secondi)',
  },
  {
    id: 'irrorazione_tenuta',
    label: '10. Irrorazione tenuta',
    shortDesc: 'Pressione (bar) e portata (l/min)',
  },
  {
    id: 'delta_pressione_servovalvole',
    label: '11. Delta pressione gruppo servovalvole',
    shortDesc: 'Pressione di monte e valle (bar)',
  },
  {
    id: 'temperature_statore',
    label: '12. Temperature statore',
    shortDesc: 'Rame (9 valori) e ferro (3 valori) in °C',
  },
  {
    id: 'temperatura_aria_statore',
    label: '13. Temperatura aria zona statore',
    shortDesc: 'Esterne (4 valori) e interne (4 valori) in °C',
  },
  {
    id: 'temperatura_trasformatore_eccitatrice',
    label: '14. Temperatura trasformatore eccitatrice',
    shortDesc: 'CH1, CH2, CH3, CH4 in °C',
  },
];

export interface RilevazioneDati {
  // Potenza gruppo
  potenza_mw?: number | null;

  // Supporto guida turbina
  guida_turbina_temp_olio?: number | null;
  guida_turbina_livello_olio?: string | null;
  guida_turbina_temp_pattino_1?: number | null;
  guida_turbina_temp_pattino_2?: number | null;

  // Supporto alternatore
  alternatore_temp_olio?: number | null;
  alternatore_livello_olio?: string | null;
  alternatore_temp_pattino_1?: number | null;
  alternatore_temp_pattino_2?: number | null;

  // Supporto combinato (MAI chimare pattino 1 e 2)
  combinato_temp_olio?: number | null;
  combinato_livello_olio?: string | null;
  combinato_temp_pattino_assiale?: number | null;
  combinato_temp_pattino_radiale?: number | null;

  // Colonnetta comando pale
  colonnetta_pale_temp_olio?: number | null;

  // SOD
  sod_temp_olio?: number | null;
  sod_livello_olio?: string | null;
  sod_livello_accumulatore?: string | null;
  sod_pressione_accumulatore_bar?: number | null;

  // Pompa in servizio & perdita
  pompa_in_servizio?: 'Pompa 1' | 'Pompa 2' | null;
  pompa_perdita_olio?: 'Sì' | 'No' | null;

  // Perdite Servomotori
  perdite_servomotori?: 'Sì' | 'No' | null;

  // 9. Drenaggio tenuta d'albero (Pompa 1 AC, Pompa 2 AC, Pompa 3 DC - tempi in secondi)
  drenaggio_p1_ac_arresto_s?: number | null;
  drenaggio_p1_ac_funzionamento_s?: number | null;
  drenaggio_p2_ac_arresto_s?: number | null;
  drenaggio_p2_ac_funzionamento_s?: number | null;
  drenaggio_p3_dc_arresto_s?: number | null;
  drenaggio_p3_dc_funzionamento_s?: number | null;

  // Retrocompatibilità
  tempo_pompa_1_drenaggio_tenuta_albero?: number | string | null;

  // 10. Irrorazione tenuta (pressione in bar, portata in litri/minuto)
  pressione_irrorazione_tenuta_bar?: number | null;
  portata_irrorazione_tenuta_l_min?: number | null;

  // 11. Delta pressione gruppo servovalvole (pressione monte e valle in bar)
  delta_p_monte_bar?: number | null;
  delta_p_valle_bar?: number | null;

  // 12. Temperature statore (Rame 1-9 e Ferro 1-3 in °C)
  statore_temp_rame_1?: number | null;
  statore_temp_rame_2?: number | null;
  statore_temp_rame_3?: number | null;
  statore_temp_rame_4?: number | null;
  statore_temp_rame_5?: number | null;
  statore_temp_rame_6?: number | null;
  statore_temp_rame_7?: number | null;
  statore_temp_rame_8?: number | null;
  statore_temp_rame_9?: number | null;
  statore_temp_ferro_1?: number | null;
  statore_temp_ferro_2?: number | null;
  statore_temp_ferro_3?: number | null;

  // 13. Temperatura aria zona statore (Esterne 1-4 e Interne 1-4 in °C)
  statore_aria_esterna_1?: number | null;
  statore_aria_esterna_2?: number | null;
  statore_aria_esterna_3?: number | null;
  statore_aria_esterna_4?: number | null;
  statore_aria_interna_1?: number | null;
  statore_aria_interna_2?: number | null;
  statore_aria_interna_3?: number | null;
  statore_aria_interna_4?: number | null;

  // 14. Temperatura trasformatore eccitatrice (CH1-CH4 in °C)
  trasf_eccitatrice_ch1?: number | null;
  trasf_eccitatrice_ch2?: number | null;
  trasf_eccitatrice_ch3?: number | null;
  trasf_eccitatrice_ch4?: number | null;

  // Note opzionali
  note?: string;
}

export interface RilevazioneRecord {
  id: string; // formato es: gr1-2026-10-14-mario_rossi o uuid
  gruppo: Gruppo;
  data: string; // YYYY-MM-DD
  ora: string; // HH:mm
  timestamp: number;
  operatore: string;
  dati: RilevazioneDati;
  updatedAt: number;
}
