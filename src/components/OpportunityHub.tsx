import { useState } from 'react';
import type { OpportunityDTO } from '../api';
import { Card, DAY_MN, LEVEL_MN, useToast } from './shared';

function category(opp: OpportunityDTO): { icon: string; grad: string; tag: string } {
  const text = `${opp.title} ${opp.requiredSkills.join(' ')} ${opp.organizer}`.toLowerCase();
  if (/design|art|draw|paint|mural|ux|figma/.test(text)) return { icon: '🎨', grad: 'bg-sky-600', tag: '#Design' };
  if (/code|python|robot|stem|computer|app/.test(text)) return { icon: '💻', grad: 'bg-blue-700', tag: '#Coding' };
  if (/debate|speech|english|law|policy/.test(text)) return { icon: '🗣️', grad: 'bg-teal-600', tag: '#Debate' };
  if (/music|piano|choir|concert/.test(text)) return { icon: '🎵', grad: 'bg-amber-500', tag: '#Music' };
  if (/climate|tree|environment|volunteer|charity|community|reading/.test(text)) return { icon: '🌱', grad: 'bg-emerald-600', tag: '#Volunteering' };
  return { icon: '✨', grad: 'bg-slate-600', tag: '#Club' };
}

const LEVEL_STYLE: Record<string, string> = {
  School: 'bg-slate-500/15 text-slate-600',
  National: 'bg-sky-500/15 text-sky-700',
  Global: 'bg-blue-500/15 text-blue-700',
};

export default function OpportunityHub({ items }: { items: OpportunityDTO[] }) {
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const { toast, node } = useToast();

  return (
    <Card title="Боломжийн сан" subtitle="AI сонирхол, ур чадвар, чөлөөт цагт тань таарсан боломжуудыг л харуулна">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((o, idx) => {
          const cat = category(o);
          const isJoined = joined[o.id];
          return (
            <article
              key={o.id}
              className="lift animate-rise group relative overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-card"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`relative h-16 ${cat.grad}`}>
                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                  {cat.tag}
                </span>
                <span
                  className={`absolute -bottom-5 left-4 flex h-11 w-11 items-center justify-center rounded-2xl border-4 border-surface ${cat.grad} text-xl shadow-md`}
                  aria-hidden
                >
                  {cat.icon}
                </span>
              </div>

              <div className="px-4 pb-4 pt-7">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold leading-snug">{o.title}</h4>
                  <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                    🎯 {o.matchScore} нийц
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-muted">{o.organizer}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${LEVEL_STYLE[o.level] ?? ''}`}>{LEVEL_MN[o.level] ?? o.level}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-ok/40 bg-ok/10 px-2 py-0.5 text-[10px] font-bold text-ok">
                    🗓 Чөлөөт цаг: {DAY_MN[o.day]} {o.timeSlot.split('-')[0]}
                  </span>
                  {o.requiredSkills.slice(0, 2).map((s) => (
                    <span key={s} className="rounded-full bg-page px-2 py-0.5 text-[10px] font-semibold text-muted">🧠 {s}</span>
                  ))}
                </div>

                {o.matchReasonMongolian && (
                  <p className="mt-3 rounded-xl bg-page/80 px-3 py-2 text-[11px] leading-relaxed text-muted">
                    <span aria-hidden>🤖</span> {o.matchReasonMongolian}
                  </p>
                )}

                <button
                  className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isJoined
                      ? 'border border-ok/40 bg-ok/10 text-ok'
                      : 'bg-blue-700 text-white shadow-sm hover:bg-blue-800 hover:shadow-lift'
                  }`}
                  onClick={() => {
                    if (isJoined) return;
                    setJoined((j) => ({ ...j, [o.id]: true }));
                    toast(`"${o.title}" — бүртгэл амжилттай`);
                  }}
                >
                  {isJoined ? '✅ Бүртгэгдсэн' : 'Нэгдэх / Оролцох →'}
                </button>
              </div>
            </article>
          );
        })}
        {!items.length && (
          <p className="col-span-full rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            Одоогоор таны чөлөөт цагт багтах боломж олдсонгүй. About Me-гээ шинэчлэх эсвэл хуваарьтаа чөлөөт цаг нэмж үзээрэй.
          </p>
        )}
      </div>
      {node}
    </Card>
  );
}
