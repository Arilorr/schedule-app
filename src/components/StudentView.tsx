import { useCallback, useEffect, useState } from 'react';
import { M, Q, type AnalysisDTO, type AssignmentDTO, type ExamDTO, type OpportunityDTO, type ScheduleItemDTO, type StudentDTO } from '../api';
import AboutMeEditor, { AddScheduleForm } from './AboutMeEditor';
import AnalysisPanel from './AnalysisPanel';
import AssignmentsPanel from './AssignmentsPanel';
import OpportunityHub from './OpportunityHub';
import ScheduleGrid from './ScheduleGrid';
import { Card, Donut, GaugeDial, StatusIcon } from './shared';

type Tab = 'schedule' | 'academics' | 'opportunities' | 'analysis' | 'aboutme';

const TABS: { id: Tab; label: string }[] = [
  { id: 'schedule', label: '🗓 Хуваарь' },
  { id: 'academics', label: '📚 Даалгавар & шалгалт' },
  { id: 'opportunities', label: '🎯 Боломжууд' },
  { id: 'analysis', label: '🤖 AI шинжилгээ' },
  { id: 'aboutme', label: '👤 About Me' },
];

export default function StudentView({ student }: { student: StudentDTO }) {
  const [tab, setTab] = useState<Tab>('schedule');
  const [schedule, setSchedule] = useState<ScheduleItemDTO[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [exams, setExams] = useState<ExamDTO[]>([]);
  const [matched, setMatched] = useState<OpportunityDTO[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisDTO | null>(null);
  const [verified, setVerified] = useState(student.parentVerification);

  const reload = useCallback(() => {
    Q.schedule(student.id).then((d) => setSchedule(d.schedule));
    Q.assignments(student.id).then((d) => setAssignments(d.assignments));
    Q.exams(student.id).then((d) => setExams(d.exams));
    Q.matched(student.id).then((d) => setMatched(d.matchedOpportunities));
    Q.analysis(student.id).then((d) => setAnalysis(d.workloadAnalysis));
  }, [student.id]);

  useEffect(() => {
    setVerified(student.parentVerification);
    reload();
  }, [student, reload]);

  async function removeItem(id: string) {
    await M.removeScheduleItem(id);
    setVerified({ isScheduleApproved: false });
    reload();
  }

  const pct = assignments.length
    ? Math.round((assignments.filter((a) => a.isCompleted).length / assignments.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Hero */}
      <section className="glass relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/10 to-sky-400/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">Сайн уу, {student.name.split(' ')[0]}! 👋</h2>
              {verified.isScheduleApproved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/40 bg-ok/10 px-2.5 py-1 text-[11px] font-bold text-ok">
                  <StatusIcon level="ok" /> Эцэг эх зөвшөөрсөн · {verified.approvedDate}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11px] font-bold text-warn">
                  <StatusIcon level="warn" /> Эцэг эхийн баталгаажуулалт хүлээгдэж байна
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-muted">
              {student.grade} · {student.school} · {student.aboutMe.interests.slice(0, 3).join(' ')}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Donut pct={pct} size={84} />
              <div className="text-xs font-semibold text-muted">
                <p className="text-ink">{assignments.filter((a) => a.isCompleted).length}/{assignments.length} даалгавар</p>
                <p>гүйцэтгэсэн</p>
              </div>
            </div>
            {analysis && (
              <div className="hidden scale-90 sm:block">
                <GaugeDial score={analysis.workloadAnalysis.workloadScore} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2" aria-label="Сурагчийн цэс">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === t.id
                ? 'bg-blue-700 text-white shadow-md'
                : 'border border-line bg-surface/70 text-muted hover:-translate-y-px hover:border-accent/50 hover:text-ink hover:shadow-sm'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div key={tab} className="animate-rise grid grid-cols-1 gap-5">
        {tab === 'schedule' && (
          <>
            <Card title="Долоо хоногийн хуваарь" subtitle="Бүртгэгдээгүй үлдсэн цагууд автоматаар чөлөөт цаг болж тэмдэглэгдэнэ">
              <ScheduleGrid items={schedule} editable onRemove={removeItem} />
            </Card>
            <AddScheduleForm studentId={student.id} onAdded={reload} />
          </>
        )}

        {tab === 'academics' && (
          <AssignmentsPanel assignments={assignments} exams={exams} onChanged={reload} />
        )}

        {tab === 'opportunities' && <OpportunityHub items={matched} />}

        {tab === 'analysis' && analysis && <AnalysisPanel analysis={analysis} />}

        {tab === 'aboutme' && <AboutMeEditor student={student} onSaved={reload} />}
      </div>
    </div>
  );
}
