import { useCallback, useEffect, useState } from 'react';
import { DAYS } from '../../shared/types';
import { M, Q, type AnalysisDTO, type ClassRowDTO, type OpportunityDTO, type ScheduleItemDTO, type StudentDTO } from '../api';
import ScheduleGrid from './ScheduleGrid';
import { Card, CoachCard, DAY_MN, Pill, ScoreBadge, StatusIcon, scoreLevel, useToast } from './shared';

const LEVELS = ['School', 'National', 'Global'];

function MiniGauge({ score }: { score: number }) {
  const filled = Math.round(score);
  const level = scoreLevel(score);
  const color = level === 'ok' ? 'bg-ok' : level === 'warn' ? 'bg-warn' : 'bg-danger';
  return (
    <div className="flex items-center gap-1" aria-label={`Ачаалал ${score}/10`}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`h-4 w-1.5 rounded-full transition-all duration-300 ${i < filled ? color : 'bg-line'}`}
        />
      ))}
    </div>
  );
}

export default function TeacherView({ students, initialStudentId }: { students: StudentDTO[]; initialStudentId: string }) {
  const [rows, setRows] = useState<ClassRowDTO[]>([]);
  const [studentId, setStudentId] = useState(initialStudentId);
  const [analysis, setAnalysis] = useState<AnalysisDTO | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItemDTO[]>([]);
  const [opps, setOpps] = useState<OpportunityDTO[]>([]);
  const [aiBackend, setAiBackend] = useState('');

  const reload = useCallback(() => {
    Q.classWorkload().then((d) => setRows(d.classWorkload));
    Q.analysis(studentId).then((d) => { setAnalysis(d.workloadAnalysis); setAiBackend(d.aiBackend); });
    Q.schedule(studentId).then((d) => setSchedule(d.schedule));
    Q.opportunities().then((d) => setOpps(d.opportunities));
  }, [studentId]);

  useEffect(() => { reload(); }, [reload]);

  return (
    <div className="grid gap-5">
      <Card
        title="Workload Index — анги"
        subtitle="Gemma AI-ийн ачааллын оноо (1–10) · мөр дээр дарж сурагч сонгоно"
        actions={<Pill tone="info"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-ok" /></span> {aiBackend}</Pill>}
      >
        <div className="grid gap-2.5 md:grid-cols-2">
          {rows.map((r, i) => (
            <button
              key={r.studentId}
              onClick={() => setStudentId(r.studentId)}
              className={`lift animate-rise flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                r.studentId === studentId
                  ? 'border-accent/60 bg-accent/5 ring-4 ring-accent/10'
                  : 'border-line bg-surface'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-extrabold text-white shadow-sm">
                {r.studentName.split(' ')[0]?.[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{r.studentName}</span>
                <span className="block text-[11px] font-medium text-muted">{r.grade} · {r.status}</span>
              </span>
              <MiniGauge score={r.workloadScore} />
              <ScoreBadge score={r.workloadScore} />
              <Pill tone={r.stressRisk === 'High' ? 'bad' : r.stressRisk === 'Medium' ? 'info' : 'good'}>
                <StatusIcon level={r.stressRisk === 'High' ? 'danger' : r.stressRisk === 'Medium' ? 'warn' : 'ok'} /> {r.stressRisk}
              </Pill>
            </button>
          ))}
        </div>
      </Card>

      {analysis && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title={`AI зөвлөмж — ${analysis.studentName}`} subtitle="Давхцал болон хугацааны шийдвэрт туслах санал">
            <CoachCard>
              <p className="font-semibold">⚠️ Хугацаа сунгах / хуваарь:</p>
              <p className="mt-1">{analysis.teacherRecommendations.deadlineAdjustments}</p>
              <p className="mt-3 font-semibold">📖 Шалгалтын бэлтгэл:</p>
              <p className="mt-1">{analysis.teacherRecommendations.examPrepAdvice}</p>
            </CoachCard>
            {analysis.academicProgress.scheduleConflicts.length > 0 && (
              <ul className="mt-4 grid gap-2">
                {analysis.academicProgress.scheduleConflicts.map((c, i) => (
                  <li key={i} className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs">
                    <span className="font-bold"><StatusIcon level="warn" /> {c.examOrAssignment}</span>
                    <span className="ml-2 tabular-nums text-muted">{c.date}</span>
                    <p className="mt-1 leading-relaxed text-muted">{c.conflictDescriptionMongolian}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Сурагчийн хуваарь" subtitle="Давхцал шалгах нүд">
            <ScheduleGrid items={schedule} />
          </Card>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <PostWorkForm studentId={studentId} students={students} onPosted={reload} />
        <PostOpportunityForm onPosted={reload} />
      </div>

      <Card title="Opportunity Directory" subtitle="Нийтлэгдсэн боломжууд">
        <ul className="grid gap-2">
          {opps.map((o) => (
            <li key={o.id} className="lift flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <Pill tone={o.level === 'Global' ? 'good' : o.level === 'National' ? 'info' : 'neutral'}>{o.level}</Pill>
              <strong className="text-sm">{o.title}</strong>
              <span className="ml-auto text-xs font-medium text-muted">
                {o.organizer} · {DAY_MN[o.day]} {o.timeSlot} · {o.requiredSkills.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function PostWorkForm({ studentId, students, onPosted }: { studentId: string; students: StudentDTO[]; onPosted: () => void }) {
  const [mode, setMode] = useState<'assignment' | 'exam'>('assignment');
  const [sid, setSid] = useState(studentId);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const { toast, node } = useToast();

  useEffect(() => setSid(studentId), [studentId]);

  async function post() {
    if (!title.trim() || !subject.trim() || !date) return;
    if (mode === 'assignment') await M.createAssignment(sid, title.trim(), subject.trim(), date);
    else await M.createExam(sid, subject.trim(), date, time);
    setTitle(''); setSubject(''); setDate('');
    toast(mode === 'assignment' ? 'Даалгавар нийтлэгдлээ' : 'Шалгалт товлогдлоо');
    onPosted();
  }

  return (
    <Card title="Даалгавар / шалгалт нийтлэх" subtitle="Сурагчийн календарь шууд шинэчлэгдэнэ">
      <div className="seg mb-4 max-w-xs" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <span className="seg-indicator" style={{ width: 'calc((100% - 0.5rem)/2)', transform: `translateX(${mode === 'assignment' ? 0 : 100}%)` }} aria-hidden />
        <button className={`seg-btn ${mode === 'assignment' ? 'active' : ''}`} onClick={() => setMode('assignment')}>📚 Даалгавар</button>
        <button className={`seg-btn ${mode === 'exam' ? 'active' : ''}`} onClick={() => setMode('exam')}>📝 Шалгалт</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="label">Сурагч</span>
          <select className="field" value={sid} onChange={(e) => setSid(e.target.value)}>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {mode === 'assignment' && (
          <div>
            <span className="label">Гарчиг</span>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Calculus problem set 8" />
          </div>
        )}
        <div>
          <span className="label">Хичээл</span>
          <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Math" />
        </div>
        <div>
          <span className="label">{mode === 'assignment' ? 'Хугацаа (due date)' : 'Шалгалтын огноо'}</span>
          <input type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {mode === 'exam' && (
          <div>
            <span className="label">Цаг</span>
            <input type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <button className="btn-grad" onClick={post}>📨 Нийтлэх → сурагчийн хуваарьт</button>
      </div>
      {node}
    </Card>
  );
}

function PostOpportunityForm({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [skills, setSkills] = useState('');
  const [day, setDay] = useState('Saturday');
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('12:00');
  const [level, setLevel] = useState('School');
  const { toast, node } = useToast();

  async function post() {
    if (!title.trim() || !organizer.trim()) return;
    await M.createOpportunity({
      title: title.trim(),
      organizer: organizer.trim(),
      requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      day,
      timeSlot: `${start}-${end}`,
      level,
    });
    setTitle(''); setOrganizer(''); setSkills('');
    toast('Боломж нийтлэгдлээ');
    onPosted();
  }

  return (
    <Card title="Opportunity Directory-д нэмэх" subtitle="Ур чадвар · цаг · хамрах хүрээг тодорхойлно">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="label">Гарчиг</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer coding camp mentor" />
        </div>
        <div>
          <span className="label">Зохион байгуулагч</span>
          <input className="field" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder="NGO / Club / School" />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Шаардлагатай ур чадварууд</span>
          <input className="field" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, Public Speaking" />
        </div>
        <div>
          <span className="label">Өдөр</span>
          <select className="field" value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => <option key={d} value={d}>{DAY_MN[d]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Эхлэх</span>
            <input type="time" className="field" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <span className="label">Дуусах</span>
            <input type="time" className="field" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div>
          <span className="label">Хамрах хүрээ</span>
          <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <button className="btn-grad" onClick={post}>＋ Нийтлэх</button>
      </div>
      {node}
    </Card>
  );
}
