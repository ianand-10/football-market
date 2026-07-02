import { motion } from 'framer-motion';
import type { Player, Window, StatKey } from '../../types';
import { Card, PosBadge, StatRow } from '../ui';
import { formatValue } from '../../utils/gameEngine';

interface PlayerCardProps {
  playerId: string;
  player: Player;
  window: Window;
  showPurchaseValue?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  showSaleValue?: boolean;
  dimmed?: boolean;
  alreadySold?: boolean;
  visibleStats?: StatKey[]; // if undefined, show all stats (backwards-compat)
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function show(key: StatKey, visibleStats?: StatKey[]): boolean {
  if (!visibleStats) return true; // no restriction = show all
  return visibleStats.includes(key);
}

export function PlayerCard({
  playerId,
  player,
  window,
  showPurchaseValue = false,
  selected = false,
  onSelect,
  showSaleValue = false,
  dimmed = false,
  alreadySold = false,
  visibleStats,
}: PlayerCardProps) {
  const season = player.seasons[window];
  if (!season) return null;

  const isGK = player.position === 'GK';
  const isClickable = !!onSelect && !alreadySold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onClick={isClickable ? onSelect : undefined}
        selected={selected}
        className={`p-4 relative overflow-hidden ${alreadySold ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#63b6ff]/5 rounded-2xl pointer-events-none"
          />
        )}

        {/* Already sold overlay */}
        {alreadySold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
            <span className="text-xs text-white/60 font-medium tracking-wider uppercase">Previously Sold</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <PosBadge position={player.position} />
            {show('internationalCaps', visibleStats) && (
              <span className="text-[#8899b4] text-xs">{season.internationalCaps} caps</span>
            )}
          </div>
          <span className="text-xl leading-none">{player.nationalityFlag}</span>
        </div>

        {/* ID */}
        <div className="mb-3">
          <div className="font-mono text-lg font-bold text-white tracking-wider">{playerId}</div>
          <div className="text-xs text-[#8899b4] mt-0.5 flex gap-2 flex-wrap">
            {show('age', visibleStats) && <span>Age {season.age}</span>}
            <span>{season.leagueName}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="space-y-0.5 mb-3">
          {isGK ? (
            <>
              {show('cleanSheets', visibleStats) && (
                <StatRow label="Clean Sheets" value={season.cleanSheets ?? 0} />
              )}
              {show('minutesPlayed', visibleStats) && (
                <StatRow label="Minutes Played" value={`${(season.minutesPlayed / 90).toFixed(0)} apps`} />
              )}
            </>
          ) : (
            <>
              {show('goals', visibleStats) && (
                <StatRow label="Goals" value={season.goals ?? 0} />
              )}
              {show('assists', visibleStats) && (
                <StatRow label="Assists" value={season.assists ?? 0} />
              )}
              {show('minutesPlayed', visibleStats) && (
                <StatRow label="Minutes" value={`${(season.minutesPlayed / 90).toFixed(0)} apps`} />
              )}
            </>
          )}
          {show('leagueFinish', visibleStats) && (
            <StatRow label="League Finish" value={ordinal(season.leagueFinish)} />
          )}
          {show('contractYearsRemaining', visibleStats) && (
            <StatRow label="Contract" value={`${season.contractYearsRemaining}y remaining`} />
          )}
        </div>

        {/* Value */}
        {showPurchaseValue && (
          <div className="pt-2 border-t border-white/8 flex items-center justify-between">
            <span className="text-xs text-[#8899b4]">Purchase price</span>
            <span className="font-mono text-sm font-bold text-[#63b6ff]">{formatValue(season.marketValue)}</span>
          </div>
        )}
        {showSaleValue && (
          <div className="pt-2 border-t border-white/8 flex items-center justify-between">
            <span className="text-xs text-[#8899b4]">Sale value</span>
            <span className="font-mono text-sm font-bold text-amber-400">{formatValue(season.marketValue)}</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Minimal squad card (shown in transfer window header)
export function SquadMiniCard({ playerId, player, window }: { playerId: string; player: Player; window: Window }) {
  const season = player.seasons[window];
  if (!season) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8">
      <PosBadge position={player.position} />
      <span className="font-mono text-sm font-semibold text-white">{playerId}</span>
      <span className="text-xs text-[#8899b4]">{player.nationalityFlag}</span>
    </div>
  );
}
