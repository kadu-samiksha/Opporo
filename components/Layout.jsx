import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Columns3, CalendarDays, BookOpen, BarChart3, Settings, Plus, Search, Bell, Menu, X } from 'lucide-react';
import { useStore, UIContext } from '../context/store.jsx';
import { buildEvents, daysUntil, fmtDate, isOverdue } from '../utils/helpers.js';
import { Avatar } from './ui.jsx';
import AppModal from './AppModal.jsx';

const NAV = [['/', 'Overview', LayoutDashboard], ['/applications', 'My Applications', Briefcase], ['/board', 'Application Board', Columns3], ['/calendar', 'Calendar', CalendarDays], ['/prep', 'Interview Preparation', BookOpen], ['/analytics', 'Analytics', BarChart3], ['/settings', 'Settings', Settings]];

export default function Layout() {
  const { state } = useStore();
  const [modal, setModal] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [pop, setPop] = useState('');
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { pathname } = useLocation();
  const title = (NAV.find((n) => n[0] === pathname) || NAV[0])[1];
  const alerts = useMemo(() => (state.settings.remind ? buildEvents(state).filter((e) => { const d = daysUntil(e.date); return e.type === 'Interview' ? d >= 0 && d <= 3 : !e.done && d <= 3; }) : []), [state]);
  const name = state.settings.name === 'there' ? 'You' : state.settings.name;
  return (
    <UIContext.Provider value={{ openApp: (app) => setModal({ app: app || null }) }}>
      <div className="shell">
        <aside className={`side${drawer ? ' open' : ''}`}>
          <div className="brand row between"><span className="logo"><i />Oppora</span><button className="icon-btn only-m" onClick={() => setDrawer(false)} aria-label="Close menu"><X size={18} /></button></div>
          <nav aria-label="Main">{NAV.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setDrawer(false)}><Icon size={18} />{label}</NavLink>)}</nav>
          <Link to="/settings" className="profile" onClick={() => setDrawer(false)}><Avatar name={name} /><span><b>{name}</b><small>Settings</small></span></Link>
        </aside>
        {drawer && <div className="scrim only-m" onClick={() => setDrawer(false)} />}
        <div className="main">
          <header className="top">
            <button className="icon-btn only-m" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={20} /></button>
            <h1>{title}</h1>
            <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); nav(`/applications?q=${encodeURIComponent(q)}`); }}>
              <Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applications" aria-label="Search applications" />
            </form>
            <div className="pop-wrap">
              <button className="icon-btn" aria-label={`Reminders, ${alerts.length} due soon`} aria-expanded={pop === 'bell'} onClick={() => setPop(pop === 'bell' ? '' : 'bell')}><Bell size={19} />{alerts.length > 0 && <span className="dot-count">{alerts.length}</span>}</button>
              {pop === 'bell' && <div className="pop"><h3>Due soon</h3>{alerts.length === 0 ? <p className="muted">Nothing due in the next 3 days.</p> : alerts.slice(0, 6).map((e) => <Link key={e.id} to="/calendar" onClick={() => setPop('')} className="pop-item"><b>{e.title}</b><small className={isOverdue(e) ? 'bad' : ''}>{isOverdue(e) ? 'Overdue - ' : ''}{fmtDate(e.date)}</small></Link>)}</div>}
            </div>
            <div className="pop-wrap">
              <button className="icon-btn" aria-label="Profile menu" aria-expanded={pop === 'me'} onClick={() => setPop(pop === 'me' ? '' : 'me')}><Avatar name={name} size={30} /></button>
              {pop === 'me' && <div className="pop"><Link to="/settings" onClick={() => setPop('')} className="pop-item"><b>Settings</b><small>Name, theme, data</small></Link></div>}
            </div>
            <button className="btn btn-p" onClick={() => setModal({ app: null })}><Plus size={16} />Add Application</button>
          </header>
          <main className="page"><Outlet /></main>
        </div>
        {modal && <AppModal app={modal.app} onClose={() => setModal(null)} />}
      </div>
    </UIContext.Provider>
  );
}
