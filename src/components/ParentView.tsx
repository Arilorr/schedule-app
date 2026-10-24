import { useCallback, useEffect, useState } from 'react';
import { M, Q, type AnalysisDTO, type ScheduleItemDTO, type StudentDTO } from '../api';
import ScheduleGrid from './ScheduleGrid';
import { Card, CoachCard, Donut, Pill, RISK_MN, ScoreBadge, StatusIcon, fmtDate, riskLevel, useToast } from './shared';

export default function ParentView({ student }: { student: StudentDTO }) {
  const [schedule, setSchedule] = useState<ScheduleItemDTO[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisDTO | null>(null);
  const [verification, setVerification] = useState(student.parentVerification);
  const { toast, node } = useToast();

  const reload = useCallback(() => {
    Q.schedule(student.id).then((d) => setSchedule(d.schedule));
    Q.analysis(student.id).then((d) => setAnalysis(d.workloadAnalysis));
  }, [student.id]);

  useEffect(() => {
    setVerification(student.parentVerification);
    reload();
  }, [student, reload]);

  async function approve(approved: boolean) {
    const res = (await M.approveSchedule(student.id, approved)) as {
      approveSchedule: { parentVerification: typeof verification };
    };
    setVerification(res.approveSchedule.parentVerification);
    toast(approved ? 'Хуваарь баталгаажлаа' : 'Баталгаажуулалт цуцлагдлаа');
  }

  const progress = analysis?.academicProgress;

  return (
    <div className="grid grid-cols-1 gap-5">
      <Card
        title="1 · Хуваарь баталгаажуулалт"
        subtitle={`${student.name} — долоо хоногийн хуваарийг шалгаад зөвшөөрнө үү`}
        actions={
          verification.isScheduleApproved ? (
            <Pill tone="good"><StatusIcon level="ok" /> Зөвшөөрсөн · {verification.approvedDate ?? ''}</Pill>
          ) : (
            <Pill tone="bad"><StatusIcon level="warn" /> Хүлээгдэж байна</Pill>
          )
        }
      >
        <ScheduleGrid items={schedule} />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="btn-grad"
            disabled={verification.isScheduleApproved}
            onClick={() => approve(true)}
          >
            ✅ Зөвшөөрөх
          </button>
          <button
            className="btn-danger"
            disabled={!verification.isScheduleApproved}
            onClick={() => approve(false)}
          >
            🔴 Зөвшөөрөл цуцлах
          </button>
        </div>
      </Card>

      {analysis && progress && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="2 · Бодит цагийн дэвшил" subtitle="Даалгаврын биелэлт шууд шинэчлэгдэнэ">
            <div className="flex items-center gap-6">
              <Donut pct={progress.completionPercentage} label="Биелэлт" />
              <div className="grid grid-cols-1 gap-2 text-sm">
                <p className="font-semibold">
                  {progress.completedAssignments}<span className="text-muted">/{progress.totalAssignments} даалгавар дууссан</span>
                </p>
                <p className="flex items-center gap-2 font-semibold">
                  Удахгүй шалгалт: {progress.upcomingExamsCount}
                  {progress.upcomingExamsCount > 0 && <span aria-hidden>🔔</span>}
                </p>
                <p className="flex items-center gap-2">
                  Ачаалал: <ScoreBadge score={analysis.workloadAnalysis.workloadScore} />
                </p>
                <Pill tone={analysis.workloadAnalysis.stressRisk === 'High' ? 'bad' : analysis.workloadAnalysis.stressRisk === 'Medium' ? 'info' : 'good'}>
                  Стрессийн эрсдэл: {RISK_MN[analysis.workloadAnalysis.stressRisk] ?? analysis.workloadAnalysis.stressRisk} <StatusIcon level={riskLevel(analysis.workloadAnalysis.stressRisk)} />
                </Pill>
              </div>
            </div>
            {progress.scheduleConflicts.length > 0 && (
              <ul className="mt-4 grid grid-cols-1 gap-2">
                {progress.scheduleConflicts.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
                    <StatusIcon level="warn" /> {c.examOrAssignment} — {fmtDate(c.date)}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="3 · AI долоо хоногийн тойм" subtitle="Эцэг эхэд зориулсан ээлтэй тайлбар">
            <CoachCard>
              <span className="font-medium">🇲🇳 {analysis.parentReport.progressSummaryMongolian}</span>
            </CoachCard>
            <div className="mt-4 rounded-xl bg-page/80 p-3.5 text-xs leading-relaxed text-muted">
              <p className="mb-1 font-bold uppercase tracking-widest text-accent">AI зөвлөмж</p>
              {analysis.workloadAnalysis.aiSummaryMongolian}
            </div>
          </Card>
        </div>
      )}
      {node}
    </div>
  );
}
