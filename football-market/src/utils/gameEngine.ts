import type { Window, Position, Grade, GameRun, Transaction, SquadSlot } from '../types';
import { PLAYERS, WINDOWS, getPlayersByPosition } from '../data/players';

export const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'WNG', 'ST'];
export const MAX_TRANSFERS = 8;

export function getWindowIndex(window: Window): number {
  return WINDOWS.indexOf(window);
}

export function getNextWindow(window: Window): Window | null {
  const idx = getWindowIndex(window);
  return idx < WINDOWS.length - 1 ? WINDOWS[idx + 1] : null;
}

export function isLastWindow(window: Window): boolean {
  return window === 'SUMMER_2026';
}

export function getFiveCandidates(position: Position, excludeIds: string[]): string[] {
  const pool = getPlayersByPosition(position)
    .filter(p => !excludeIds.includes(p.id));
  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(5, shuffled.length)).map(p => p.id);
}

export function getMarketValue(playerId: string, window: Window): number {
  const player = PLAYERS.find(p => p.id === playerId);
  if (!player) return 0;
  return player.seasons[window]?.marketValue ?? 0;
}

export function calculateProfit(transactions: Transaction[]): number {
  return transactions.reduce((acc, tx) => {
    return tx.type === 'sell' ? acc + tx.value : acc - tx.value;
  }, 0);
}

export function calculatePlayerProfit(playerId: string, transactions: Transaction[]): number {
  const playerTx = transactions.filter(t => t.playerId === playerId);
  return playerTx.reduce((acc, tx) => {
    return tx.type === 'sell' ? acc + tx.value : acc - tx.value;
  }, 0);
}

export function getPlayerBuyValue(playerId: string, transactions: Transaction[]): number | null {
  const buy = transactions.find(t => t.playerId === playerId && t.type === 'buy');
  return buy?.value ?? null;
}

export function getPlayerSellValue(playerId: string, transactions: Transaction[]): number | null {
  const sell = transactions.find(t => t.playerId === playerId && t.type === 'sell');
  return sell?.value ?? null;
}

export function gradeProfit(profit: number): Grade {
  if (profit >= 300) return 'A+';
  if (profit >= 200) return 'A';
  if (profit >= 100) return 'B';
  if (profit >= 0) return 'C';
  if (profit >= -100) return 'D';
  return 'F';
}

export function formatValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `€${(value / 1000).toFixed(1)}B`;
  }
  return `€${value}M`;
}

export function formatProfit(profit: number): string {
  const sign = profit >= 0 ? '+' : '';
  return `${sign}${formatValue(profit)}`;
}

export function createNewRun(): GameRun {
  return {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    squad: POSITIONS.map(pos => ({
      position: pos,
      playerId: null,
      boughtWindow: null,
      boughtValue: null,
      confidence: null,
    })),
    transactions: [],
    currentWindow: 'SUMMER_2021',
    transfersRemaining: MAX_TRANSFERS,
    totalTransfers: MAX_TRANSFERS,
    phase: 'DRAFT',
    soldPlayerIds: [],
    newsHistory: [],
  };
}

export function getCurrentSquadPlayerIds(squad: SquadSlot[]): string[] {
  return squad.map(s => s.playerId).filter(Boolean) as string[];
}

export function getSquadSlotForPosition(squad: SquadSlot[], position: Position): SquadSlot {
  return squad.find(s => s.position === position)!;
}

export function generateNewsForWindow(window: Window, squadIds: string[]): import('../types').NewsItem[] {
  const news: import('../types').NewsItem[] = [];

  // Squad player news
  for (const pid of squadIds) {
    const player = PLAYERS.find(p => p.id === pid);
    if (!player) continue;
    const seasonNews = player.seasons[window]?.news;
    if (seasonNews) {
      news.push({
        id: `${pid}-${window}`,
        window,
        text: seasonNews,
        type: 'transfer',
      });
    }
  }

  // General market news from non-squad players
  const nonSquadWithNews = PLAYERS.filter(p =>
    !squadIds.includes(p.id) && p.seasons[window]?.news
  ).slice(0, 2);

  for (const p of nonSquadWithNews) {
    const seasonNews = p.seasons[window]?.news;
    if (seasonNews) {
      // Anonymize: use position + partial ID
      const anonymousRef = p.id;
      news.push({
        id: `market-${p.id}-${window}`,
        window,
        text: seasonNews.replace(p.realName, anonymousRef),
        type: 'transfer',
      });
    }
  }

  return news;
}

export function getGradeColor(grade: Grade): string {
  switch (grade) {
    case 'A+': return '#f59e0b';
    case 'A': return '#22c55e';
    case 'B': return '#63b6ff';
    case 'C': return '#a78bfa';
    case 'D': return '#f97316';
    case 'F': return '#ef4444';
  }
}
