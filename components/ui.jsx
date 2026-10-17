import { useEffect } from 'react';
import { TONE, initials } from '../utils/helpers.js';

export const Badge = ({ status }) => <span className={`badge b-${TONE[status] || 'gray'}`}>{status}</span>;
export const Avatar = ({ name, size = 36 }) => <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">{initials(name)}</span>;
export const Priority = ({ p }) => <span className={`prio p-${p}`}>{p}</span>;
export const Demo = ({ item }) => (item.demo ? <span className="chip">Demo</span> : null);
export const Empty = ({ title, text, children }) => (
  <div className="empty"><h3>{title}</h3><p>{text}</p><div className="row">{children}</div></div>
);
export const Field = ({ label, error, id, children, wide }) => (
  <div className={`field${wide ? ' wide' : ''}`}><label htmlFor={id}>{label}</label>{children}{error && <p className="err" role="alert">{error}</p>}</div>
);

export function Confirm({ title, text, label = 'Delete', onConfirm, onCancel }) {
  useEffect(() => { const h = (e) => e.key === 'Escape' && onCancel(); addEventListener('keydown', h); return () => removeEventListener('keydown', h); }, [onCancel]);
  return (
    <div className="scrim" onClick={onCancel}>
      <div className="dlg small" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" onClick={(e) => e.stopPropagation()}>
        <h2 id="cf-t">{title}</h2><p className="muted">{text}</p>
        <div className="row end"><button className="btn" onClick={onCancel}>Cancel</button><button className="btn btn-d" autoFocus onClick={onConfirm}>{label}</button></div>
      </div>
    </div>
  );
}
