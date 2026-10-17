import { Link } from 'react-router-dom';
import { Briefcase, Loader, CalendarClock, Award, Plus } from 'lucide-react';
import { useStore, useUI } from '../context/store.jsx';
import { PIPE, COLS, metrics, buildEvents, isOverdue, daysUntil, fmtDate, lastWeeks, weekStart, shortDate, addDays } from '../utils/helpers.js';
import { Bars, Donut } from '../components/charts.jsx';
import { Badge, Avatar, Empty } from '../components/ui.jsx';

export default function Overview() {
  const { state, loadDemo, save } = useStore();
  const { openApp } = useUI();
  const { apps, tasks, prep, settings } = state;
  const m = metrics(apps);
  const h = new Date().getHours();
  const hello = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const inProg = apps.filter((a) => { const i = PIPE.indexOf(a.status); return i >= 1 && i <= 5; }).length;
  const recent = apps.filter((a) => a.dateAdded >= addDays(-30)).length;
  const before = apps.filter((a) => a.dateAdded < addDays(-30) && a.dateAdded >= addDays(-60)).length;
  const cards = [
    ['Total Applications', m.total, Briefcase, before ? `${recent >= before ? '+' : ''}${recent - before} vs previous 30 days` : '', false],
    ['In Progress', inProg, Loader, '', false],
    ['Interviews Scheduled', apps.filter((a) => a.status === 'Interview Scheduled').length, CalendarClock, '', true],
    ['Offers Received', apps.filter((a) => a.status === 'Offer Received').length, Award, '', false],
  ];
  const weeks = lastWeeks(8).map((w) => ({ name: shortDate(w), value: apps.filter((a) => a.dateAdded && weekStart(a.dateAdded) === w).length }));
  const funnel = [['Applied', m.submitted], ['Assessment', apps.filter((a) => a.peak >= 3).length], ['Interview', m.interviews], ['Offer', m.offers]].map(([name, value]) => ({ name, value }));
  const events = buildEvents(state).filter((e) => isOverdue(e) || (daysUntil(e.date) >= 0 && daysUntil(e.date) <= 14 && !e.done)).slice(0, 6);
  const recentApps = [...apps].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 5);
  const follow = tasks.filter((t) => !t.done).sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 5);

  if (!apps.length) return (
    <>
      <Hello hello={hello} name={settings.name} openApp={openApp} />
      <div className="card"><Empty title="Your search starts here" text="Add the first role you are interested in, or load a few demo records to see how Oppora works. Demo records are labelled and can be removed in one click.">
        <button className="btn btn-p" onClick={() => openApp()}><Plus size={16} />Add application</button><button className="btn" onClick={loadDemo}>Load demo data</button></Empty></div>
    </>
  );
  return (
    <>
      <Hello hello={hello} name={settings.name} openApp={openApp} />
      <div className="grid4">{cards.map(([label, n, Icon, note, hi]) => (
        <div key={label} className={`card stat${hi ? ' hi' : ''}`}><Icon size={18} className="ic" /><b>{n}</b><span>{label}</span>{note && <small>{note}</small>}</div>))}</div>
      <div className="grid3">
        <section className="card"><h2>Applications added per week</h2><Bars data={weeks} /></section>
        <section className="card"><h2>Status breakdown</h2><Donut apps={apps} /></section>
        <section className="card"><h2>Funnel</h2><Bars data={funnel} horizontal /></section>
      </div>
      <div className="grid2">
        <section className="card"><h2>Upcoming interviews and deadlines</h2>
          {events.length === 0 ? <p className="muted">Nothing due in the next 14 days.</p> : <ul className="list">{events.map((e) => <li key={e.id}><span><b>{e.title}</b><small>{e.type}{e.sub ? ` - ${e.sub}` : ''}</small></span><small className={isOverdue(e) ? 'bad' : ''}>{isOverdue(e) ? 'Overdue - ' : ''}{fmtDate(e.date)}</small></li>)}</ul>}
        </section>
        <section className="card"><h2>Pending follow-ups</h2>
          {follow.length === 0 ? <p className="muted">No open tasks. Add one from the Calendar page.</p> : <ul className="list">{follow.map((t) => <li key={t.id}><label className="chk"><input type="checkbox" checked={false} onChange={() => save('tasks', { ...t, done: true })} /><span><b>{t.title}</b><small>{t.due ? fmtDate(t.due) : 'No due date'}</small></span></label></li>)}</ul>}
        </section>
        <section className="card"><h2>Recent activity</h2>
          <ul className="list">{recentApps.map((a) => <li key={a.id}><span className="row"><Avatar name={a.company} size={30} /><span><b>{a.company}</b><small>{a.title}</small></span></span><Badge status={a.status} /></li>)}</ul>
        </section>
        <section className="card"><h2>Pipeline</h2>
          <div className="pipe">{COLS.map((c) => <Link key={c.name} to="/board"><b>{apps.filter((a) => c.list.includes(a.status)).length}</b><small>{c.name}</small></Link>)}</div>
          <p className="muted">{prep.filter((p) => p.date >= addDays(0)).length} upcoming interview prep records</p>
        </section>
      </div>
    </>
  );
}
const Hello = ({ hello, name, openApp }) => (
  <div className="row between hello"><div><h2 className="big">{hello}, {name}</h2><p className="muted">Here's your job search progress at a glance.</p></div><button className="btn btn-p" onClick={() => openApp()}><Plus size={16} />Add Application</button></div>
);
