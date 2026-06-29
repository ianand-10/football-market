import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { formatValue, formatProfit } from '../../utils/gameEngine';

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };
  const variants = {
    primary: 'bg-[#63b6ff] hover:bg-[#89caff] text-[#080c14] font-semibold shadow-lg shadow-[#63b6ff]/20 hover:shadow-[#63b6ff]/30 active:scale-95',
    secondary: 'bg-white/8 hover:bg-white/12 text-white border border-white/10 hover:border-white/20 active:scale-95',
    ghost: 'bg-transparent hover:bg-white/6 text-[#8899b4] hover:text-white active:scale-95',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 hover:border-red-500/40 active:scale-95',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: 'blue' | 'green' | 'gold' | 'purple';
  selected?: boolean;
}

export function Card({ children, className = '', onClick, glow, selected }: CardProps) {
  const glowMap = {
    blue: 'shadow-[0_0_24px_rgba(99,182,255,0.25)] border-[#63b6ff]/40',
    green: 'shadow-[0_0_24px_rgba(34,197,94,0.25)] border-green-500/40',
    gold: 'shadow-[0_0_24px_rgba(245,158,11,0.25)] border-amber-500/40',
    purple: 'shadow-[0_0_24px_rgba(167,139,250,0.25)] border-purple-500/40',
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      className={[
        'bg-[rgba(255,255,255,0.04)] border rounded-2xl backdrop-blur-sm transition-all duration-200',
        glow ? glowMap[glow] : selected ? 'border-[#63b6ff]/60 shadow-[0_0_20px_rgba(99,182,255,0.2)]' : 'border-white/8',
        onClick ? 'cursor-pointer hover:border-white/15 hover:bg-white/6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'gold' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export function Badge({ children, color = 'blue', size = 'sm' }: BadgeProps) {
  const colors = {
    blue: 'bg-[#63b6ff]/15 text-[#63b6ff] border border-[#63b6ff]/20',
    green: 'bg-green-500/15 text-green-400 border border-green-500/20',
    gold: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border border-red-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    gray: 'bg-white/8 text-[#8899b4] border border-white/10',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center rounded-md font-medium ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
}

export function StarRating({ value, onChange, max = 5, size = 20 }: StarRatingProps) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={size}
            className={n <= active ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Value Display ────────────────────────────────────────────────────────────
export function ValueTag({ value, label }: { value: number; label?: string }) {
  return (
    <div className="flex flex-col items-end">
      {label && <span className="text-xs text-[#4a5568] uppercase tracking-wider mb-0.5">{label}</span>}
      <span className="font-mono text-sm font-semibold text-[#63b6ff]">{formatValue(value)}</span>
    </div>
  );
}

export function ProfitTag({ profit }: { profit: number }) {
  const isPos = profit >= 0;
  return (
    <span className={`font-mono text-sm font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
      {formatProfit(profit)}
    </span>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white/10 border-t-[#63b6ff] animate-spin"
    />
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
export function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-[#8899b4]">{label}</span>
      <span className={`text-xs font-medium ${accent ? 'text-[#63b6ff]' : 'text-white'}`}>{value}</span>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="my-6 border-t border-white/8" />;
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="flex-1 border-t border-white/8" />
      <span className="text-xs text-[#4a5568] uppercase tracking-widest">{label}</span>
      <div className="flex-1 border-t border-white/8" />
    </div>
  );
}

// ─── Position Badge ───────────────────────────────────────────────────────────
export function PosBadge({ position }: { position: string }) {
  const colors: Record<string, string> = {
    GK: 'bg-amber-500/20 text-amber-400',
    DEF: 'bg-blue-500/20 text-blue-400',
    MID: 'bg-green-500/20 text-green-400',
    WNG: 'bg-purple-500/20 text-purple-400',
    ST: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[position] ?? 'bg-white/10 text-white'}`}>
      {position}
    </span>
  );
}
