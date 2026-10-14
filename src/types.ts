export type Gruppo = 'Gruppo 1' | 'Gruppo 2';

export type CategoryId =
  | 'potenza'
  | 'guida_turbina'
  | 'alternatore'
  | 'combinato'
  | 'colonnetta_pale'
  | 'sod'
  | 'pompa_servizio'
  | 'perdite_servomotori';

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
