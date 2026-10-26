import type {
  Assignment,
  Exam,
  Opportunity,
  StudentProfile,
  WeeklyScheduleItem,
} from '../shared/types.js';

/**
 * Standalone demo store. When deployed inside erxes these collections map
 * 1:1 to mongoose models (see README "erxes deployment"); resolver shapes
 * are identical, so only this module is swapped out.
 */

class Collection<T extends { id: string }> {
  private rows = new Map<string, T>();
  private seq = 0;

  constructor(seed: T[], prefix: string) {
    for (const row of seed) {
      const id = row.id ?? (`${prefix}_${++this.seq}` as string);
      this.rows.set(id, { ...row, id });
    }
  }

  all(): T[] {
    return [...this.rows.values()];
  }

  find(predicate: (row: T) => boolean): T[] {
    return this.all().filter(predicate);
  }

  byId(id: string): T | undefined {
    return this.rows.get(id);
  }

  insert(row: Omit<T, 'id'>, prefix: string): T {
    const id = `${prefix}_${Date.now().toString(36)}_${++this.seq}`;
    const created = { ...row, id } as T;
    this.rows.set(id, created);
    return created;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.rows.get(id);
    if (!existing) return undefined;
    const next = { ...existing, ...patch, id };
    this.rows.set(id, next);
    return next;
  }

  remove(id: string): boolean {
    return this.rows.delete(id);
  }
}

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const students = new Collection<StudentProfile>(
  [
    {
      id: 'stu_1',
      name: 'Батбаяр Ганбаатар',
      grade: '11-B',
      school: 'School No. 5, Ulaanbaatar',
      aboutMe: {
        interests: ['#DigitalArt', '#Design', '#Robotics'],
        skills: ['Graphic Design', 'Python', 'Drawing'],
        careerGoals: ['UX Designer', 'Game Artist'],
      },
      parentVerification: { isScheduleApproved: true, approvedDate: isoDate(-3) },
    },
    {
      id: 'stu_2',
      name: 'Сарангэрэл Бат-Эрдэнэ',
      grade: '11-B',
      school: 'School No. 5, Ulaanbaatar',
      aboutMe: {
        interests: ['#Debate', '#Environment', '#Music'],
        skills: ['Public Speaking', 'English', 'Piano'],
        careerGoals: ['Lawyer', 'Policy Analyst'],
      },
      parentVerification: { isScheduleApproved: false },
    },
  ],
  'stu',
);

const schedule = new Collection<WeeklyScheduleItem>(
  [
    // Батбаяр — heavy week (drives a High workload demo)
    { id: 'sch_1', studentId: 'stu_1', day: 'Monday', timeSlot: '15:00-17:00', activity: 'Basketball practice', isFreeSlot: false },
    { id: 'sch_2', studentId: 'stu_1', day: 'Monday', timeSlot: '18:00-19:30', activity: 'Math tutoring', isFreeSlot: false },
    { id: 'sch_3', studentId: 'stu_1', day: 'Tuesday', timeSlot: '16:00-18:00', activity: 'Robotics club', isFreeSlot: false },
    { id: 'sch_4', studentId: 'stu_1', day: 'Wednesday', timeSlot: '15:00-17:00', activity: 'Basketball practice', isFreeSlot: false },
    { id: 'sch_5', studentId: 'stu_1', day: 'Thursday', timeSlot: '17:00-19:00', activity: 'Art class', isFreeSlot: false },
    { id: 'sch_6', studentId: 'stu_1', day: 'Friday', timeSlot: '16:00-18:00', activity: 'Babysitting (part-time)', isFreeSlot: false },
    { id: 'sch_7', studentId: 'stu_1', day: 'Saturday', timeSlot: '10:00-12:00', activity: 'Tournament prep', isFreeSlot: false },
    // Сарангэрэл — balanced week
    { id: 'sch_8', studentId: 'stu_2', day: 'Tuesday', timeSlot: '17:00-18:30', activity: 'Debate club', isFreeSlot: false },
    { id: 'sch_9', studentId: 'stu_2', day: 'Thursday', timeSlot: '16:00-17:30', activity: 'Piano lesson', isFreeSlot: false },
    { id: 'sch_10', studentId: 'stu_2', day: 'Saturday', timeSlot: '10:00-12:00', activity: 'Volunteer: tree planting', isFreeSlot: false },
  ],
  'sch',
);

const assignments = new Collection<Assignment>(
  [
    { id: 'asg_1', studentId: 'stu_1', title: 'Calculus problem set 7', subject: 'Math', dueDate: isoDate(2), isCompleted: false },
    { id: 'asg_2', studentId: 'stu_1', title: 'Photoshop poster project', subject: 'Art', dueDate: isoDate(4), isCompleted: true },
    { id: 'asg_3', studentId: 'stu_1', title: 'Physics lab report: optics', subject: 'Physics', dueDate: isoDate(5), isCompleted: false },
    { id: 'asg_4', studentId: 'stu_1', title: 'English essay: dystopian novels', subject: 'English', dueDate: isoDate(7), isCompleted: true },
    { id: 'asg_5', studentId: 'stu_1', title: 'Python snake game milestone 2', subject: 'Computer Science', dueDate: isoDate(9), isCompleted: false },
    { id: 'asg_6', studentId: 'stu_2', title: 'Civics case brief', subject: 'Social Studies', dueDate: isoDate(3), isCompleted: true },
    { id: 'asg_7', studentId: 'stu_2', title: 'Biology diagram worksheet', subject: 'Biology', dueDate: isoDate(6), isCompleted: false },
    { id: 'asg_8', studentId: 'stu_2', title: 'Debate prep: resolution 12', subject: 'English', dueDate: isoDate(8), isCompleted: false },
  ],
  'asg',
);

const exams = new Collection<Exam>(
  [
    { id: 'exm_1', studentId: 'stu_1', subject: 'Math', examDate: isoDate(3), time: '09:00' },
    { id: 'exm_2', studentId: 'stu_1', subject: 'Physics', examDate: isoDate(10), time: '11:00' },
    { id: 'exm_3', studentId: 'stu_2', subject: 'Biology', examDate: isoDate(6), time: '10:00' },
  ],
  'exm',
);

const opportunities = new Collection<Opportunity>(
  [
    { id: 'opp_1', title: 'School mural design team', organizer: 'School No. 5 Art Dept', requiredSkills: ['Graphic Design', 'Drawing'], day: 'Wednesday', timeSlot: '17:30-19:00', level: 'School' },
    { id: 'opp_2', title: 'National Robotics Showcase', organizer: 'Mongolia STEM Foundation', requiredSkills: ['Python', 'Robotics'], day: 'Saturday', timeSlot: '14:00-17:00', level: 'National' },
    { id: 'opp_3', title: 'Youth Climate Debate Cup', organizer: 'UN Youth Mongolia', requiredSkills: ['Public Speaking', 'English'], day: 'Sunday', timeSlot: '11:00-13:00', level: 'Global' },
    { id: 'opp_4', title: 'Community library reading buddy', organizer: 'Bayanzürkh Library', requiredSkills: ['English'], day: 'Friday', timeSlot: '16:00-17:30', level: 'School' },
    { id: 'opp_5', title: 'Junior UX internship (remote)', organizer: 'Fintech startup Nest.mn', requiredSkills: ['Graphic Design', 'Figma'], day: 'Sunday', timeSlot: '15:00-17:00', level: 'National' },
    { id: 'opp_6', title: 'Charity piano concert crew', organizer: 'Red Cross UB Youth', requiredSkills: ['Piano', 'Music'], day: 'Saturday', timeSlot: '15:00-17:00', level: 'School' },
  ],
  'opp',
);

export const db = { students, schedule, assignments, exams, opportunities };
