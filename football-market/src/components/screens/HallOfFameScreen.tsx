import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Award, RotateCcw } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { useGameStore } from '../../store/gameStore';
import { formatValue, formatProfit, getGradeColor } from '../../utils/gameEngine';
import type { Grade } from '../../types';

function GradeChip({ grade }: { grade: Grade }) {
  return (
    <span
      className="text-sm font-black px-2 py-0.5 rounded-md"
      style={{ color: getGradeColor(grade), background: `${getGradeColor(grade)}18` }}
    >
      {grade}
    </span>
  );
}

const ACHIEVEMENT_LABELS: Record<string, { icon: string; desc: string }> = {
  'High Roller': { icon: '💰', desc: 'Profit over €500M in a single run' },
  'Market Master': { icon: '🏆', desc: 'Achieved an A+ grade' },
  'Bottom of the Market': { icon: '📉', desc: 'Achieved an F grade (at least you tried)' },
  'Trigger Happy': { icon: '🔁', desc: 'Used only 1 transfer in a run' },
};

export function HallOfFameScreen() {
  const { hallOfFame, startNewRun } = useGameStore();

  const avgProfit = hallOfFame.runsCompleted > 0
    ? hallOfFame.totalProfitAllRuns / hallOfFame.runsCompleted
    : 0;

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/20">
            <Trophy size={22} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Hall of Fame</h1>
        </div>
        <p className="text-sm text-[#8899b4]">Your lifetime investment record.</p>
      </motion.div>

      {/* Lifetime stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Runs Completed', value: hallOfFame.runsCompleted, mono: false },
          { label: 'Best Profit', value: `€${hallOfFame.highestProfit.toFixed(0)}M`, mono: true },
          { label: 'Avg Profit', value: `€${avgProfit.toFixed(0)}M`, mono: true },
          { label: 'Total Profit', value: formatValue(hallOfFame.totalProfitAllRuns), mono: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="p-4 text-center">
              <div className={`text-xl font-bold mb-1 ${stat.mono ? 'font-mono text-[#63b6ff]' : 'text-white'}`}>
                {stat.value}
              </div>
              <div className="text-xs text-[#4a5568]">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      {hallOfFame.achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award size={14} className="text-[#63b6ff]" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hallOfFame.achievements.map((ach, i) => {
              const meta = ACHIEVEMENT_LABELS[ach] ?? { icon: '⭐', desc: ach };
              return (
                <motion.div
                  key={ach}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Card className="p-3 flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{ach}</div>
                      <div className="text-xs text-[#8899b4]">{meta.desc}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Run history */}
      {hallOfFame.entries.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-4">Recent Runs</h2>
          <div className="space-y-2">
            {hallOfFame.entries.map((entry, i) => (
              <motion.div
                key={entry.runId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GradeChip grade={entry.grade} />
                    <div>
                      <div className={`font-mono text-sm font-bold ${entry.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatProfit(entry.totalProfit)}
                      </div>
                      <div className="text-xs text-[#4a5568]">
                        {new Date(entry.completedAt).toLocaleDateString()} · {entry.transfersUsed} transfers
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="flex items-center gap-1 text-xs text-green-400 justify-end mb-0.5">
                      <TrendingUp size={11} />
                      <span>{entry.bestInvestment.realName}</span>
                      <span className="font-mono">+{formatValue(entry.bestInvestment.profit)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-red-400 justify-end">
                      <TrendingDown size={11} />
                      <span>{entry.worstInvestment.realName}</span>
                      <span className="font-mono">{formatValue(entry.worstInvestment.profit)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center text-[#4a5568] mb-8">
          <Trophy size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No runs completed yet. Start playing to build your record.</p>
        </Card>
      )}

      <div className="flex justify-center">
        <Button size="lg" onClick={startNewRun}>
          <RotateCcw size={16} />
          Start New Run
        </Button>
      </div>
    </div>
  );
}
