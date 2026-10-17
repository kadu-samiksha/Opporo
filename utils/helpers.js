export const PIPE = ['Interested', 'Preparing to Apply', 'Applied', 'Assessment', 'Interview Scheduled', 'Interview Completed', 'Offer Received'];
export const CLOSED = ['Rejected', 'Withdrawn'];
export const STATUSES = [...PIPE, ...CLOSED];
export const TONE = { Interested: 'gray', 'Preparing to Apply': 'gray', Applied: 'blue', Assessment: 'amber', 'Interview Scheduled': 'purple', 'Interview Completed': 'purple', 'Offer Received': 'green', Rejected: 'red', Withdrawn: 'gray' };
export const TONE_COLOR = { gray: '#9A96AD', blue: '#2563EB', amber: '#D97706', purple: '#7C3AED', green: '#16A34A', red: '#DC2626' };
export const COLS = [
  { name: 'Interested', list: ['Interested'] }, { name: 'Preparing', list: ['Preparing to Apply'] },
  { name: 'Applied', list: ['Applied'] }, { name: 'Assessment', list: ['Assessment'] },
  { name: 'Interview', list: ['Interview Scheduled', 'Interview Completed'] }, { name: 'Offer', list: ['Offer Received'] },
];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const CATEGORIES = ['Data Structures and Algorithms', 'Java', 'JavaScript and React', 'SQL', 'CS fundamentals', 'Aptitude', 'Behavioral and HR'];

const p2 = (n) => String(n).padStart(2, '0');
export const ymd = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
export const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return ymd(d); };
export const fmtDate = (s) => (s ? new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const daysUntil = (s) => Math.round((new Date(s + 'T00:00:00') - new Date(ymd() + 'T00:00:00')) / 864e5);
export const initials = (n) => (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
export const weekStart = (s) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
export const lastWeeks = (n) => { const base = weekStart(ymd()); return Array.from({ length: n }, (_, i) => addDays(-7 * (n - 1 - i), new Date(base + 'T00:00:00'))); };
export const shortDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** Highest pipeline stage ever reached, so a rejection after an interview still counts as an interview. */
export function withPeak(a) {
  const floor = a.submitted && CLOSED.includes(a.status) ? 2 : -1;
  return { ...a, peak: Math.max(Number.isInteger(a.peak) ? a.peak : -1, PIPE.indexOf(a.status), floor) };
}

export function validateApp(a) {
  const e = {};
  if (!a.company?.trim()) e.company = 'Enter the company name.';
  if (!a.title?.trim()) e.title = 'Enter the job title.';
  if (a.url && !/^https?:\/\/\S+\.\S+/.test(a.url)) e.url = 'Use a full link that starts with http:// or https://.';
  if (a.coverLetter && !/^https?:\/\/\S+\.\S+/.test(a.coverLetter)) e.coverLetter = 'Use a full link that starts with http:// or https://.';
  if (a.recruiterEmail && !/^\S+@\S+\.\S+$/.test(a.recruiterEmail)) e.recruiterEmail = 'Enter a valid email address.';
  if (PIPE.indexOf(a.status) >= 2 && !a.submitted) e.submitted = 'Add the date you applied.';
  if (a.submitted && a.submitted > addDays(1)) e.submitted = 'The application date cannot be in the future.';
  return e;
}

export const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);
export const fmtPct = (v) => (v === null ? '-' : v + '%');

/** Denominator for every rate: applications that were actually submitted (peak stage >= Applied). */
export function metrics(apps) {
  const sub = apps.filter((a) => a.peak >= 2);
  const iv = sub.filter((a) => a.peak >= 4).length;
  const of = sub.filter((a) => a.peak >= 6).length;
  return { total: apps.length, submitted: sub.length, interviews: iv, offers: of, interviewRate: pct(iv, sub.length), offerRate: pct(of, sub.length) };
}

export const countBy = (list, fn) => list.reduce((m, x) => { const k = fn(x) || 'Unknown'; m[k] = (m[k] || 0) + 1; return m; }, {});

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+@]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const CSV_FIELDS = [['company', 'Company'], ['title', 'Job title'], ['type', 'Type'], ['status', 'Status'], ['priority', 'Priority'], ['location', 'Location'], ['mode', 'Work mode'], ['source', 'Source'], ['dateAdded', 'Date added'], ['submitted', 'Applied on'], ['deadline', 'Deadline'], ['salary', 'Salary or stipend'], ['resume', 'Resume'], ['url', 'Posting URL'], ['recruiter', 'Recruiter'], ['recruiterEmail', 'Recruiter email'], ['notes', 'Notes']];
export const toCsv = (apps) => [CSV_FIELDS.map((f) => csvCell(f[1])).join(','), ...apps.map((a) => CSV_FIELDS.map((f) => csvCell(a[f[0]])).join(','))].join('\r\n');
export function downloadCsv(name, text) {
  const url = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

/** Calendar events derived from real records. */
export function buildEvents({ apps, tasks, prep }) {
  const by = Object.fromEntries(apps.map((a) => [a.id, a]));
  const ev = [];
  apps.forEach((a) => { if (a.deadline && a.peak < 2 && !CLOSED.includes(a.status)) ev.push({ id: 'd' + a.id, date: a.deadline, type: 'Deadline', title: `${a.company} deadline`, sub: a.title, appId: a.id }); });
  prep.forEach((p) => { if (p.date) ev.push({ id: 'i' + p.id, date: p.date, type: 'Interview', title: `${by[p.appId]?.company || 'Interview'}${p.round ? ' - ' + p.round : ''}`, sub: p.type, appId: p.appId }); });
  tasks.forEach((t) => { if (t.due) ev.push({ id: 't' + t.id, date: t.due, type: t.kind || 'Task', title: t.title, sub: by[t.appId]?.company || '', appId: t.appId, done: t.done, taskId: t.id }); });
  return ev.sort((a, b) => a.date.localeCompare(b.date));
}
export const isOverdue = (e) => !e.done && e.type !== 'Interview' && e.date < ymd();
