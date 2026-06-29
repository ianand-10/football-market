import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Star, BarChart2, RotateCcw, Award } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Button, Card, Badge, ProfitTag, PosBadge } from '../ui';
import { useGameStore } from '../../store/gameStore';
import { PLAYER_MAP, WINDOW_LABELS, WINDOWS } from '../../data/players';
import {
  formatValue, formatProfit, getGradeColor, calculatePlayerProfit
} from '../../utils/gameEngine';
import type { Grade, Position } from '../../types';

const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'WNG', 'ST'];

function GradeBadge({ grade }: { grade: Grade }) {
  const color = getGradeColor(grade);
  return (
    <div
      className="text-4xl font-black tracking-tighter"
      style={{ color, fontFamily: 'Space Grotesk, sans-serif', textShadow: `0 0 24px ${color}60` }}
    >
      {grade}
    </div>
  );
}

function PlayerRevealCard({
  playerId,
  index,
  revealed,
  onReveal,
}: {
  playerId: string;
  index: number;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { currentRun } = useGameStore();
  if (!currentRun) return null;

  const player = PLAYER_MAP[playerId];
  if (!player) return null;

  const txs = currentRun.transactions.filter(t => t.playerId === playerId);
  const bought = txs.filter(t => t.type === 'buy');
  const sold = txs.filter(t => t.type === 'sell');
  const totalBought = bought.reduce((a, t) => a + t.value, 0);
  const totalSold = sold.reduce((a, t) => a + t.value, 0);
  const profit = totalSold - totalBought;
  const confidence = bought[0]?.confidence ?? 0;

  // Build timeline data
  const chartData = WINDOWS.map(w => ({
    label: WINDOW_LABELS[w].replace('Summer ', 'S ').replace('Winter ', 'W '),
    value: player.seasons[w]?.marketValue ?? 0,
  }));

  const boughtWindow = bought[0]?.window;
  const soldWindow = sold[sold.length - 1]?.window;
  const boughtWIdx = boughtWindow ? WINDOWS.indexOf(boughtWindow) : -1;
  const soldWIdx = soldWindow ? WINDOWS.indexOf(soldWindow) : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className={`overflow-hidden ${profit > 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
        {!revealed ? (
          /* Hidden state */
          <button
            onClick={onReveal}
            className="w-full p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/4 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center group-hover:border-[#63b6ff]/40 transition-all">
              <span className="text-2xl">?</span>
            </div>
            <div className="text-center">
              <div className="font-mono font-bold text-white text-xl mb-1">{playerId}</div>
              <div className="text-xs text-[#8899b4]">Click to reveal identity</div>
            </div>
          </button>
        ) : (
          /* Revealed state */
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PosBadge position={player.position} />
                  <span className="text-lg">{player.nationalityFlag}</span>
                </div>
                <div className="font-mono text-sm text-[#8899b4] mb-0.5">{playerId}</div>
                <div className="text-xl font-bold text-white">{player.realName}</div>
              </div>
              <div className="text-right">
                <ProfitTag profit={profit} />
                <div className="text-xs text-[#4a5568] mt-1">net profit</div>
              </div>
            </div>

            {/* Transaction summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl bg-white/4 p-3">
                <div className="text-xs text-[#4a5568] mb-1">Bought for</div>
                <div className="font-mono font-bold text-white">{formatValue(totalBought)}</div>
                {bought[0]?.window && (
                  <div className="text-xs text-[#8899b4] mt-0.5">{WINDOW_LABELS[bought[0].window]}</div>
                )}
              </div>
              <div className="rounded-xl bg-white/4 p-3">
                <div className="text-xs text-[#4a5568] mb-1">Sold for</div>
                <div className="font-mono font-bold text-white">{formatValue(totalSold)}</div>
                {sold[0]?.window && (
                  <div className="text-xs text-[#8899b4] mt-0.5">{WINDOW_LABELS[sold[sold.length - 1]?.window]}</div>
                )}
              </div>
            </div>

            {/* Confidence */}
            {confidence > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-[#4a5568]">Your confidence:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < confidence ? 'text-amber-400 fill-amber-400' : 'text-white/15'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Value timeline chart */}
            <div className="h-28 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#0e1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [`€${v}M`, 'Value']}
                    labelStyle={{ color: '#8899b4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={profit >= 0 ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: profit >= 0 ? '#22c55e' : '#ef4444' }}
                  />
                  {boughtWIdx >= 0 && (
                    <ReferenceLine
                      x={chartData[boughtWIdx]?.label}
                      stroke="#63b6ff"
                      strokeDasharray="3 3"
                      label={{ value: 'Buy', fontSize: 9, fill: '#63b6ff', position: 'top' }}
                    />
                  )}
                  {soldWIdx >= 0 && soldWIdx !== boughtWIdx && (
                    <ReferenceLine
                      x={chartData[soldWIdx]?.label}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      label={{ value: 'Sell', fontSize: 9, fill: '#f59e0b', position: 'top' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function EndSummaryScreen() {
  const { currentRun, revealIndex, revealNext, startNewRun, abandonRun } = useGameStore();
  const [showStats, setShowStats] = useState(false);

  if (!currentRun) return null;

  const allPlayerIds = POSITIONS.map(pos => {
    const slot = currentRun.squad.find(s => s.position === pos);
    return slot?.playerId ?? null;
  }).filter(Boolean) as string[];

  const profit = currentRun.finalProfit ?? 0;
  const grade = currentRun.grade ?? 'C';
  const allRevealed = revealIndex >= allPlayerIds.length;

  // Analysis
  const playerProfits = allPlayerIds.map(pid => ({
    pid,
    profit: calculatePlayerProfit(pid, currentRun.transactions),
    confidence: currentRun.transactions.find(t => t.playerId === pid && t.type === 'buy')?.confidence ?? 0,
  }));

  const best = playerProfits.reduce((a, b) => (a.profit > b.profit ? a : b));
  const worst = playerProfits.reduce((a, b) => (a.profit < b.profit ? a : b));

  const highConfidence = playerProfits.filter(p => p.confidence >= 4);
  const mostConfidentCorrect = highConfidence.reduce(
    (a, b) => (a.profit > b.profit ? a : b),
    highConfidence[0] ?? playerProfits[0]
  );
  const mostConfidentWrong = highConfidence.reduce(
    (a, b) => (a.profit < b.profit ? a : b),
    highConfidence[0] ?? playerProfits[0]
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/20">
            <Trophy size={28} className="text-amber-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Summer 2026 — Run Complete</h1>
        <p className="text-[#8899b4] text-sm">Your squad has been automatically sold. Here are the results.</p>
      </motion.div>

      {/* Profit + Grade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <Card className="p-8 text-center" glow={profit > 0 ? 'green' : undefined}>
          <div className="text-xs text-[#4a5568] uppercase tracking-widest mb-2">Total Profit</div>
          <div className={`text-5xl font-black font-mono mb-4 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatProfit(profit)}
          </div>
          <div className="flex justify-center mb-3">
            <GradeBadge grade={grade} />
          </div>
          <div className="text-xs text-[#8899b4]">
            {currentRun.totalTransfers - currentRun.transfersRemaining} of {currentRun.totalTransfers} transfers used
          </div>
        </Card>
      </motion.div>

      {/* Reveal cards */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-1">Player Reveals</h2>
        <p className="text-xs text-[#8899b4] mb-5">
          {allRevealed ? 'All identities revealed.' : 'Click each card to reveal who you invested in.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPlayerIds.map((pid, i) => (
            <PlayerRevealCard
              key={pid}
              playerId={pid}
              index={i}
              revealed={i < revealIndex}
              onReveal={i === revealIndex ? revealNext : () => {}}
            />
          ))}
        </div>
      </div>

      {/* Analysis (shown after all revealed) */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} className="text-[#63b6ff]" />
              <h2 className="text-lg font-bold text-white">Run Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4 border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-xs text-[#8899b4] uppercase tracking-wider">Best Investment</span>
                </div>
                <div className="font-mono text-sm font-bold text-white mb-0.5">{best.pid}</div>
                <div className="font-bold text-green-400">{PLAYER_MAP[best.pid]?.realName}</div>
                <ProfitTag profit={best.profit} />
              </Card>

              <Card className="p-4 border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={14} className="text-red-400" />
                  <span className="text-xs text-[#8899b4] uppercase tracking-wider">Worst Investment</span>
                </div>
                <div className="font-mono text-sm font-bold text-white mb-0.5">{worst.pid}</div>
                <div className="font-bold text-red-400">{PLAYER_MAP[worst.pid]?.realName}</div>
                <ProfitTag profit={worst.profit} />
              </Card>

              {mostConfidentCorrect && (
                <Card className="p-4 border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-[#8899b4] uppercase tracking-wider">Confident & Correct</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white mb-0.5">{mostConfidentCorrect.pid}</div>
                  <div className="font-bold text-amber-400">{PLAYER_MAP[mostConfidentCorrect.pid]?.realName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={10} className={i < mostConfidentCorrect.confidence ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
                      ))}
                    </div>
                    <ProfitTag profit={mostConfidentCorrect.profit} />
                  </div>
                </Card>
              )}

              {mostConfidentWrong && mostConfidentWrong.pid !== mostConfidentCorrect?.pid && (
                <Card className="p-4 border-red-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-white/30" />
                    <span className="text-xs text-[#8899b4] uppercase tracking-wider">Confident & Wrong</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white mb-0.5">{mostConfidentWrong.pid}</div>
                  <div className="font-bold text-[#8899b4]">{PLAYER_MAP[mostConfidentWrong.pid]?.realName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={10} className={i < mostConfidentWrong.confidence ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
                      ))}
                    </div>
                    <ProfitTag profit={mostConfidentWrong.profit} />
                  </div>
                </Card>
              )}
            </div>

            {/* Transaction history */}
            <Card className="p-4 mb-6">
              <h3 className="text-sm font-bold text-white mb-4">Transaction History</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentRun.transactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge color={tx.type === 'buy' ? 'blue' : 'gold'} size="sm">
                        {tx.type === 'buy' ? 'BUY' : 'SELL'}
                      </Badge>
                      <span className="font-mono text-xs text-white">{tx.playerId}</span>
                      {tx.type === 'buy' && tx.confidence && (
                        <div className="flex gap-0.5">
                          {Array.from({ length: tx.confidence }, (_, j) => (
                            <Star key={j} size={9} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#4a5568]">{WINDOW_LABELS[tx.window]}</span>
                      <span className={`font-mono text-xs font-semibold ${tx.type === 'sell' ? 'text-amber-400' : 'text-[#63b6ff]'}`}>
                        {tx.type === 'buy' ? '-' : '+'}{formatValue(tx.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Play again */}
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => abandonRun()}>
                View Hall of Fame
              </Button>
              <Button size="lg" onClick={() => startNewRun()}>
                <RotateCcw size={16} />
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
