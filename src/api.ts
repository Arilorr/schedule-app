const ENDPOINT = '/graphql';

export async function gql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

export const Q = {
  students: () => gql<{ students: StudentDTO[] }>(
    `{ students { id name grade school aboutMe { interests skills careerGoals } parentVerification { isScheduleApproved approvedDate } } }`,
  ),
  schedule: (studentId: string) => gql<{ schedule: ScheduleItemDTO[] }>(
    `query ($id: ID!) { schedule(studentId: $id) { id studentId day timeSlot activity isFreeSlot } }`,
    { id: studentId },
  ),
  assignments: (studentId: string) => gql<{ assignments: AssignmentDTO[] }>(
    `query ($id: ID!) { assignments(studentId: $id) { id studentId title subject dueDate isCompleted } }`,
    { id: studentId },
  ),
  exams: (studentId: string) => gql<{ exams: ExamDTO[] }>(
    `query ($id: ID!) { exams(studentId: $id) { id studentId subject examDate time } }`,
    { id: studentId },
  ),
  opportunities: () => gql<{ opportunities: OpportunityDTO[] }>(
    `{ opportunities { id title organizer requiredSkills day timeSlot level } }`,
  ),
  matched: (studentId: string) => gql<{ matchedOpportunities: OpportunityDTO[] }>(
    `query ($id: ID!) { matchedOpportunities(studentId: $id) { id title organizer requiredSkills day timeSlot level matchScore matchReasonMongolian } }`,
    { id: studentId },
  ),
  analysis: (studentId: string) => gql<{ workloadAnalysis: AnalysisDTO; aiBackend: string }>(
    `query ($id: ID!) {
      aiBackend
      workloadAnalysis(studentId: $id) {
        studentName
        workloadAnalysis { workloadScore status stressRisk aiSummaryMongolian }
        academicProgress { totalAssignments completedAssignments completionPercentage upcomingExamsCount scheduleConflicts { examOrAssignment date conflictDescriptionMongolian } }
        matchedOpportunities { opportunityId title matchScore matchReasonMongolian }
        teacherRecommendations { deadlineAdjustments examPrepAdvice }
        parentReport { progressSummaryMongolian }
        weeklyScheduleSummary { totalActivityHours scheduledItems }
      }
    }`,
    { id: studentId },
  ),
  classWorkload: () => gql<{ classWorkload: ClassRowDTO[] }>(
    `{ classWorkload { studentId studentName grade workloadScore status stressRisk } }`,
  ),
  aiBackend: () => gql<{ aiBackend: string }>(`{ aiBackend }`),
};

export const M = {
  updateAboutMe: (studentId: string, interests: string[], skills: string[], careerGoals: string[]) =>
    gql(`mutation ($id: ID!, $i: [String!]!, $s: [String!]!, $c: [String!]!) {
      updateAboutMe(studentId: $id, interests: $i, skills: $s, careerGoals: $c) { id aboutMe { interests skills careerGoals } }
    }`, { id: studentId, i: interests, s: skills, c: careerGoals }),
  addScheduleItem: (studentId: string, day: string, timeSlot: string, activity: string) =>
    gql(`mutation ($id: ID!, $day: Day!, $slot: String!, $act: String!) {
      addScheduleItem(studentId: $id, day: $day, timeSlot: $slot, activity: $act) { id }
    }`, { id: studentId, day, slot: timeSlot, act: activity }),
  removeScheduleItem: (id: string) =>
    gql(`mutation ($id: ID!) { removeScheduleItem(id: $id) }`, { id }),
  approveSchedule: (studentId: string, approved: boolean) =>
    gql(`mutation ($id: ID!, $ok: Boolean!) {
      approveSchedule(studentId: $id, approved: $ok) { id parentVerification { isScheduleApproved approvedDate } }
    }`, { id: studentId, ok: approved }),
  toggleAssignment: (id: string, isCompleted: boolean) =>
    gql(`mutation ($id: ID!, $done: Boolean!) { toggleAssignment(id: $id, isCompleted: $done) { id } }`, { id, done: isCompleted }),
  createAssignment: (studentId: string, title: string, subject: string, dueDate: string) =>
    gql(`mutation ($id: ID!, $t: String!, $s: String!, $d: String!) {
      createAssignment(studentId: $id, title: $t, subject: $s, dueDate: $d) { id }
    }`, { id: studentId, t: title, s: subject, d: dueDate }),
  createExam: (studentId: string, subject: string, examDate: string, time: string) =>
    gql(`mutation ($id: ID!, $s: String!, $d: String!, $t: String!) {
      createExam(studentId: $id, subject: $s, examDate: $d, time: $t) { id }
    }`, { id: studentId, s: subject, d: examDate, t: time }),
  createOpportunity: (args: { title: string; organizer: string; requiredSkills: string[]; day: string; timeSlot: string; level: string }) =>
    gql(`mutation ($a: String!, $o: String!, $sk: [String!]!, $d: Day!, $ts: String!, $lv: OpportunityLevel!) {
      createOpportunity(title: $a, organizer: $o, requiredSkills: $sk, day: $d, timeSlot: $ts, level: $lv) { id }
    }`, { a: args.title, o: args.organizer, sk: args.requiredSkills, d: args.day, ts: args.timeSlot, lv: args.level }),
};

export interface ScheduleItemDTO {
  id: string; studentId: string; day: string; timeSlot: string; activity: string; isFreeSlot: boolean;
}
export interface AssignmentDTO {
  id: string; studentId: string; title: string; subject: string; dueDate: string; isCompleted: boolean;
}
export interface ExamDTO { id: string; studentId: string; subject: string; examDate: string; time: string }
export interface OpportunityDTO {
  id: string; title: string; organizer: string; requiredSkills: string[];
  day: string; timeSlot: string; level: string; matchScore?: string; matchReasonMongolian?: string;
}
export interface AnalysisDTO {
  studentName: string;
  workloadAnalysis: { workloadScore: number; status: string; stressRisk: string; aiSummaryMongolian: string };
  academicProgress: {
    totalAssignments: number; completedAssignments: number; completionPercentage: number;
    upcomingExamsCount: number;
    scheduleConflicts: { examOrAssignment: string; date: string; conflictDescriptionMongolian: string }[];
  };
  matchedOpportunities: { opportunityId: string; title: string; matchScore: string; matchReasonMongolian: string }[];
  teacherRecommendations: { deadlineAdjustments: string; examPrepAdvice: string };
  parentReport: { progressSummaryMongolian: string };
  weeklyScheduleSummary: { totalActivityHours: number; scheduledItems: number };
}
export interface ClassRowDTO {
  studentId: string; studentName: string; grade: string;
  workloadScore: number; status: string; stressRisk: string;
}
export interface StudentDTO {
  id: string; name: string; grade: string; school: string;
  aboutMe: { interests: string[]; skills: string[]; careerGoals: string[] };
  parentVerification: { isScheduleApproved: boolean; approvedDate?: string };
}
