import { describe, it, expect } from 'vitest';
import { toCsv, pct, metrics, validateApp, withPeak } from './helpers.js';

describe('csv', () => {
  it('escapes commas, quotes and line breaks', () => {
    const out = toCsv([{ company: 'A, Inc', title: 'Say "hi"', notes: 'line1\nline2' }]);
    expect(out).toContain('"A, Inc"');
    expect(out).toContain('"Say ""hi"""');
    expect(out).toContain('"line1\nline2"');
  });
});
describe('metrics', () => {
  it('handles zero applications', () => {
    expect(pct(0, 0)).toBeNull();
    expect(metrics([]).interviewRate).toBeNull();
  });
  it('counts interviews against submitted applications', () => {
    const m = metrics([{ status: 'Applied' }, { status: 'Interview Scheduled' }, { status: 'Interested' }].map(withPeak));
    expect(m.submitted).toBe(2);
    expect(m.interviewRate).toBe(50);
  });
  it('keeps interview credit after a rejection', () => {
    const a = withPeak({ status: 'Interview Scheduled' });
    expect(withPeak({ ...a, status: 'Rejected' }).peak).toBe(4);
  });
});
describe('validateApp', () => {
  it('requires company and title', () => {
    const e = validateApp({ company: '', title: '', status: 'Interested' });
    expect(e.company).toBeTruthy(); expect(e.title).toBeTruthy();
  });
  it('requires an applied date once applied', () => {
    expect(validateApp({ company: 'A', title: 'B', status: 'Applied' }).submitted).toBeTruthy();
  });
});
