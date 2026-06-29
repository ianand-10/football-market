import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameRun, HallOfFame, SquadSlot, Window, Position } from '../types';
import {
  createNewRun,
  getMarketValue,
  calculateProfit,
  gradeProfit,
  getFiveCandidates,
  getCurrentSquadPlayerIds,
  generateNewsForWindow,
} from '../utils/gameEngine';
import { WINDOWS, PLAYER_MAP } from '../data/players';

interface DraftState {
  candidates: Record<Position, string[]>;
  selections: Partial<Record<Position, string>>;
  confidences: Partial<Record<Position, number>>;
}

interface TransferState {
  position: Position | null;
  candidates: string[];
  selling: boolean;
}

interface GameStore {
  currentRun: GameRun | null;
  hallOfFame: HallOfFame;
  draftState: DraftState | null;
  transferState: TransferState | null;
  revealIndex: number; // for end game reveal animation

  // Actions
  startNewRun: () => void;
  abandonRun: () => void;

  // Draft
  initDraft: () => void;
  draftSelectPlayer: (position: Position, playerId: string) => void;
  draftSetConfidence: (position: Position, confidence: number) => void;
  draftConfirm: () => void;

  // Transfer window
  openTransferForPosition: (position: Position) => void;
  keepCurrentPlayer: () => void;
  sellAndBuy: (newPlayerId: string, confidence: number) => void;
  closeTransferPosition: () => void;

  // Advance
  advanceWindow: () => void;
  endGame: () => void;

  // Reveal
  revealNext: () => void;
}

const DEFAULT_HALL: HallOfFame = {
  entries: [],
  runsCompleted: 0,
  highestProfit: 0,
  totalProfitAllRuns: 0,
  achievements: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentRun: null,
      hallOfFame: DEFAULT_HALL,
      draftState: null,
      transferState: null,
      revealIndex: 0,

      startNewRun: () => {
        const run = createNewRun();
        set({ currentRun: run, draftState: null, transferState: null, revealIndex: 0 });
      },

      abandonRun: () => {
        set({ currentRun: null, draftState: null, transferState: null });
      },

      initDraft: () => {
        const candidates: Record<Position, string[]> = {
          GK: getFiveCandidates('GK', []),
          DEF: getFiveCandidates('DEF', []),
          MID: getFiveCandidates('MID', []),
          WNG: getFiveCandidates('WNG', []),
          ST: getFiveCandidates('ST', []),
        };
        set({
          draftState: {
            candidates,
            selections: {},
            confidences: {},
          },
        });
      },

      draftSelectPlayer: (position, playerId) => {
        set(state => ({
          draftState: state.draftState
            ? {
                ...state.draftState,
                selections: { ...state.draftState.selections, [position]: playerId },
              }
            : null,
        }));
      },

      draftSetConfidence: (position, confidence) => {
        set(state => ({
          draftState: state.draftState
            ? {
                ...state.draftState,
                confidences: { ...state.draftState.confidences, [position]: confidence },
              }
            : null,
        }));
      },

      draftConfirm: () => {
        const { currentRun, draftState } = get();
        if (!currentRun || !draftState) return;

        const window: Window = 'SUMMER_2021';
        const squad: SquadSlot[] = currentRun.squad.map(slot => {
          const playerId = draftState.selections[slot.position];
          if (!playerId) return slot;
          const value = getMarketValue(playerId, window);
          return {
            ...slot,
            playerId,
            boughtWindow: window,
            boughtValue: value,
            confidence: draftState.confidences[slot.position] ?? 3,
          };
        });

        const transactions = squad
          .filter(s => s.playerId)
          .map(s => ({
            window,
            playerId: s.playerId!,
            type: 'buy' as const,
            value: s.boughtValue!,
            confidence: s.confidence ?? 3,
          }));

        // Generate initial news
        const squadIds = squad.map(s => s.playerId).filter(Boolean) as string[];
        const newsHistory = generateNewsForWindow(window, squadIds);

        set({
          currentRun: {
            ...currentRun,
            squad,
            transactions,
            phase: 'NEWS',
            newsHistory,
          },
          draftState: null,
        });
      },

      openTransferForPosition: (position) => {
        const { currentRun } = get();
        if (!currentRun) return;

        const excludeIds = [
          ...getCurrentSquadPlayerIds(currentRun.squad),
          ...currentRun.soldPlayerIds,
        ];
        const candidates = getFiveCandidates(position, excludeIds);

        set({
          transferState: {
            position,
            candidates,
            selling: false,
          },
        });
      },

      keepCurrentPlayer: () => {
        set({ transferState: null });
      },

      sellAndBuy: (newPlayerId, confidence) => {
        const { currentRun, transferState } = get();
        if (!currentRun || !transferState?.position) return;

        const position = transferState.position;
        const window = currentRun.currentWindow;
        const slot = currentRun.squad.find(s => s.position === position);
        if (!slot?.playerId) return;

        const sellValue = getMarketValue(slot.playerId, window);
        const buyValue = getMarketValue(newPlayerId, window);

        const newTransactions = [
          ...currentRun.transactions,
          { window, playerId: slot.playerId, type: 'sell' as const, value: sellValue },
          { window, playerId: newPlayerId, type: 'buy' as const, value: buyValue, confidence },
        ];

        const newSquad = currentRun.squad.map(s =>
          s.position === position
            ? {
                ...s,
                playerId: newPlayerId,
                boughtWindow: window,
                boughtValue: buyValue,
                confidence,
              }
            : s
        );

        set({
          currentRun: {
            ...currentRun,
            squad: newSquad,
            transactions: newTransactions,
            transfersRemaining: currentRun.transfersRemaining - 1,
            soldPlayerIds: [...currentRun.soldPlayerIds, slot.playerId],
          },
          transferState: null,
        });
      },

      closeTransferPosition: () => {
        set({ transferState: null });
      },

      advanceWindow: () => {
        // Called from NEWS screen -> opens transfer window for current window
        // OR called from TRANSFER_WINDOW screen -> moves to next window's news
        const { currentRun } = get();
        if (!currentRun) return;

        if (currentRun.phase === 'NEWS') {
          // Open transfer window for current window
          set({
            currentRun: { ...currentRun, phase: 'TRANSFER_WINDOW' },
          });
          return;
        }

        if (currentRun.phase === 'TRANSFER_WINDOW') {
          // Move to next window
          const windowIdx = WINDOWS.indexOf(currentRun.currentWindow);
          if (windowIdx >= WINDOWS.length - 1) return;

          const nextWindow = WINDOWS[windowIdx + 1];

          if (nextWindow === 'SUMMER_2026') {
            get().endGame();
            return;
          }

          const squadIds = getCurrentSquadPlayerIds(currentRun.squad);
          const newNews = generateNewsForWindow(nextWindow, squadIds);

          set({
            currentRun: {
              ...currentRun,
              currentWindow: nextWindow,
              phase: 'NEWS',
              newsHistory: [...currentRun.newsHistory, ...newNews],
            },
          });
        }
      },

      endGame: () => {
        const { currentRun } = get();
        if (!currentRun) return;

        const finalWindow: Window = 'SUMMER_2026';
        const newTransactions = [...currentRun.transactions];

        // Auto-sell all remaining squad members
        for (const slot of currentRun.squad) {
          if (slot.playerId) {
            const alreadySold = newTransactions.some(
              t => t.playerId === slot.playerId && t.type === 'sell'
            );
            if (!alreadySold) {
              const sellValue = getMarketValue(slot.playerId, finalWindow);
              newTransactions.push({
                window: finalWindow,
                playerId: slot.playerId,
                type: 'sell',
                value: sellValue,
              });
            }
          }
        }

        const profit = calculateProfit(newTransactions);
        const grade = gradeProfit(profit);

        // Update hall of fame
        const { hallOfFame } = get();
        const squadIds = getCurrentSquadPlayerIds(currentRun.squad);

        // Find best/worst investments
        let bestProfit = -Infinity;
        let worstProfit = Infinity;
        let bestId = '';
        let worstId = '';

        for (const pid of squadIds) {
          const buys = newTransactions.filter(t => t.playerId === pid && t.type === 'buy');
          const sells = newTransactions.filter(t => t.playerId === pid && t.type === 'sell');
          const p = sells.reduce((a, t) => a + t.value, 0) - buys.reduce((a, t) => a + t.value, 0);
          if (p > bestProfit) { bestProfit = p; bestId = pid; }
          if (p < worstProfit) { worstProfit = p; worstId = pid; }
        }

          const entry = {
            runId: currentRun.id,
            completedAt: Date.now(),
            totalProfit: profit,
            grade,
            bestInvestment: { playerId: bestId, realName: PLAYER_MAP[bestId]?.realName ?? '', profit: bestProfit },
            worstInvestment: { playerId: worstId, realName: PLAYER_MAP[worstId]?.realName ?? '', profit: worstProfit },
            transfersUsed: currentRun.totalTransfers - currentRun.transfersRemaining,
          };

          const achievements = [...hallOfFame.achievements];
          if (profit > 500 && !achievements.includes('High Roller')) achievements.push('High Roller');
          if (grade === 'A+' && !achievements.includes('Market Master')) achievements.push('Market Master');
          if (grade === 'F' && !achievements.includes('Bottom of the Market')) achievements.push('Bottom of the Market');
          if (currentRun.transfersRemaining === currentRun.totalTransfers - 1 && !achievements.includes('Trigger Happy')) achievements.push('Trigger Happy');

          set({
            currentRun: {
              ...currentRun,
              currentWindow: finalWindow,
              transactions: newTransactions,
              phase: 'END_SUMMARY',
              finalProfit: profit,
              grade,
              completedAt: Date.now(),
            },
            revealIndex: 0,
            hallOfFame: {
              entries: [entry, ...hallOfFame.entries].slice(0, 20),
              runsCompleted: hallOfFame.runsCompleted + 1,
              highestProfit: Math.max(hallOfFame.highestProfit, profit),
              totalProfitAllRuns: hallOfFame.totalProfitAllRuns + profit,
              achievements,
            },
          });
      },

      revealNext: () => {
        set(state => ({ revealIndex: state.revealIndex + 1 }));
      },
    }),
    {
      name: 'football-market-save',
      partialize: (state) => ({
        currentRun: state.currentRun,
        hallOfFame: state.hallOfFame,
      }),
    }
  )
);
