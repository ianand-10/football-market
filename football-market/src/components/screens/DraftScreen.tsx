import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Info } from 'lucide-react';
import { Button, Card, StarRating, PosBadge } from '../ui';
import { PlayerCard } from '../game/PlayerCard';
import { useGameStore } from '../../store/gameStore';
import { PLAYER_MAP } from '../../data/players';
import type { Position } from '../../types';

const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'WNG', 'ST'];
const POS_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  WNG: 'Winger',
  ST: 'Striker',
};

export function DraftScreen() {
  const { currentRun, draftState, initDraft, draftSelectPlayer, draftSetConfidence, draftConfirm } = useGameStore();
  const [step, setStep] = useState(0); // which position we're picking
  const [pendingConfidence, setPendingConfidence] = useState(3);

  useEffect(() => {
    if (!draftState) initDraft();
  }, []);

  if (!draftState || !currentRun) return null;

  const position = POSITIONS[step];
  const candidates = draftState.candidates[position] ?? [];
  const selectedId = draftState.selections[position];
  const isLastStep = step === POSITIONS.length - 1;
  const allSelected = POSITIONS.every(p => draftState.selections[p]);

  const handleNext = () => {
    if (!selectedId) return;
    draftSetConfidence(position, pendingConfidence);
    if (isLastStep) {
      draftConfirm();
    } else {
      setStep(s => s + 1);
      setPendingConfidence(3);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-[#4a5568] uppercase tracking-wider">Summer 2021</span>
          <span className="text-[#4a5568]">·</span>
          <span className="text-xs text-[#4a5568] uppercase tracking-wider">Squad Draft</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Pick your {POS_LABELS[position]}</h1>
        <p className="text-sm text-[#8899b4] mt-1">
          Choose one from five anonymous candidates. Names are revealed at the end.
        </p>
      </motion.div>

      {/* Progress steps */}
      <div className="flex gap-2 mb-8">
        {POSITIONS.map((pos, i) => (
          <div key={pos} className="flex-1 flex flex-col items-center gap-1">
            <div className={[
              'h-1 w-full rounded-full transition-all duration-300',
              i < step ? 'bg-[#63b6ff]' : i === step ? 'bg-[#63b6ff]/60' : 'bg-white/10',
            ].join(' ')} />
            <span className={`text-xs font-medium ${i === step ? 'text-[#63b6ff]' : i < step ? 'text-white/60' : 'text-[#4a5568]'}`}>
              {pos}
            </span>
          </div>
        ))}
      </div>

      {/* Candidate grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={position}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
        >
          {candidates.map((pid, i) => {
            const player = PLAYER_MAP[pid];
            if (!player) return null;
            return (
              <motion.div
                key={pid}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <PlayerCard
                  playerId={pid}
                  player={player}
                  window="SUMMER_2021"
                  showPurchaseValue
                  selected={selectedId === pid}
                  onSelect={() => draftSelectPlayer(position, pid)}
                  visibleStats={currentRun.statVisibility[position]}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Confidence + navigation */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Card className="p-5 mb-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={14} className="text-[#63b6ff]" />
                  <span className="text-sm font-medium text-white">How confident are you in this pick?</span>
                </div>
                <p className="text-xs text-[#8899b4]">
                  This doesn't affect gameplay — it's used in your end-of-run analysis.
                </p>
              </div>
              <StarRating value={pendingConfidence} onChange={setPendingConfidence} size={24} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
          <ChevronLeft size={16} />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {/* Mini squad preview */}
          {POSITIONS.slice(0, step).map(pos => {
            const selId = draftState.selections[pos];
            return selId ? (
              <div key={pos} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/8">
                <Check size={10} className="text-green-400" />
                <PosBadge position={pos} />
              </div>
            ) : null;
          })}
        </div>

        <Button onClick={handleNext} disabled={!selectedId}>
          {isLastStep ? (
            <>
              <Check size={16} />
              Confirm Squad
            </>
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
