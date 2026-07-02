import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, Lock, ChevronRight } from 'lucide-react';
<<<<<<< HEAD
import { Button, Card, StarRating, PosBadge, Badge } from '../ui';
=======
import { Button, Card, Badge, StarRating, PosBadge } from '../ui';
>>>>>>> b287e6942b69d1304a680c4647f791c467456b63
import { PlayerCard } from '../game/PlayerCard';
import { useGameStore } from '../../store/gameStore';
import { PLAYER_MAP, WINDOW_LABELS, WINDOWS } from '../../data/players';
import { formatValue, calculatePlayerProfit } from '../../utils/gameEngine';
import type { Position } from '../../types';

const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'WNG', 'ST'];
const POS_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', WNG: 'Winger', ST: 'Striker',
};

function SquadSlotCard({
  position,
  onOpenTransfer,
}: {
  position: Position;
  onOpenTransfer: (pos: Position) => void;
}) {
  const { currentRun } = useGameStore();
  if (!currentRun) return null;

  const slot = currentRun.squad.find(s => s.position === position);
  if (!slot?.playerId) return null;

  const player = PLAYER_MAP[slot.playerId];
  if (!player) return null;

  const season = player.seasons[currentRun.currentWindow];
  const buyValue = slot.boughtValue ?? 0;
  const currentValue = season?.marketValue ?? 0;
  const pnl = currentValue - buyValue;
  const pnlColor = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-[#8899b4]';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <PosBadge position={position} />
          <span className="text-xs text-[#8899b4]">{POS_LABELS[position]}</span>
        </div>
        {currentRun.transfersRemaining > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenTransfer(position)}
            className="text-[#8899b4] hover:text-white"
          >
            Transfer <ChevronRight size={12} />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="font-mono text-base font-bold text-white">{slot.playerId}</div>
        <span className="text-lg">{player.nationalityFlag}</span>
        {slot.boughtWindow === currentRun.currentWindow && (
          <Badge color="green" size="sm">Just bought</Badge>
        )}
      </div>

      {season && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {player.position === 'GK' ? (
            <div className="rounded-lg bg-white/4 p-2">
              <div className="text-base font-bold text-white">{season.cleanSheets ?? 0}</div>
              <div className="text-xs text-[#4a5568]">Clean Sheets</div>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-white/4 p-2">
                <div className="text-base font-bold text-white">{season.goals ?? 0}</div>
                <div className="text-xs text-[#4a5568]">Goals</div>
              </div>
              <div className="rounded-lg bg-white/4 p-2">
                <div className="text-base font-bold text-white">{season.assists ?? 0}</div>
                <div className="text-xs text-[#4a5568]">Assists</div>
              </div>
            </>
          )}
          <div className="rounded-lg bg-white/4 p-2">
            <div className="text-base font-bold text-white">{(season.minutesPlayed / 90).toFixed(0)}</div>
            <div className="text-xs text-[#4a5568]">Apps</div>
          </div>
          <div className="rounded-lg bg-white/4 p-2">
            <div className="text-base font-bold text-white">{season.leagueFinish}th</div>
            <div className="text-xs text-[#4a5568]">League</div>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/6">
        <div>
          <div className="text-xs text-[#4a5568] mb-0.5">Bought for</div>
          <div className="font-mono text-sm font-semibold text-white/70">{formatValue(buyValue)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#4a5568] mb-0.5">Value change</div>
          <div className={`font-mono text-sm font-bold ${pnlColor}`}>
            {pnl > 0 ? '+' : ''}{formatValue(pnl)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function TransferModal({
  position,
  onClose,
}: {
  position: Position;
  onClose: () => void;
}) {
  const { currentRun, transferState, sellAndBuy, keepCurrentPlayer } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [confirming, setConfirming] = useState(false);

  if (!currentRun || !transferState) return null;

  const candidates = transferState.candidates;
  const slot = currentRun.squad.find(s => s.position === position);
  const currentPlayer = slot?.playerId ? PLAYER_MAP[slot.playerId] : null;
  const currentSaleValue = slot?.playerId
    ? PLAYER_MAP[slot.playerId]?.seasons[currentRun.currentWindow]?.marketValue ?? 0
    : 0;

  const handleConfirm = () => {
    if (!selectedId) return;
    sellAndBuy(selectedId, confidence);
    onClose();
  };

  const selectedPlayer = selectedId ? PLAYER_MAP[selectedId] : null;
  const selectedBuyValue = selectedId
    ? PLAYER_MAP[selectedId]?.seasons[currentRun.currentWindow]?.marketValue ?? 0
    : 0;
  const netCost = selectedBuyValue - currentSaleValue;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        className="w-full max-w-3xl mx-4 bg-[#0e1420] border border-white/10 rounded-3xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PosBadge position={position} />
              <span className="text-sm text-[#8899b4]">{WINDOW_LABELS[currentRun.currentWindow]}</span>
            </div>
            <h2 className="text-lg font-bold text-white">Transfer your {POS_LABELS[position]}</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#4a5568] mb-0.5">Selling</div>
            {currentPlayer && (
              <div className="font-mono font-bold text-white">{slot?.playerId}</div>
            )}
            <div className="font-mono text-sm text-amber-400">{formatValue(currentSaleValue)}</div>
          </div>
        </div>

        {/* Candidates */}
        <div className="p-6">
          <p className="text-xs text-[#4a5568] uppercase tracking-wider mb-4">
            Select a replacement — purchase price shown
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {candidates.map((pid, i) => {
              const p = PLAYER_MAP[pid];
              const alreadySold = currentRun.soldPlayerIds.includes(pid);
              if (!p) return null;
              return (
                <motion.div
                  key={pid}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PlayerCard
                    playerId={pid}
                    player={p}
                    window={currentRun.currentWindow}
                    showPurchaseValue
                    selected={selectedId === pid}
                    onSelect={() => setSelectedId(pid)}
                    alreadySold={alreadySold}
                    visibleStats={currentRun.statVisibility[position]}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Selected summary */}
          <AnimatePresence>
            {selectedId && selectedPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-4 rounded-2xl bg-white/4 border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono font-bold text-white text-lg mb-0.5">{selectedId}</div>
                    <div className="text-xs text-[#8899b4]">
                      {selectedPlayer.nationalityFlag} Age {selectedPlayer.seasons[currentRun.currentWindow]?.age}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#4a5568] mb-1">Net cost of transfer</div>
                    <div className={`font-mono font-bold text-base ${netCost > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {netCost > 0 ? '+' : ''}{formatValue(netCost)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8899b4]">Confidence in this pick:</span>
                  <StarRating value={confidence} onChange={setConfidence} size={20} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { keepCurrentPlayer(); onClose(); }} className="flex-1">
              <Lock size={14} />
              Keep {slot?.playerId ?? 'current player'}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedId}
              className="flex-1"
            >
              <RefreshCw size={14} />
              Make Transfer
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TransferWindowScreen() {
  const { currentRun, openTransferForPosition, closeTransferPosition, transferState, advanceWindow } = useGameStore();
  const [activeTransferPos, setActiveTransferPos] = useState<Position | null>(null);

  if (!currentRun) return null;

  const handleOpenTransfer = (pos: Position) => {
    openTransferForPosition(pos);
    setActiveTransferPos(pos);
  };

  const handleCloseTransfer = () => {
    closeTransferPosition();
    setActiveTransferPos(null);
  };

  // Work out which positions are "done" (player was kept or replaced this window)
  // We just track it via whether modal was opened — simplified: user clicks Advance when ready
  const windowLabel = WINDOW_LABELS[currentRun.currentWindow];
  const currentWindowIdx = WINDOWS.indexOf(currentRun.currentWindow);
  // Exclude SUMMER_2026 (auto-end) from the displayed windows
  const playableWindows = WINDOWS.slice(0, -1);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#63b6ff] animate-pulse" />
              <span className="text-xs text-[#63b6ff] uppercase tracking-wider font-medium">Transfer Window Open</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{windowLabel}</h1>
          </div>

          <div className="text-right">
            <div className="text-xs text-[#4a5568] mb-1">Transfers remaining</div>
            <div className="flex gap-1.5 justify-end">
              {Array.from({ length: currentRun.totalTransfers }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-5 rounded-full transition-all ${
                    i < currentRun.totalTransfers - currentRun.transfersRemaining
                      ? 'bg-white/15'
                      : 'bg-[#63b6ff]'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-[#8899b4] mt-1">
              {currentRun.transfersRemaining}/{currentRun.totalTransfers} left
            </div>
          </div>
        </div>
      </motion.div>

      {/* Window timeline */}
      <div className="flex gap-1 mb-8">
        {playableWindows.map((w, i) => (
          <div
            key={w}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i < currentWindowIdx ? 'bg-[#63b6ff]/50' :
              i === currentWindowIdx ? 'bg-[#63b6ff]' : 'bg-white/8'
            }`}
            title={WINDOW_LABELS[w]}
          />
        ))}
      </div>

      {/* Squad grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {POSITIONS.map((pos, i) => (
          <motion.div
            key={pos}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <SquadSlotCard position={pos} onOpenTransfer={handleOpenTransfer} />
          </motion.div>
        ))}
      </div>

      {/* Footer info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between"
      >
        <p className="text-xs text-[#4a5568]">
          {currentRun.transfersRemaining === 0
            ? 'No transfers remaining — click Advance to continue.'
            : `You may transfer up to ${currentRun.transfersRemaining} more time${currentRun.transfersRemaining !== 1 ? 's' : ''} this run.`}
        </p>

        <Button
          size="lg"
          onClick={advanceWindow}
        >
          Advance
          <ArrowRight size={16} />
        </Button>
      </motion.div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {activeTransferPos && transferState && (
          <TransferModal
            position={activeTransferPos}
            onClose={handleCloseTransfer}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
