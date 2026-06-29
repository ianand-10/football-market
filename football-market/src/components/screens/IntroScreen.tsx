import { motion } from 'framer-motion';
import { TrendingUp, Clock, Users, Shuffle } from 'lucide-react';
import { Button } from '../ui';
import { useGameStore } from '../../store/gameStore';

export function IntroScreen() {
  const { startNewRun, currentRun, hallOfFame } = useGameStore();

  const handleStart = () => {
    startNewRun();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#63b6ff]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-lg w-full text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#63b6ff]/10 border border-[#63b6ff]/20 text-[#63b6ff] text-xs font-medium tracking-wider uppercase mb-6"
        >
          <TrendingUp size={11} />
          Transfer Market Simulation
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Football
          <br />
          <span className="gradient-text">Market</span>
        </h1>

        <p className="text-[#8899b4] text-base leading-relaxed mb-10 max-w-sm mx-auto">
          Scout anonymous players. Make investments. Track your profit from{' '}
          <span className="text-white">Summer 2021</span> to{' '}
          <span className="text-white">Summer 2026</span>.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { icon: <Users size={12} />, label: '5-player squad' },
            { icon: <Shuffle size={12} />, label: 'Anonymous picks' },
            { icon: <Clock size={12} />, label: '15–25 min run' },
            { icon: <TrendingUp size={12} />, label: 'Real market data' },
          ].map(f => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-[#8899b4]"
            >
              <span className="text-[#63b6ff]">{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Button size="lg" onClick={handleStart} className="w-full max-w-xs mx-auto block mb-4">
          Start New Run
        </Button>

        {hallOfFame.runsCompleted > 0 && (
          <p className="text-xs text-[#4a5568]">
            {hallOfFame.runsCompleted} run{hallOfFame.runsCompleted !== 1 ? 's' : ''} completed ·{' '}
            Best profit: €{hallOfFame.highestProfit.toFixed(0)}M
          </p>
        )}
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center"
      >
        <div className="flex gap-8 text-xs text-[#4a5568]">
          <span>No player names revealed until the end</span>
          <span>·</span>
          <span>8 transfers across 10 windows</span>
          <span>·</span>
          <span>Profit = Sales − Purchases</span>
        </div>
      </motion.div>
    </div>
  );
}
