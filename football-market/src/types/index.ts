export type Position = 'GK' | 'DEF' | 'MID' | 'WNG' | 'ST';

// Stats that can be randomly shown/hidden on player cards
export type StatKey =
  | 'cleanSheets'
  | 'goals'
  | 'assists'
  | 'minutesPlayed'
  | 'leagueFinish'
  | 'contractYearsRemaining'
  | 'internationalCaps'
  | 'age';

export type Window =
  | 'SUMMER_2021'
  | 'WINTER_2022'
  | 'SUMMER_2022'
  | 'WINTER_2023'
  | 'SUMMER_2023'
  | 'WINTER_2024'
  | 'SUMMER_2024'
  | 'WINTER_2025'
  | 'SUMMER_2025'
  | 'WINTER_2026'
  | 'SUMMER_2026';

export type League =
  | 'Premier League'
  | 'La Liga'
  | 'Bundesliga'
  | 'Serie A'
  | 'Ligue 1'
  | 'Eredivisie'
  | 'Primeira Liga'
  | 'Saudi Pro League'
  | 'MLS'
  | 'Championship'
  | 'Other';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface PlayerSeason {
  window: Window;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  minutesPlayed: number;
  leagueFinish: number; // club's league position
  leagueName: League;
  contractYearsRemaining: number;
  internationalCaps: number;
  marketValue: number; // in millions EUR
  age: number;
  news?: string; // news event this window
}

export interface Player {
  id: string; // e.g. "GK-104"
  realName: string;
  nationality: string;
  nationalityFlag: string; // emoji flag
  position: Position;
  seasons: Record<Window, PlayerSeason>;
  peakWindow: Window;
  peakValue: number;
}

export interface Transaction {
  window: Window;
  playerId: string;
  type: 'buy' | 'sell';
  value: number; // millions EUR
  confidence?: number; // 1-5 stars, only on buy
}

export interface SquadSlot {
  position: Position;
  playerId: string | null;
  boughtWindow: Window | null;
  boughtValue: number | null;
  confidence: number | null;
}

export type GamePhase =
  | 'INTRO'
  | 'DRAFT'           // picking starting squad
  | 'TRANSFER_WINDOW' // standard transfer windows
  | 'NEWS'            // news between windows
  | 'END_SUMMARY'     // final reveal
  | 'HALL_OF_FAME';

export interface NewsItem {
  id: string;
  window: Window;
  text: string;
  type: 'transfer' | 'contract' | 'achievement' | 'decline';
}

export interface GameRun {
  id: string;
  startedAt: number;
  completedAt?: number;
  squad: SquadSlot[];
  transactions: Transaction[];
  currentWindow: Window;
  transfersRemaining: number;
  totalTransfers: number;
  phase: GamePhase;
  soldPlayerIds: string[]; // can never buy these again
  newsHistory: NewsItem[];
  finalProfit?: number;
  grade?: Grade;
  // Which stats are visible on player cards this run (randomly chosen per position)
  statVisibility: Record<Position, StatKey[]>;
}

export interface HallOfFameEntry {
  runId: string;
  completedAt: number;
  totalProfit: number;
  grade: Grade;
  bestInvestment: { playerId: string; realName: string; profit: number };
  worstInvestment: { playerId: string; realName: string; profit: number };
  transfersUsed: number;
}

export interface HallOfFame {
  entries: HallOfFameEntry[];
  runsCompleted: number;
  highestProfit: number;
  totalProfitAllRuns: number;
  achievements: string[];
}
