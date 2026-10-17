import { useState } from 'react';
import { useStore } from '../context/store.jsx';
import { metrics, fmtPct, countBy, lastWeeks, weekStart, shortDate, addDays } from '../utils/helpers.js';
import { Bars, Trend, Donut } from '../components/charts.jsx';
import { Empty } from '../components/ui.jsx';

export default function Analytics() {
  const { state } = useStore();
  const [range, setRange] = useState('all');
  const from = range === 'all' ? '' : addDays(-Number(range));
  const apps = state.apps.filter((a) => !from || a.dateAdded >= from);
  const m = metrics(apps);
  if (!state.apps.length) return <div className="card"><Empty title="No data to analyze yet" text="Charts appear once you add applications." /></div>;
  const months = Object.entries(countBy(apps.filter((a) => a.submitted), (a) => a.submitted.slice(0, 7))).sort().map(([k, v]) => ({ name: new Date(k + '-01T00:00:00').toLocaleDateString(undefined, { month: 'short', year: '2-digit' }), value: v }));
  const weeks = lastWeeks(12).map((w) => ({ name: shortDate(w), value: apps.filter((a) => a.dateAdded && weekStart(a.dateAdded) === w).length }));
  const sources = Object.entries(countBy(apps, (a) => a.source)).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  return (
    <>
      <div className="row between wrap"><p className="muted">Rates use submitted applications as the denominator ({m.submitted} in this range).</p>
        <select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}><option value="all">All time</option><option value="30">Last 30 days (by date added)</option><option value="90">Last 90 days (by date added)</option></select></div>
      <div className="grid4">{[['Applications', m.total], ['Submitted', m.submitted], ['Interview rate', fmtPct(m.interviewRate)], ['Offer rate', fmtPct(m.offerRate)]].map(([l, v]) => <div key={l} className="card stat"><b>{v}</b><span>{l}</span></div>)}</div>
      <div className="grid2">
        <section className="card"><h2>Submitted per month</h2>{months.length ? <Bars data={months} /> : <p className="muted">No submitted applications in this range.</p>}</section>
        <section className="card"><h2>Added per week</h2><Trend data={weeks} /></section>
        <section className="card"><h2>Status distribution</h2><Donut apps={apps} /></section>
        <section className="card"><h2>Applications by source</h2><Bars data={sources} horizontal /></section>
      </div>
    </>
  );
}
