import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { withPeak, addDays } from '../utils/helpers.js';

const KEY = 'oppora:v1';
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
const LISTS = ['apps', 'tasks', 'prep', 'resumes'];
const init = { apps: [], tasks: [], prep: [], resumes: [], settings: { name: 'there', theme: 'light', remind: true, portfolio: '', github: '' } };

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!d || typeof d !== 'object') return init;
    const s = { ...init, settings: { ...init.settings, ...(typeof d.settings === 'object' && d.settings ? d.settings : {}) } };
    LISTS.forEach((k) => { s[k] = Array.isArray(d[k]) ? d[k].filter((x) => x && typeof x === 'object' && x.id) : []; });
    s.apps = s.apps.map(withPeak);
    s.prep = s.prep.map((p) => ({ ...p, checklist: p.checklist || [], questions: p.questions || [] }));
    return s;
  } catch { return init; }
}

function reducer(s, a) {
  switch (a.type) {
    case 'upsert': {
      const l = s[a.key]; const i = l.findIndex((x) => x.id === a.item.id);
      return { ...s, [a.key]: i < 0 ? [a.item, ...l] : l.map((x) => (x.id === a.item.id ? a.item : x)) };
    }
    case 'remove': {
      const n = { ...s, [a.key]: s[a.key].filter((x) => x.id !== a.id) };
      if (a.key === 'apps') { n.tasks = n.tasks.filter((t) => t.appId !== a.id); n.prep = n.prep.filter((p) => p.appId !== a.id); }
      return n;
    }
    case 'settings': return { ...s, settings: { ...s.settings, ...a.v } };
    case 'demo': return { ...s, apps: [...a.apps, ...s.apps], tasks: [...a.tasks, ...s.tasks] };
    case 'undemo': return { ...s, apps: s.apps.filter((x) => !x.demo), tasks: s.tasks.filter((x) => !x.demo), prep: s.prep.filter((x) => !x.demo) };
    case 'clear': return { ...init, settings: { ...init.settings } };
    default: return s;
  }
}

function demoData() {
  const mk = (company, title, status, o = {}) => withPeak({ id: uid(), demo: true, company, title, status, type: 'Internship', location: 'Remote', mode: 'Remote', url: '', source: 'LinkedIn', dateAdded: addDays(-14), submitted: '', deadline: '', salary: '', priority: 'Medium', resume: '', coverLetter: '', recruiter: '', recruiterEmail: '', notes: '', updatedAt: Date.now(), ...o });
  const apps = [
    mk('Northwind Labs', 'Backend Intern', 'Applied', { submitted: addDays(-9), dateAdded: addDays(-12), priority: 'High' }),
    mk('Kaizen Systems', 'Java Developer', 'Interview Scheduled', { submitted: addDays(-20), dateAdded: addDays(-25), source: 'Referral', type: 'Full-time', priority: 'High' }),
    mk('Bluepine', 'Full-stack Intern', 'Interested', { deadline: addDays(5), source: 'Company site' }),
    mk('Orbit Pay', 'SDE Intern', 'Rejected', { submitted: addDays(-30), dateAdded: addDays(-33), source: 'Indeed' }),
  ];
  const tasks = [
    { id: uid(), demo: true, title: 'Tailor resume for Bluepine', due: addDays(2), priority: 'High', kind: 'Task', appId: apps[2].id, notes: '', done: false },
    { id: uid(), demo: true, title: 'Follow up with Northwind recruiter', due: addDays(-1), priority: 'Medium', kind: 'Follow-up', appId: apps[0].id, notes: '', done: false },
  ];
  return { apps, tasks };
}

const Ctx = createContext(null);
export const UIContext = createContext({ openApp: () => {} });
export const useUI = () => useContext(UIContext);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ } }, [state]);
  const api = useMemo(() => ({
    state,
    saveApp: (a) => dispatch({ type: 'upsert', key: 'apps', item: { ...withPeak(a), updatedAt: Date.now() } }),
    save: (key, item) => dispatch({ type: 'upsert', key, item }),
    remove: (key, id) => dispatch({ type: 'remove', key, id }),
    setSettings: (v) => dispatch({ type: 'settings', v }),
    loadDemo: () => dispatch({ type: 'demo', ...demoData() }),
    removeDemo: () => dispatch({ type: 'undemo' }),
    clearAll: () => { localStorage.removeItem(KEY); dispatch({ type: 'clear' }); },
  }), [state]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
