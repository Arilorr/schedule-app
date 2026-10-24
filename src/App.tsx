import { useEffect, useState } from 'react';
import { Q, type StudentDTO } from './api';
import { A11yProvider, useA11y } from './accessibility';
import StudentView from './components/StudentView';
import ParentView from './components/ParentView';
import TeacherView from './components/TeacherView';

type Role = 'student' | 'parent' | 'teacher';

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: 'student', label: 'Сурагч', icon: '🎓' },
  { id: 'parent', label: 'Эцэг эх', icon: '👪' },
  { id: 'teacher', label: 'Багш', icon: '🧑‍🏫' },
];

function Shell() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [aiBackend, setAiBackend] = useState('');
  const { highContrast, colorblind, dyslexiaFont, toggle } = useA11y();

  useEffect(() => {
    Q.students().then((d) => {
      setStudents(d.students);
      setStudentId((cur) => cur || d.students[0]?.id || '');
    });
    Q.aiBackend().then((d) => setAiBackend(d.aiBackend));
  }, []);

  const student = students.find((s) => s.id === studentId);
  const roleIdx = ROLES.findIndex((r) => r.id === role);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="glass sticky top-4 z-40 mb-6 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-lg shadow-md">
              <span aria-hidden>⚖️</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight">
                erxes <span className="text-blue-700">BalanceEd</span>
              </h1>
              <p className="truncate text-[11px] font-medium text-muted">
                Сурагчийн ачааллыг тэнцвэржүүлэх EdTech plugin
              </p>
            </div>
          </div>

          <div className="seg mx-auto w-full max-w-md" role="tablist" aria-label="Үүрэг сонгох">
            <span
              className="seg-indicator"
              style={{ transform: `translateX(${roleIdx * 100}%)` }}
              aria-hidden
            />
            {ROLES.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={role === r.id}
                className={`seg-btn ${role === r.id ? 'active' : ''}`}
                onClick={() => setRole(r.id)}
              >
                <span aria-hidden className="mr-1.5">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-3 py-1.5 text-[11px] font-bold text-ok sm:inline-flex" title={`AI backend: ${aiBackend}`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
              </span>
              Live AI Sync
            </span>

            <label className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span className="hidden md:inline">Сурагч</span>
              <select className="field w-44 py-1.5" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} · {s.grade}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-widest text-muted">Хүртээмж</span>
          <button
            className={`chip cursor-pointer transition-all duration-200 hover:border-accent/60 hover:shadow-sm ${highContrast ? 'border-accent bg-accent/10 text-accent' : ''}`}
            onClick={() => toggle('highContrast')}
            aria-pressed={highContrast}
            title="Өндөр контраст (High Contrast)"
          >
            ◐ Өндөр контраст
          </button>
          <button
            className={`chip cursor-pointer transition-all duration-200 hover:border-accent/60 hover:shadow-sm ${colorblind ? 'border-accent bg-accent/10 text-accent' : ''}`}
            onClick={() => toggle('colorblind')}
            aria-pressed={colorblind}
            title="Өнгө ялгахад ээлтэй горим — бүх төлөв ✅ ⚠️  тэмдэгтээр давхар харагдана"
          >
            ⚠️ Өнгөний сохорт ээлтэй
          </button>
          <button
            className={`chip cursor-pointer transition-all duration-200 hover:border-accent/60 hover:shadow-sm ${dyslexiaFont ? 'border-accent bg-accent/10 text-accent' : ''}`}
            onClick={() => toggle('dyslexiaFont')}
            aria-pressed={dyslexiaFont}
            title="Дислексид ээлтэй фонт"
          >
            Aa Дислекси фонт
          </button>
          <span className="ml-auto hidden text-[11px] text-muted lg:inline">AI: {aiBackend}</span>
        </div>
      </header>

      {student && (
        <main key={`${role}-${student.id}`} className="animate-rise">
          {role === 'student' && <StudentView student={student} />}
          {role === 'parent' && <ParentView student={student} />}
          {role === 'teacher' && <TeacherView students={students} initialStudentId={student.id} />}
        </main>
      )}

      {!student && (
        <div className="glass p-10 text-center text-muted">Ачаалж байна…</div>
      )}

      <footer className="mt-10 text-center text-xs text-muted">
        erxes BalanceEd · MIT licensed · Gemma (Google AI Studio) + built-in analytics fallback
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <A11yProvider>
      <Shell />
    </A11yProvider>
  );
}
