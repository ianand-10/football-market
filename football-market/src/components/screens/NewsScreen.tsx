import { motion } from 'framer-motion';
import { Newspaper, ArrowRight, TrendingUp, TrendingDown, RefreshCw, FileText } from 'lucide-react';
import { Button, Card } from '../ui';
import { useGameStore } from '../../store/gameStore';
import { PLAYER_MAP, WINDOW_LABELS } from '../../data/players';
import type { NewsItem } from '../../types';

const NEWS_ICONS = {
  transfer: TrendingUp,
  contract: FileText,
  achievement: TrendingUp,
  decline: TrendingDown,
};

function NewsRow({ item, index }: { item: NewsItem; index: number }) {
  const Icon = NEWS_ICONS[item.type] ?? Newspaper;
  const isSquadPlayer = item.id && !item.id.startsWith('market-');

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
    >
      <Card className={`p-4 flex gap-3 items-start ${isSquadPlayer ? 'border-[#63b6ff]/20 bg-[#63b6ff]/5' : ''}`}>
        <div className={`mt-0.5 p-2 rounded-lg ${isSquadPlayer ? 'bg-[#63b6ff]/15' : 'bg-white/6'}`}>
          <Icon size={14} className={isSquadPlayer ? 'text-[#63b6ff]' : 'text-[#8899b4]'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white leading-relaxed">{item.text}</p>
          {isSquadPlayer && (
            <span className="mt-1 inline-block text-xs text-[#63b6ff] font-medium">Your squad</span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function NewsScreen() {
  const { currentRun, advanceWindow } = useGameStore();
  if (!currentRun) return null;

  const currentWindowLabel = WINDOW_LABELS[currentRun.currentWindow];
  const windowNews = currentRun.newsHistory.filter(n => n.window === currentRun.currentWindow);
  const hasNews = windowNews.length > 0;

  const squadIds = currentRun.squad.map(s => s.playerId).filter(Boolean) as string[];
  const squadWithNews = squadIds.filter(id =>
    windowNews.some(n => n.id.startsWith(id))
  );

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-white/6 border border-white/10">
            <Newspaper size={16} className="text-[#8899b4]" />
          </div>
          <span className="text-xs text-[#4a5568] uppercase tracking-wider font-medium">
            {currentWindowLabel} · Transfer News
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Market Bulletin</h1>
        <p className="text-sm text-[#8899b4]">
          What happened across the football world this window.
        </p>
      </motion.div>

      {/* Squad summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 rounded-2xl bg-white/3 border border-white/8"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-[#4a5568] uppercase tracking-wider">Your Squad</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentRun.squad.map(slot => {
            if (!slot.playerId) return null;
            const player = PLAYER_MAP[slot.playerId];
            if (!player) return null;
            const hasSquadNews = squadWithNews.includes(slot.playerId);
            return (
              <div
                key={slot.position}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                  hasSquadNews
                    ? 'bg-[#63b6ff]/10 border-[#63b6ff]/30 text-[#63b6ff]'
                    : 'bg-white/4 border-white/8 text-white/60'
                }`}
              >
                {slot.playerId}
                {hasSquadNews && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#63b6ff] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* News items */}
      <div className="space-y-3 mb-8">
        {hasNews ? (
          windowNews.map((item, i) => (
            <NewsRow key={item.id} item={item} index={i} />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="py-12 text-center text-[#4a5568]"
          >
            <RefreshCw size={28} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">A quiet window. No major news to report.</p>
          </motion.div>
        )}
      </div>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <Button size="lg" onClick={advanceWindow}>
          Open Transfer Window
          <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  );
}
