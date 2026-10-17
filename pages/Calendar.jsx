import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useStore, uid } from '../context/store.jsx';
import { buildEvents, isOverdue, fmtDate, ymd, PRIORITIES } from '../utils/helpers.js';
import { Field, Confirm, Priority } from '../components/ui.jsx';

const KINDS = ['Task', 'Follow-up', 'Assessment'];
const blank = () => ({ id: uid(), title: '', due: ymd(), priority: 'Medium', kind: 'Task', appId: '', notes: '', done: false });

export default function Calendar() {
  const { state, save, remove } = useStore();
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [sel, setSel] = useState(ymd());
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('pending');
  const [del, setDel] = useState(null);
  const events = useMemo(() => buildEvents(state), [state]);
  const y = cur.getFullYear(), m = cur.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => ymd(new Date(y, m, i + 1)))];
  const on = (d) => events.filter((e) => e.date === d);
  const toggle = (e) => { const t = state.tasks.find((x) => x.id === e.taskId); if (t) save('tasks', { ...t, done: !t.done }); };
  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setErr('Enter a task title.');
    if (!form.due) return setErr('Choose a due date.');
    save('tasks', { ...form, title: form.title.trim() }); setForm(null); setErr('');
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const tasks = state.tasks.filter((t) => tab === 'all' || (tab === 'pending' && !t.done) || (tab === 'completed' && t.done) || (tab === 'overdue' && !t.done && t.due && t.due < ymd()));
  const upcoming = events.filter((e) => isOverdue(e) || (e.date >= ymd() && !e.done)).slice(0, 8);
  const appName = (id) => state.apps.find((a) => a.id === id)?.company;
  return (
    <>
      <div className="grid-cal">
        <section className="card">
          <div className="row between"><h2>{cur.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
            <div className="row"><button className="icon-btn" aria-label="Previous month" onClick={() => setCur(new Date(y, m - 1, 1))}><ChevronLeft size={18} /></button>
              <button className="btn" onClick={() => { const d = new Date(); setCur(new Date(d.getFullYear(), d.getMonth(), 1)); setSel(ymd()); }}>Today</button>
              <button className="icon-btn" aria-label="Next month" onClick={() => setCur(new Date(y, m + 1, 1))}><ChevronRight size={18} /></button></div></div>
          <div className="cal" role="grid">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <b key={d} className="dow">{d}</b>)}
            {cells.map((d, i) => d ? (
              <button key={d} className={`day${d === sel ? ' sel' : ''}${d === ymd() ? ' today' : ''}`} onClick={() => setSel(d)} aria-label={`${fmtDate(d)}, ${on(d).length} events`}>
                <span>{+d.slice(8)}</span><span className="dots">{on(d).slice(0, 4).map((e) => <i key={e.id} className={`t-${e.type}`} />)}</span></button>) : <span key={'e' + i} />)}</div>
          <div className="row legend-row">{['Interview', 'Deadline', 'Assessment', 'Follow-up', 'Task'].map((t) => <span key={t}><i className={`ldot t-${t}`} />{t}</span>)}</div>
        </section>
        <section className="card"><h2>{fmtDate(sel)}</h2>
          {on(sel).length === 0 ? <p className="muted">No events on this day.</p> : <ul className="list">{on(sel).map((e) => (
            <li key={e.id}><span className="row">{e.taskId && <input type="checkbox" checked={!!e.done} onChange={() => toggle(e)} aria-label={`Mark ${e.title} done`} />}<span><b className={e.done ? 'done' : ''}>{e.title}</b><small>{e.type}{e.sub ? ` - ${e.sub}` : ''}</small></span></span>
              {e.appId && <Link className="link" to={`/applications?q=${encodeURIComponent(appName(e.appId) || '')}`}>Application</Link>}</li>))}</ul>}
          <h3>Upcoming</h3>
          {upcoming.length === 0 ? <p className="muted">Nothing coming up.</p> : <ul className="list">{upcoming.map((e) => <li key={e.id}><span><b>{e.title}</b><small>{e.type}</small></span><small className={isOverdue(e) ? 'bad' : ''}>{isOverdue(e) ? 'Overdue - ' : ''}{fmtDate(e.date)}</small></li>)}</ul>}
        </section>
      </div>
      <section className="card">
        <div className="row between wrap"><h2>Tasks and follow-ups</h2><button className="btn btn-p" onClick={() => { setForm(blank()); setErr(''); }}>Add task</button></div>
        <div className="tabs" role="tablist">{['pending', 'overdue', 'completed', 'all'].map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
        {form && <form className="taskform" onSubmit={submit} noValidate>
          <Field label="Title *" id="t-ti" error={err}><input id="t-ti" value={form.title} onChange={set('title')} autoFocus /></Field>
          <Field label="Due date *" id="t-du"><input id="t-du" type="date" value={form.due} onChange={set('due')} /></Field>
          <Field label="Type" id="t-ki"><select id="t-ki" value={form.kind} onChange={set('kind')}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Priority" id="t-pr"><select id="t-pr" value={form.priority} onChange={set('priority')}>{PRIORITIES.map((k) => <option key={k}>{k}</option>)}</select></Field>
          <Field label="Application" id="t-ap"><select id="t-ap" value={form.appId} onChange={set('appId')}><option value="">None</option>{state.apps.map((a) => <option key={a.id} value={a.id}>{a.company}</option>)}</select></Field>
          <Field label="Notes" id="t-no"><input id="t-no" value={form.notes} onChange={set('notes')} /></Field>
          <div className="row end"><button type="button" className="btn" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-p">Save task</button></div></form>}
        {tasks.length === 0 ? <p className="muted">No {tab === 'all' ? '' : tab + ' '}tasks.</p> : <ul className="list">{tasks.map((t) => (
          <li key={t.id}><label className="chk"><input type="checkbox" checked={t.done} onChange={() => save('tasks', { ...t, done: !t.done })} /><span><b className={t.done ? 'done' : ''}>{t.title}</b><small>{t.kind} - {appName(t.appId) || 'No application'} - Due {fmtDate(t.due)}{!t.done && t.due < ymd() ? ' (overdue)' : ''}</small></span></label>
            <span className="row"><Priority p={t.priority} /><button className="icon-btn" aria-label={`Edit ${t.title}`} onClick={() => { setForm(t); setErr(''); }}><Pencil size={15} /></button><button className="icon-btn" aria-label={`Delete ${t.title}`} onClick={() => setDel(t)}><Trash2 size={15} /></button></span></li>))}</ul>}
      </section>
      {del && <Confirm title="Delete this task?" text={del.title} onCancel={() => setDel(null)} onConfirm={() => { remove('tasks', del.id); setDel(null); }} />}
    </>
  );
}
