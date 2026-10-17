import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useStore, uid } from '../context/store.jsx';
import { toCsv, downloadCsv, ymd } from '../utils/helpers.js';
import { Confirm } from '../components/ui.jsx';

export default function Settings() {
  const { state, setSettings, save, remove, removeDemo, clearAll } = useStore();
  const s = state.settings;
  const [r, setR] = useState({ name: '', version: '', link: '', coverLetter: '', notes: '' });
  const [ask, setAsk] = useState(false);
  const hasDemo = [...state.apps, ...state.tasks].some((x) => x.demo);
  return (
    <>
      <section className="card"><h2>Profile and appearance</h2>
        <div className="grid-form">
          <label>Display name<input value={s.name === 'there' ? '' : s.name} placeholder="Your name" onChange={(e) => setSettings({ name: e.target.value || 'there' })} /></label>
          <label>Theme<select value={s.theme} onChange={(e) => setSettings({ theme: e.target.value })}><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="chk wide"><input type="checkbox" checked={s.remind} onChange={(e) => setSettings({ remind: e.target.checked })} />Show in-app reminders for items due within 3 days</label>
        </div>
        <p className="muted">Reminders only appear while Oppora is open. No emails or push notifications are sent.</p></section>
      <section className="card"><h2>Resumes and links</h2>
        <div className="grid-form"><label>Portfolio URL<input type="url" value={s.portfolio} onChange={(e) => setSettings({ portfolio: e.target.value })} /></label><label>GitHub profile<input type="url" value={s.github} onChange={(e) => setSettings({ github: e.target.value })} /></label></div>
        <ul className="list">{state.resumes.map((x) => <li key={x.id}><span><b>{x.name} {x.version}</b><small>{x.notes}</small>{x.link && <a className="link" href={x.link} target="_blank" rel="noreferrer">Resume link</a>}{x.coverLetter && <a className="link" href={x.coverLetter} target="_blank" rel="noreferrer">Cover letter</a>}</span><button className="icon-btn" aria-label={`Delete ${x.name}`} onClick={() => remove('resumes', x.id)}><Trash2 size={15} /></button></li>)}</ul>
        <form className="grid-form" onSubmit={(e) => { e.preventDefault(); if (!r.name.trim()) return; save('resumes', { id: uid(), ...r, name: r.name.trim() }); setR({ name: '', version: '', link: '', coverLetter: '', notes: '' }); }}>
          <label>Resume name *<input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} /></label>
          <label>Version<input value={r.version} placeholder="v2" onChange={(e) => setR({ ...r, version: e.target.value })} /></label>
          <label>Resume link<input type="url" value={r.link} onChange={(e) => setR({ ...r, link: e.target.value })} /></label>
          <label>Cover letter link<input type="url" value={r.coverLetter} onChange={(e) => setR({ ...r, coverLetter: e.target.value })} /></label>
          <label className="wide">Best suited for<input value={r.notes} onChange={(e) => setR({ ...r, notes: e.target.value })} /></label>
          <button className="btn">Add resume</button></form></section>
      <section className="card"><h2>Your data</h2>
        <p className="muted">Oppora stores everything in this browser's localStorage. Nothing is uploaded, and clearing browser data removes it. Export a CSV regularly as a backup.</p>
        <div className="row wrap"><button className="btn" disabled={!state.apps.length} onClick={() => downloadCsv(`oppora-applications-${ymd()}.csv`, toCsv(state.apps))}>Export applications (CSV)</button>
          {hasDemo && <button className="btn" onClick={removeDemo}>Remove demo data</button>}<button className="btn btn-d" onClick={() => setAsk(true)}>Clear all data</button></div></section>
      {ask && <Confirm title="Clear all Oppora data?" text="Applications, tasks, prep records, resumes and settings will be permanently removed from this browser." label="Clear everything" onCancel={() => setAsk(false)} onConfirm={() => { clearAll(); setAsk(false); }} />}
    </>
  );
}
