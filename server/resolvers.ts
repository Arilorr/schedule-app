import { db } from './db.js';
import {
  buildClassWorkload,
  buildWorkloadAnalysis,
  computeFreeSlots,
  matchOpportunities,
} from './ai/analysis.js';
import { gemmaEnabled } from './ai/gemma.js';
import { DAYS } from '../shared/types.js';
import type { Day, WeeklyScheduleItem } from '../shared/types.js';

function requireStudent(studentId: string) {
  const student = db.students.byId(studentId);
  if (!student) throw new Error(`Student not found: ${studentId}`);
  return student;
}

const SLOT_RE = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

function validateSlot(timeSlot: string) {
  if (!SLOT_RE.test(timeSlot)) throw new Error(`Invalid timeSlot "${timeSlot}", expected HH:MM-HH:MM`);
  const [a, b] = timeSlot.split('-');
  if (a >= b) throw new Error(`Invalid timeSlot "${timeSlot}": start must be before end`);
}

function fullSchedule(studentId: string): WeeklyScheduleItem[] {
  const stored = db.schedule.find((s) => s.studentId === studentId && !s.isFreeSlot);
  const free = computeFreeSlots(studentId);
  const dayIdx = (d: Day) => DAYS.indexOf(d);
  return [...stored, ...free].sort(
    (a, b) => dayIdx(a.day) - dayIdx(b.day) || a.timeSlot.localeCompare(b.timeSlot),
  );
}

export const resolvers = {
  Query: {
    students: () => db.students.all(),
    student: (_: unknown, { id }: { id: string }) => db.students.byId(id) ?? null,
    schedule: (_: unknown, { studentId }: { studentId: string }) => fullSchedule(studentId),
    freeSlots: (_: unknown, { studentId }: { studentId: string }) => computeFreeSlots(studentId),
    assignments: (_: unknown, { studentId }: { studentId: string }) =>
      db.assignments
        .find((a) => a.studentId === studentId)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    exams: (_: unknown, { studentId }: { studentId: string }) =>
      db.exams
        .find((e) => e.studentId === studentId)
        .sort((a, b) => a.examDate.localeCompare(b.examDate)),
    opportunities: () => db.opportunities.all(),
    matchedOpportunities: (_: unknown, { studentId }: { studentId: string }) =>
      matchOpportunities(requireStudent(studentId)),
    workloadAnalysis: async (_: unknown, { studentId }: { studentId: string }) =>
      buildWorkloadAnalysis(requireStudent(studentId)),
    classWorkload: () => buildClassWorkload(),
    aiBackend: () =>
      gemmaEnabled ? `gemma (${process.env.GEMMA_MODEL || 'gemma-3-27b-it'})` : 'built-in heuristic engine',
  },

  Mutation: {
    updateAboutMe: (
      _: unknown,
      { studentId, interests, skills, careerGoals }: { studentId: string; interests: string[]; skills: string[]; careerGoals: string[] },
    ) => {
      requireStudent(studentId);
      return db.students.update(studentId, { aboutMe: { interests, skills, careerGoals } })!;
    },

    addScheduleItem: (
      _: unknown,
      { studentId, day, timeSlot, activity }: { studentId: string; day: Day; timeSlot: string; activity: string },
    ) => {
      requireStudent(studentId);
      validateSlot(timeSlot);
      // Any schedule change invalidates prior parent verification.
      db.students.update(studentId, { parentVerification: { isScheduleApproved: false } });
      return db.schedule.insert({ studentId, day, timeSlot, activity, isFreeSlot: false }, 'sch');
    },

    removeScheduleItem: (_: unknown, { id }: { id: string }) => {
      const item = db.schedule.byId(id);
      if (!item) return false;
      db.students.update(item.studentId, { parentVerification: { isScheduleApproved: false } });
      return db.schedule.remove(id);
    },

    approveSchedule: (_: unknown, { studentId, approved }: { studentId: string; approved: boolean }) => {
      requireStudent(studentId);
      return db.students.update(studentId, {
        parentVerification: {
          isScheduleApproved: approved,
          approvedDate: approved ? new Date().toISOString().slice(0, 10) : undefined,
        },
      })!;
    },

    toggleAssignment: (_: unknown, { id, isCompleted }: { id: string; isCompleted: boolean }) =>
      db.assignments.update(id, { isCompleted }) ?? null,

    createAssignment: (
      _: unknown,
      { studentId, title, subject, dueDate }: { studentId: string; title: string; subject: string; dueDate: string },
    ) => {
      requireStudent(studentId);
      return db.assignments.insert({ studentId, title, subject, dueDate, isCompleted: false }, 'asg');
    },

    deleteAssignment: (_: unknown, { id }: { id: string }) => db.assignments.remove(id),

    createExam: (
      _: unknown,
      { studentId, subject, examDate, time }: { studentId: string; subject: string; examDate: string; time: string },
    ) => {
      requireStudent(studentId);
      return db.exams.insert({ studentId, subject, examDate, time }, 'exm');
    },

    deleteExam: (_: unknown, { id }: { id: string }) => db.exams.remove(id),

    createOpportunity: (
      _: unknown,
      args: { title: string; organizer: string; requiredSkills: string[]; day: Day; timeSlot: string; level: 'School' | 'National' | 'Global' },
    ) => {
      validateSlot(args.timeSlot);
      return db.opportunities.insert(args, 'opp');
    },

    deleteOpportunity: (_: unknown, { id }: { id: string }) => db.opportunities.remove(id),
  },
};
