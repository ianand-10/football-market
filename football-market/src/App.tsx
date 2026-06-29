import { useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useGameStore } from './store/gameStore';
import { IntroScreen } from './components/screens/IntroScreen';
import { DraftScreen } from './components/screens/DraftScreen';
import { NewsScreen } from './components/screens/NewsScreen';
import { TransferWindowScreen } from './components/screens/TransferWindowScreen';
import { EndSummaryScreen } from './components/screens/EndSummaryScreen';
import { HallOfFameScreen } from './components/screens/HallOfFameScreen';
import { Button } from './components/ui';

type ViewMode = 'game' | 'hof';

function TopBar({ view, setView }: { view: ViewMode; setView: (v: ViewMode) => void }) {
  const { currentRun, abandonRun } = useGameStore();
  const hasActiveRun = currentRun && currentRun.phase !== 'END_SUMMARY';

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#080c14]/90 backdrop-blur-md border-b border-white/6">
      <button
        onClick={() => setView('game')}
        className="flex items-center gap-2 text-white font-bold text-sm hover:opacity-80 transition-opacity cursor-pointer"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <span className="text-[#63b6ff]">◈</span>
        Football Market
      </button>

      <div className="flex items-center gap-2">
        {hasActiveRun && currentRun.phase !== 'DRAFT' && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/4 border border-white/8 text-xs font-mono text-[#8899b4]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Run Active
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setView('hof')}>
          <Trophy size={14} />
          <span className="hidden sm:inline">Hall of Fame</span>
        </Button>
        {hasActiveRun && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Abandon this run? All progress will be lost.')) abandonRun();
            }}
          >
            Abandon
          </Button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { currentRun } = useGameStore();
  const [viewMode, setViewMode] = useState<ViewMode>('game');

  const phase = currentRun?.phase;

  let screenKey: string;
  let content: ReactNode;

  if (viewMode === 'hof') {
    screenKey = 'hof';
    content = <HallOfFameScreen />;
  } else if (!currentRun || !phase) {
    screenKey = 'intro';
    content = <IntroScreen />;
  } else if (phase === 'DRAFT') {
    screenKey = 'draft';
    content = <DraftScreen />;
  } else if (phase === 'NEWS') {
    screenKey = `news-${currentRun.currentWindow}`;
    content = <NewsScreen />;
  } else if (phase === 'TRANSFER_WINDOW') {
    screenKey = `transfer-${currentRun.currentWindow}`;
    content = <TransferWindowScreen />;
  } else if (phase === 'END_SUMMARY') {
    screenKey = 'end';
    content = <EndSummaryScreen />;
  } else {
    screenKey = 'intro-fallback';
    content = <IntroScreen />;
  }

  return (
    <div className="noise min-h-screen">
      <TopBar view={viewMode} setView={setViewMode} />
      <div className="pt-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
