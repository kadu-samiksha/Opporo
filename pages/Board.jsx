import { useState } from 'react';
import { useStore, useUI } from '../context/store.jsx';
import { COLS, STATUSES, CLOSED, fmtDate, daysUntil, buildEvents } from '../utils/helpers.js';
import { Avatar, Badge, Priority, Empty } from '../components/ui.jsx';

export default function Board() {
  const { state, saveApp } = useStore();
  const { openApp } = useUI();
  const [q, setQ] = useState('');
  const [closed, setClosed] = useState(false);
  const [over, setOver] = useState('');
  const s = q.trim().toLowerCase();
  const apps = state.apps.filter((a) => !s || `${a.company} ${a.title}`.toLowerCase().includes(s));
  const ev = buildEvents(state);
  const move = (id, status) => { const a = state.apps.find((x) => x.id === id); if (a && a.status !== status) saveApp({ ...a, status, submitted: a.submitted || (STATUSES.indexOf(status) >= 2 ? new Date().toISOString().slice(0, 10) : '') }); };
  const next = (a) => { const e = ev.find((x) => x.appId === a.id && !x.done && daysUntil(x.date) >= 0); return e ? `${e.type}: ${fmtDate(e.date)}` : ''; };
  const Card = ({ a }) => (
    <article className="kcard" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', a.id)}>
      <div className="row"><Avatar name={a.company} size={28} /><button className="link" onClick={() => openApp(a)}><b>{a.company}</b></button></div>
      <p>{a.title}</p><Badge status={a.status} />
      <small>{a.submitted ? `Applied ${fmtDate(a.submitted)}` : `Added ${fmtDate(a.dateAdded)}`}</small>
      {(a.deadline && a.peak < 2) ? <small>Deadline {fmtDate(a.deadline)}</small> : next(a) && <small>{next(a)}</small>}
      <div className="row between"><Priority p={a.priority} />
        <select aria-label={`Move ${a.company}`} value="" onChange={(e) => move(a.id, e.target.value)}><option value="">Move to...</option>{STATUSES.filter((x) => x !== a.status).map((x) => <option key={x}>{x}</option>)}</select></div>
    </article>);
  return (
    <>
      <div className="card filters"><input aria-label="Search board" placeholder="Search company or role" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="chk"><input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)} />Show rejected and withdrawn</label></div>
      {!state.apps.length ? <div className="card"><Empty title="Your board is empty" text="Add an application to see it here. Drag cards between columns to update their status."><button className="btn btn-p" onClick={() => openApp()}>Add application</button></Empty></div> : (
        <div className="board">{COLS.map((c) => {
          const items = apps.filter((a) => c.list.includes(a.status));
          return (
            <section key={c.name} className={`col${over === c.name ? ' over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(c.name); }} onDragLeave={() => setOver('')} onDrop={(e) => { e.preventDefault(); setOver(''); move(e.dataTransfer.getData('text/plain'), c.list[0]); }} aria-label={c.name}>
              <h3>{c.name}<span>{items.length}</span></h3>{items.map((a) => <Card key={a.id} a={a} />)}
            </section>);
        })}</div>)}
      {closed && <section className="card"><h2>Rejected and withdrawn</h2>{apps.filter((a) => CLOSED.includes(a.status)).length === 0 ? <p className="muted">None.</p> : <div className="closed">{apps.filter((a) => CLOSED.includes(a.status)).map((a) => <Card key={a.id} a={a} />)}</div>}</section>}
    </>
  );
}
