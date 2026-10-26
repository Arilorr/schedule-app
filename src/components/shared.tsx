import { useEffect, useState, type ReactNode } from 'react';

export const DAY_MN: Record<string, string> = {
  Monday: 'Даваа',
  Tuesday: 'Мягмар',
  Wednesday: 'Лхагва',
  Thursday: 'Пүрэв',
  Friday: 'Баасан',
  Saturday: 'Бямба',
  Sunday: 'Ням',
};

export const STATUS_MN: Record<string, string> = {
  Balanced: 'Тэнцвэртэй',
  Manageable: 'Хэвийн',
  Busy: 'Ачаалалтай',
  Overworked: 'Хэт ачаалалтай',
};

export const RISK_MN: Record<string, string> = {
  Low: 'Бага',
  Medium: 'Дунд',
  High: 'Өндөр',
};

export const LEVEL_MN: Record<string, string> = {
  School: 'Сургуулийн',
  National: 'Үндэсний',
  Global: 'Олон улсын',
};

/** Status always pairs color with an icon so it survives colorblind/high-contrast modes. */
export function StatusIcon({ level }: { level: 'ok' | 'warn' | 'danger' }) {
  if (level === 'ok') return <span aria-label="Зөв / Сайн">✅</span>;
  if (level === 'warn') return <span aria-label="Анхааруулга">⚠️</span>;
  return <span aria-label="Эрсдэл өндөр">🔴</span>;
}

export function riskLevel(risk: string): 'ok' | 'warn' | 'danger' {
  return risk === 'Low' ? 'ok' : risk === 'Medium' ? 'warn' : 'danger';
}

export function scoreLevel(score: number): 'ok' | 'warn' | 'danger' {
  return score < 4 ? 'ok' : score <= 7 ? 'warn' : 'danger';
}

const LEVEL_TEXT: Record<'ok' | 'warn' | 'danger', string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
};
const LEVEL_SOFT: Record<'ok' | 'warn' | 'danger', string> = {
  ok: 'bg-ok/10 text-ok border-ok/30',
  warn: 'bg-warn/10 text-warn border-warn/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
};

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'bad' | 'info' }) {
  const cls =
    tone === 'good'
      ? 'bg-ok/10 text-ok border-ok/30'
      : tone === 'bad'
        ? 'bg-danger/10 text-danger border-danger/30'
        : tone === 'info'
          ? 'bg-accent/10 text-accent border-accent/30'
          : 'bg-surface text-muted border-line';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const level = scoreLevel(score);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold tabular-nums ${LEVEL_SOFT[level]}`}>
      <StatusIcon level={level} /> {score.toFixed(1)}<span className="font-medium opacity-70">/10</span>
    </span>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass lift p-5 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold tracking-tight">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/** Circular completion gauge with animated arc. */
export function Donut({ pct, size = 120, label }: { pct: number; size?: number; label?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={10} className="stroke-line/70" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          stroke="url(#donutGrad)"
          strokeDasharray={c}
          strokeDashoffset={off}
          className="donut-arc"
        />
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16 185 129)" />
            <stop offset="100%" stopColor="rgb(20 184 166)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold tabular-nums tracking-tight">{pct}%</span>
        {label && <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</span>}
      </div>
    </div>
  );
}

/** Semicircular workload dial, 1-10. */
export function GaugeDial({ score }: { score: number }) {
  const level = scoreLevel(score);
  const frac = Math.min(10, Math.max(0, score)) / 10;
  const r = 70;
  const half = Math.PI * r;
  const off = half - frac * half;
  const stroke = level === 'ok' ? 'rgb(16 185 129)' : level === 'warn' ? 'rgb(245 158 11)' : 'rgb(244 63 94)';
  return (
    <div className="relative w-[180px]">
      <svg width={180} height={100} viewBox="0 0 180 100">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" strokeWidth={14} strokeLinecap="round" className="stroke-line/70" />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={half}
          strokeDashoffset={off}
          className="gauge-arc"
        />
        {[...Array(10)].map((_, i) => {
          const a = Math.PI - (i / 9) * Math.PI;
          const x1 = 90 + Math.cos(a) * 54;
          const y1 = 90 - Math.sin(a) * 54;
          const x2 = 90 + Math.cos(a) * 48;
          const y2 = 90 - Math.sin(a) * 48;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} className="stroke-line" />;
        })}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className={`text-3xl font-extrabold tabular-nums tracking-tight ${LEVEL_TEXT[level]}`}>{score.toFixed(1)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Ачаалал / 10</span>
      </div>
    </div>
  );
}

/** Friendly AI coach avatar with a speech bubble. */
export function CoachCard({ children, title = 'Gemma AI зөвлөх' }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-xl shadow-md">
          <span aria-hidden>🤖</span>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-ok" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-accent">{title}</p>
        <div className="mn-bubble">{children}</div>
      </div>
    </div>
  );
}

/** Mini category icon for schedule activities. */
export function catIcon(activity: string): string {
  const a = activity.toLowerCase();
  if (/basket|football|sport|judo|tournament|swim|gym/.test(a)) return '🏀';
  if (/math|physics|chem|tutor|calc|science/.test(a)) return '📚';
  if (/art|design|draw|paint|mural/.test(a)) return '🎨';
  if (/music|piano|choir|concert/.test(a)) return '🎵';
  if (/robot|code|python|computer|stem/.test(a)) return '🤖';
  if (/debate|english|speech|book|read/.test(a)) return '🗣️';
  if (/volunteer|baby|charity|tree|climate|community/.test(a)) return '🤝';
  return '📌';
}

export function fmtDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="animate-pop fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="glass flex items-center gap-2 border-ok/40 bg-surface/95 px-4 py-2.5 text-sm font-semibold shadow-lift">
        <StatusIcon level="ok" /> {msg}
      </div>
    </div>
  ) : null;
  return { toast: setMsg, node };
}
