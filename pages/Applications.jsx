import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Trash2, Download, ExternalLink, X } from 'lucide-react';
import { useStore, useUI } from '../context/store.jsx';
import { STATUSES, PRIORITIES, toCsv, downloadCsv, fmtDate, ymd } from '../utils/helpers.js';
import { Badge, Avatar, Priority, Demo, Empty, Confirm } from '../components/ui.jsx';

const PER = 10;
const SORTS = { dateAdded: 'Date added', deadline: 'Deadline', company: 'Company', status: 'Status' };
const cmp = { dateAdded: (a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''), deadline: (a, b) => (a.deadline || '9').localeCompare(b.deadline || '9'), company: (a, b) => a.company.localeCompare(b.company), status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) };
const NONE = { status: '', type: '', mode: '', priority: '' };

export default function Applications() {
  const { state, remove } = useStore();
  const { openApp } = useUI();
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const [f, setF] = useState(NONE);
  const [sort, setSort] = useState('dateAdded');
  const [page, setPage] = useState(1);
  const [del, setDel] = useState(null);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return state.apps.filter((a) => (!s || [a.company, a.title, a.location, a.source, a.notes].join(' ').toLowerCase().includes(s)) && Object.keys(NONE).every((k) => !f[k] || a[k] === f[k])).sort(cmp[sort]);
  }, [state.apps, q, f, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PER, cur * PER);
  const filtered = q || Object.values(f).some(Boolean);
  const reset = () => { setF(NONE); setSp({}); setPage(1); };
  const sel = (k, label, opts) => <select aria-label={label} value={f[k]} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setPage(1); }}><option value="">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
  return (
    <>
      <div className="row between wrap"><p className="muted">{list.length} of {state.apps.length} applications</p>
        <button className="btn" disabled={!list.length} onClick={() => downloadCsv(`oppora-applications-${ymd()}.csv`, toCsv(list))}><Download size={16} />Export CSV</button></div>
      <div className="card filters">
        <input aria-label="Search" placeholder="Search company, role, notes" value={q} onChange={(e) => { setSp(e.target.value ? { q: e.target.value } : {}); setPage(1); }} />
        {sel('status', 'All statuses', STATUSES)}{sel('type', 'All types', ['Internship', 'Full-time'])}{sel('mode', 'Any work mode', ['On-site', 'Hybrid', 'Remote'])}{sel('priority', 'Any priority', PRIORITIES)}
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>Sort: {v}</option>)}</select>
        {filtered && <button className="btn btn-g" onClick={reset}><X size={14} />Clear filters</button>}
      </div>
      {rows.length === 0 ? <div className="card"><Empty title={filtered ? 'No applications match' : 'No applications yet'} text={filtered ? 'Try a different search or clear the filters.' : 'Add your first application to start tracking.'}>
        {filtered ? <button className="btn" onClick={reset}>Clear filters</button> : <button className="btn btn-p" onClick={() => openApp()}>Add application</button>}</Empty></div> : (
        <div className="card flush"><table className="tbl"><thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Applied</th><th>Deadline</th><th>Priority</th><th><span className="sr">Actions</span></th></tr></thead>
          <tbody>{rows.map((a) => (
            <tr key={a.id}>
              <td data-label="Company"><span className="row"><Avatar name={a.company} size={32} /><span><b>{a.company}</b> <Demo item={a} /><small>{a.location || a.mode}</small></span></span></td>
              <td data-label="Role">{a.title}<small>{a.type}</small></td>
              <td data-label="Status"><Badge status={a.status} /></td>
              <td data-label="Applied">{fmtDate(a.submitted)}</td>
              <td data-label="Deadline">{fmtDate(a.deadline)}</td>
              <td data-label="Priority"><Priority p={a.priority} /></td>
              <td className="acts">
                {a.url && <a className="icon-btn" href={a.url} target="_blank" rel="noreferrer" aria-label={`Open posting for ${a.company}`}><ExternalLink size={16} /></a>}
                <button className="icon-btn" onClick={() => openApp(a)} aria-label={`Edit ${a.company}`}><Pencil size={16} /></button>
                <button className="icon-btn" onClick={() => setDel(a)} aria-label={`Delete ${a.company}`}><Trash2 size={16} /></button>
              </td>
            </tr>))}</tbody></table>
          {pages > 1 && <div className="row between pager"><button className="btn" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Previous</button><span className="muted">Page {cur} of {pages}</span><button className="btn" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</button></div>}
        </div>)}
      {del && <Confirm title={`Delete ${del.company}?`} text="This also removes its tasks and interview preparation. This cannot be undone." onCancel={() => setDel(null)} onConfirm={() => { remove('apps', del.id); setDel(null); }} />}
    </>
  );
}
