import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useStore, uid } from '../context/store.jsx';
import { STATUSES, PRIORITIES, validateApp, ymd } from '../utils/helpers.js';
import { Field } from './ui.jsx';

const blank = () => ({ id: uid(), company: '', title: '', type: 'Internship', location: '', mode: 'On-site', url: '', source: '', dateAdded: ymd(), submitted: '', deadline: '', salary: '', priority: 'Medium', resume: '', coverLetter: '', recruiter: '', recruiterEmail: '', notes: '', status: 'Interested' });

export default function AppModal({ app, onClose }) {
  const { state, saveApp } = useStore();
  const [f, setF] = useState(() => app || blank());
  const [err, setErr] = useState({});
  const first = useRef(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  useEffect(() => { first.current?.focus(); const h = (e) => e.key === 'Escape' && onClose(); addEventListener('keydown', h); return () => removeEventListener('keydown', h); }, [onClose]);
  const submit = (e) => {
    e.preventDefault();
    const er = validateApp(f); setErr(er);
    if (Object.keys(er).length) return;
    saveApp({ ...f, company: f.company.trim(), title: f.title.trim() }); onClose();
  };
  const sel = (k, opts, id) => <select id={id} value={f[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  const txt = (k, id, type = 'text', extra = {}) => <input id={id} type={type} value={f[k]} onChange={set(k)} aria-invalid={!!err[k]} {...extra} />;
  return (
    <div className="scrim" onClick={onClose}>
      <form className="dlg" role="dialog" aria-modal="true" aria-labelledby="am-t" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <header className="row between"><h2 id="am-t">{app ? 'Edit application' : 'Add application'}</h2><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></header>
        <fieldset><legend>Role</legend>
          <Field label="Company *" id="f-co" error={err.company}><input ref={first} id="f-co" value={f.company} onChange={set('company')} aria-invalid={!!err.company} /></Field>
          <Field label="Job title *" id="f-ti" error={err.title}>{txt('title', 'f-ti')}</Field>
          <Field label="Role type" id="f-ty">{sel('type', ['Internship', 'Full-time'], 'f-ty')}</Field>
          <Field label="Status" id="f-st">{sel('status', STATUSES, 'f-st')}</Field>
          <Field label="Location" id="f-lo">{txt('location', 'f-lo')}</Field>
          <Field label="Work mode" id="f-mo">{sel('mode', ['On-site', 'Hybrid', 'Remote'], 'f-mo')}</Field>
          <Field label="Priority" id="f-pr">{sel('priority', PRIORITIES, 'f-pr')}</Field>
          <Field label="Salary or stipend" id="f-sa">{txt('salary', 'f-sa')}</Field>
        </fieldset>
        <fieldset><legend>Dates and source</legend>
          <Field label="Date added" id="f-da">{txt('dateAdded', 'f-da', 'date')}</Field>
          <Field label="Applied on" id="f-su" error={err.submitted}>{txt('submitted', 'f-su', 'date')}</Field>
          <Field label="Application deadline" id="f-dl">{txt('deadline', 'f-dl', 'date')}</Field>
          <Field label="Source" id="f-so">{txt('source', 'f-so', 'text', { placeholder: 'LinkedIn, referral, campus...' })}</Field>
          <Field label="Job posting URL" id="f-ur" error={err.url} wide>{txt('url', 'f-ur', 'url')}</Field>
        </fieldset>
        <fieldset><legend>Documents and contact</legend>
          <Field label="Resume version" id="f-re"><input id="f-re" list="resumes" value={f.resume} onChange={set('resume')} /><datalist id="resumes">{state.resumes.map((r) => <option key={r.id} value={`${r.name} ${r.version}`.trim()} />)}</datalist></Field>
          <Field label="Cover letter link" id="f-cl" error={err.coverLetter}>{txt('coverLetter', 'f-cl', 'url')}</Field>
          <Field label="Recruiter name" id="f-rn">{txt('recruiter', 'f-rn')}</Field>
          <Field label="Recruiter email" id="f-rm" error={err.recruiterEmail}>{txt('recruiterEmail', 'f-rm', 'email')}</Field>
          <Field label="Notes and next steps" id="f-no" wide><textarea id="f-no" rows="3" value={f.notes} onChange={set('notes')} /></Field>
        </fieldset>
        <div className="row end"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-p">{app ? 'Save changes' : 'Add application'}</button></div>
      </form>
    </div>
  );
}
