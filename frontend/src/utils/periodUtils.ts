/**
 * periodUtils.ts
 * Client-side period resolver for CSM-F timetable
 * Timezone: Asia/Kolkata (IST, UTC+5:30)
 *
 * Periods (no breaks):
 *  P1  09:20 – 10:10
 *  P2  10:10 – 11:00
 *  [Morning Break 11:00–11:30]
 *  P3  11:30 – 12:20
 *  P4  12:20 – 13:10
 *  [Lunch Break  13:10–14:00]
 *  P5  14:00 – 14:50
 *  P6  14:50 – 15:40
 */

export interface PeriodInfo {
  periodNumber: number;
  periodName: string;
  startTime: string; // "HH:MM"
  endTime: string;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  active: boolean;
}

export interface DaySchedule {
  day: string;
  periods: PeriodInfo[];
}

// ---------------------------------------------------------------
// Static period windows (IST minutes since midnight)
// ---------------------------------------------------------------
const PERIODS: Array<{ num: number; start: number; end: number }> = [
  { num: 1, start: 9 * 60 + 20,  end: 10 * 60 + 10 },
  { num: 2, start: 10 * 60 + 10, end: 11 * 60 +  0 },
  // break 11:00–11:30
  { num: 3, start: 11 * 60 + 30, end: 12 * 60 + 20 },
  { num: 4, start: 12 * 60 + 20, end: 13 * 60 + 10 },
  // break 13:10–14:00
  { num: 5, start: 14 * 60 +  0, end: 14 * 60 + 50 },
  { num: 6, start: 14 * 60 + 50, end: 15 * 60 + 40 },
];

// ---------------------------------------------------------------
// Weekly timetable: day (1=Mon…6=Sat) → subject codes per period
// ---------------------------------------------------------------
const TIMETABLE: Record<number, Record<number, string>> = {
  1: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '2505T02', 5: '230BT02',  6: '2505T01' }, // Mon
  2: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '2505T01', 5: '2505T02',  6: '230BT02' }, // Tue
  3: { 1: 'TECH001', 2: 'TECH001', 3: '230BT02', 4: '2505T01', 5: '250HT01',  6: '2505T02' }, // Wed
  4: { 1: 'TECH001', 2: 'TECH001', 3: '250HT01', 4: '230BT02', 5: '2505T01',  6: '2505T02' }, // Thu
  5: { 1: 'TECH001', 2: 'TECH001', 3: '2505T01', 4: '2505T02', 5: '230BT02',  6: '250HT01' }, // Fri
  6: { 1: 'TECH001', 2: 'TECH001', 3: '2505T02', 4: '2505T01', 5: '250HT01',  6: '230BT02' }, // Sat
};

export const SUBJECTS: Record<string, { name: string; faculty: string; abbr: string }> = {
  TECH001:  { name: 'Technical Training',                           faculty: 'TBD',                   abbr: 'TT'   },
  '230BT02':{ name: 'Mathematical Foundation for Computer Science', faculty: 'Dr. K. Vijay Kumar',    abbr: 'MFCS' },
  '2505T02':{ name: 'Python for Scientific Computing',             faculty: 'P. Liyaz',               abbr: 'PSC'  },
  '250HT01':{ name: 'Language and Professional Skills',            faculty: 'Dr. Sk Iliyas Ali',      abbr: 'LPS'  },
  '2505T01':{ name: 'Foundations of Web Development',             faculty: 'Dr. R. Devendra Reddy',  abbr: 'FWD'  },
};

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function istNow(): { dayOfWeek: number; minutesSinceMidnight: number } {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5 * 60 + 30;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + istOffset) % (24 * 60);

  // Day-of-week in IST
  const istMs = now.getTime() + istOffset * 60 * 1000;
  const istDate = new Date(istMs);
  const dow = istDate.getUTCDay(); // 0=Sun
  const dayOfWeek = dow === 0 ? 7 : dow; // 1=Mon … 7=Sun

  return { dayOfWeek, minutesSinceMidnight: istMinutes };
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// ---------------------------------------------------------------
// Public API
// ---------------------------------------------------------------

/** Returns the currently active period info, or null if break/outside hours/Sunday */
export function getCurrentPeriod(): PeriodInfo | null {
  const { dayOfWeek, minutesSinceMidnight: mins } = istNow();
  if (dayOfWeek === 7) return null; // Sunday

  const period = PERIODS.find(p => mins >= p.start && mins < p.end);
  if (!period) return null;

  const subjectCode = TIMETABLE[dayOfWeek]?.[period.num];
  if (!subjectCode) return null;

  const subj = SUBJECTS[subjectCode];
  return {
    periodNumber: period.num,
    periodName:   `Period ${period.num}`,
    startTime:    formatTime(period.start),
    endTime:      formatTime(period.end),
    subjectCode,
    subjectName:  subj.name,
    faculty:      subj.faculty,
    active: true,
  };
}

/** Returns the full schedule for today (6 periods), or empty array on Sunday */
export function getTodaySchedule(): PeriodInfo[] {
  const { dayOfWeek, minutesSinceMidnight: mins } = istNow();
  if (dayOfWeek === 7) return [];

  return PERIODS.map(p => {
    const subjectCode = TIMETABLE[dayOfWeek]?.[p.num] ?? '';
    const subj = SUBJECTS[subjectCode] ?? { name: '', faculty: '', abbr: '' };
    return {
      periodNumber: p.num,
      periodName:   `Period ${p.num}`,
      startTime:    formatTime(p.start),
      endTime:      formatTime(p.end),
      subjectCode,
      subjectName:  subj.name,
      faculty:      subj.faculty,
      active:       mins >= p.start && mins < p.end,
    };
  });
}

/** Returns the full Mon–Sat weekly schedule */
export function getWeeklySchedule(): DaySchedule[] {
  return [1, 2, 3, 4, 5, 6].map(dow => ({
    day: DAY_NAMES[dow],
    periods: PERIODS.map(p => {
      const subjectCode = TIMETABLE[dow]?.[p.num] ?? '';
      const subj = SUBJECTS[subjectCode] ?? { name: '', faculty: '', abbr: '' };
      return {
        periodNumber: p.num,
        periodName:   `Period ${p.num}`,
        startTime:    formatTime(p.start),
        endTime:      formatTime(p.end),
        subjectCode,
        subjectName:  subj.name,
        faculty:      subj.faculty,
        active: false,
      };
    }),
  }));
}

/** Returns human-readable status of the college day */
export function getCollegeDayStatus(): string {
  const { dayOfWeek, minutesSinceMidnight: mins } = istNow();
  if (dayOfWeek === 7) return 'Today is Sunday — no college.';
  const COLLEGE_START = 9 * 60 + 20;
  const COLLEGE_END   = 15 * 60 + 40;
  if (mins < COLLEGE_START)   return 'College has not started yet. Opens at 9:20 AM IST.';
  if (mins >= COLLEGE_END)    return 'College is over for today.';
  const MB_START = 11 * 60; const MB_END = 11 * 60 + 30;
  const LB_START = 13 * 60 + 10; const LB_END = 14 * 60;
  if (mins >= MB_START && mins < MB_END) return 'Morning Break (11:00–11:30 AM)';
  if (mins >= LB_START && mins < LB_END) return 'Lunch Break (1:10–2:00 PM)';
  const current = getCurrentPeriod();
  if (current) return `Active: Period ${current.periodNumber} — ${SUBJECTS[current.subjectCode]?.abbr ?? current.subjectCode}`;
  return 'Between periods';
}
