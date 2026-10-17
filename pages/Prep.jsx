import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore, uid } from '../context/store.jsx';
import { CATEGORIES, fmtDate, ymd } from '../utils/helpers.js';
import { Empty, Confirm } from '../components/ui.jsx';

const TYPES = ['Technical', 'Coding round', 'HR', 'Managerial', 'Group discussion', 'Aptitude test'];
const OUT = ['Pending', 'Passed', 'Not selected'];

function Card({ r, apps, onDelete }) {
  const { save } = useStore();
  const [item, setItem] = useState({ t: '', cat: CATEGORIES[0] });
  const [qa, setQa] = useState({ q: '', a: '' });
  const up = (patch) => save('prep', { ...r, ...patch });
  const done = r.checklist.filter((c) => c.done).length;
  const p = r.checklist.length ? Math.round((done / r.checklist.length) * 100) : 0;
  return (
    <article className="card prep">
      <div className="row between"><h2>{apps.find((a) => a.id === r.appId)?.company || 'Unlinked interview'}</h2><button className="icon-btn" aria-label="Delete prep record" onClick={onDelete}><Trash2 size={16} /></button></div>
      <div className="grid-form">
        <label>Application<select value={r.appId} onChange={(e) => up({ appId: e.target.value })}><option value="">Select</option>{apps.map((a) => <option key={a.id} value={a.id}>{a.company} - {a.title}</option>)}</select></label>
        <label>Interview date<input type="date" value={r.date} onChange={(e) => up({ date: e.target.value })} /></label>
        <label>Round<input value={r.round} placeholder="Round 1" onChange={(e) => up({ round: e.target.value })} /></label>
        <label>Type<select value={r.type} onChange={(e) => up({ type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      </div>
      <div className="row between"><h3>Checklist</h3><span className="muted">{done}/{r.checklist.length} done</span></div>
      <div className="bar" role="progressbar" aria-valuenow={p} aria-valuemin="0" aria-valuemax="100" aria-label="Preparation progress"><i style={{ width: p + '%' }} /></div>
      <ul className="list">{r.checklist.map((c, i) => (
        <li key={i}><label className="chk"><input type="checkbox" checked={c.done} onChange={() => up({ checklist: r.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} /><span><b className={c.done ? 'done' : ''}>{c.t}</b><small>{c.cat}</small></span></label>
          <button className="icon-btn" aria-label={`Remove ${c.t}`} onClick={() => up({ checklist: r.checklist.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></li>))}</ul>
      <form className="row wrap" onSubmit={(e) => { e.preventDefault(); if (item.t.trim()) { up({ checklist: [...r.checklist, { t: item.t.trim(), cat: item.cat, done: false }] }); setItem({ ...item, t: '' }); } }}>
        <input aria-label="Checklist topic" placeholder="Add a topic, e.g. Binary trees" value={item.t} onChange={(e) => setItem({ ...item, t: e.target.value })} />
        <select aria-label="Category" value={item.cat} onChange={(e) => setItem({ ...item, cat: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><button className="btn">Add</button></form>
      <h3>Questions and answers</h3>
      <ul className="list">{r.questions.map((x, i) => <li key={i}><span><b>{x.q}</b><small className="pre">{x.a}</small></span><button className="icon-btn" aria-label="Remove question" onClick={() => up({ questions: r.questions.filter((_, j) => j !== i) })}><Trash2 size={14} /></button></li>)}</ul>
      <form className="qa" onSubmit={(e) => { e.preventDefault(); if (qa.q.trim()) { up({ questions: [...r.questions, { q: qa.q.trim(), a: qa.a.trim() }] }); setQa({ q: '', a: '' }); } }}>
        <input aria-label="Question" placeholder="Question you were asked or expect" value={qa.q} onChange={(e) => setQa({ ...qa, q: e.target.value })} />
        <textarea aria-label="Your answer" rows="2" placeholder="Your own answer" value={qa.a} onChange={(e) => setQa({ ...qa, a: e.target.value })} /><button className="btn">Save question</button></form>
      <div className="grid-form">
        <label className="wide">Notes and experience<textarea rows="3" value={r.notes} onChange={(e) => up({ notes: e.target.value })} /></label>
        <label>Outcome<select value={r.outcome} onChange={(e) => up({ outcome: e.target.value })}>{OUT.map((o) => <option key={o}>{o}</option>)}</select></label>
        <label>Feedback<input value={r.feedback} onChange={(e) => up({ feedback: e.target.value })} /></label>
        <label className="wide">Next steps<input value={r.next} onChange={(e) => up({ next: e.target.value })} /></label>
      </div>
    </article>
  );
}

export default function Prep() {
  const { state, save, remove } = useStore();
  const [del, setDel] = useState(null);
  const { prep, apps } = state;
  const add = () => save('prep', { id: uid(), appId: '', date: '', round: '', type: 'Technical', checklist: [], questions: [], notes: '', outcome: 'Pending', feedback: '', next: '' });
  const upcoming = prep.filter((p) => p.date >= ymd()).sort((a, b) => a.date.localeCompare(b.date));
  const open = prep.reduce((n, p) => n + p.checklist.filter((c) => !c.done).length, 0);
  return (
    <>
      <div className="grid2">
        <section className="card"><h2>Upcoming interviews</h2>{upcoming.length === 0 ? <p className="muted">None scheduled.</p> : <ul className="list">{upcoming.map((p) => <li key={p.id}><span><b>{apps.find((a) => a.id === p.appId)?.company || 'Unlinked'}</b><small>{p.round} {p.type}</small></span><small>{fmtDate(p.date)}</small></li>)}</ul>}</section>
        <section className="card"><h2>Open preparation tasks</h2><p className="big">{open}</p><p className="muted">topics still unchecked across all records</p></section>
      </div>
      <div className="row end"><button className="btn btn-p" onClick={add}>New prep record</button></div>
      {prep.length === 0 ? <div className="card"><Empty title="No preparation records" text="Create a record for an interview to plan topics, log questions and track the outcome."><button className="btn btn-p" onClick={add}>New prep record</button></Empty></div> : prep.map((r) => <Card key={r.id} r={r} apps={apps} onDelete={() => setDel(r)} />)}
      {del && <Confirm title="Delete this prep record?" text="Its checklist, questions and notes will be removed." onCancel={() => setDel(null)} onConfirm={() => { remove('prep', del.id); setDel(null); }} />}
    </>
  );
}
