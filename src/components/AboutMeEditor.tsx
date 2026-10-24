import { useState } from 'react';
import { DAYS } from '../../shared/types';
import { M, type StudentDTO } from '../api';
import { useA11y } from '../accessibility';
import { Card, DAY_MN, useToast } from './shared';

function TagEditor({
  label,
  placeholder,
  icon,
  tone,
  initial,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon: string;
  tone: 'interest' | 'skill' | 'goal';
  initial: string[];
  onChange: (next: string[]) => void;
}) {
  const [tags, setTags] = useState(initial);
  const [draft, setDraft] = useState('');
  const { voiceInput } = useA11y();
  const voice = voiceInput((text) => add(text.trim()));

  const toneCls =
    tone === 'interest'
      ? 'border-blue-300 bg-blue-500/10 text-blue-700'
      : tone === 'skill'
        ? 'border-sky-300 bg-sky-500/10 text-sky-700'
        : 'border-emerald-300 bg-emerald-500/10 text-emerald-700';

  function add(raw: string) {
    const value = raw && tone === 'interest' && !raw.startsWith('#') ? `#${raw.replace(/\s+/g, '')}` : raw;
    if (!value || tags.includes(value)) return;
    const next = [...tags, value];
    setTags(next);
    onChange(next);
    setDraft('');
  }

  function remove(value: string) {
    const next = tags.filter((t) => t !== value);
    setTags(next);
    onChange(next);
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-2.5">
        {tags.map((t) => (
          <span
            key={t}
            className={`animate-pop inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-150 hover:shadow-sm ${toneCls}`}
          >
            <span aria-hidden>{icon}</span>
            {t}
            <button
              className="ml-0.5 rounded-full p-0.5 leading-none opacity-60 transition-all hover:bg-black/10 hover:opacity-100"
              onClick={() => remove(t)}
              aria-label={`${t} хасах`}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          className="min-w-[10rem] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted/60"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft.trim());
            }
          }}
        />
        {tone === 'interest' && (
          <button type="button" className="rounded-lg border border-line px-2 py-1 text-sm transition-all hover:border-accent hover:shadow-sm" onClick={voice.start} title="Дуугаар оруулах (Speech-to-Text)">
            🎤
          </button>
        )}
      </div>
    </div>
  );
}

export default function AboutMeEditor({ student, onSaved }: { student: StudentDTO; onSaved: () => void }) {
  const [interests, setInterests] = useState(student.aboutMe.interests);
  const [skills, setSkills] = useState(student.aboutMe.skills);
  const [goals, setGoals] = useState(student.aboutMe.careerGoals);
  const [saving, setSaving] = useState(false);
  const { toast, node } = useToast();

  async function save() {
    setSaving(true);
    try {
      await M.updateAboutMe(student.id, interests, skills, goals);
      toast('About Me хадгалагдлаа');
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="About Me" subtitle="Сонирхол · ур чадвар · зорилго — AI эдгээрт үндэслэн боломж санал болгоно">
      <div className="grid grid-cols-1 gap-4">
        <TagEditor label="Сонирхол (interests)" placeholder="#DigitalArt гэж бичээд Enter" icon="💜" tone="interest" initial={student.aboutMe.interests} onChange={setInterests} />
        <TagEditor label="Ур чадвар (skills)" placeholder="Python, Graphic Design…" icon="🧠" tone="skill" initial={student.aboutMe.skills} onChange={setSkills} />
        <TagEditor label="Ажлын зорилго (career goals)" placeholder="UX Designer…" icon="🎯" tone="goal" initial={student.aboutMe.careerGoals} onChange={setGoals} />
      </div>
      <div className="mt-5">
        <button className="btn-grad" disabled={saving} onClick={save}>
          {saving ? 'Хадгалж байна…' : '💾 Хадгалах'}
        </button>
      </div>
      {node}
    </Card>
  );
}

export function AddScheduleForm({ studentId, onAdded }: { studentId: string; onAdded: () => void }) {
  const [day, setDay] = useState<string>('Monday');
  const [start, setStart] = useState('16:00');
  const [end, setEnd] = useState('17:30');
  const [activity, setActivity] = useState('');
  const [error, setError] = useState('');
  const { voiceInput } = useA11y();
  const { toast, node } = useToast();
  const voice = voiceInput((text) => setActivity(text.trim()));

  async function add() {
    setError('');
    if (!activity.trim()) return setError('Үйл ажиллагааны нэрээ оруулна уу.');
    if (start >= end) return setError('Эхлэх цаг дуусах цагаас өмнө байх ёстой.');
    await M.addScheduleItem(studentId, day, `${start}-${end}`, activity.trim());
    setActivity('');
    toast('Хуваарьт нэмэгдлээ — эцэг эхийн баталгаажуулалт шинэчлэгдэнэ');
    onAdded();
  }

  return (
    <Card title="Үйл ажиллагаа нэмэх" subtitle="Үлдсэн чөлөөт цагийг систем автоматаар тооцоолж тэмдэглэнэ">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="label">Өдөр</span>
          <select className="field" value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => (
              <option key={d} value={d}>{DAY_MN[d]} · {d}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">Эхлэх</span>
          <input type="time" className="field" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <span className="label">Дуусах</span>
          <input type="time" className="field" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <span className="label">Үйл ажиллагаа</span>
          <div className="flex gap-2">
            <input className="field" value={activity} placeholder="Жүдо бэлтгэл…" onChange={(e) => setActivity(e.target.value)} />
            <button type="button" className="btn-soft shrink-0 px-3" onClick={voice.start} title="Дуугаар оруулах">🎤</button>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">
          ⚠️ {error}
        </p>
      )}
      <div className="mt-4">
        <button className="btn-grad" onClick={add}>＋ Хуваарьт нэмэх</button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        Хуваарь өөрчлөгдвөл эцэг эхийн өмнөх зөвшөөрөл автоматаар цуцлагдана.
      </p>
      {node}
    </Card>
  );
}
