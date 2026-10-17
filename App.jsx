import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useStore } from './context/store.jsx';
import Overview from './pages/Overview.jsx';
import Applications from './pages/Applications.jsx';
import Board from './pages/Board.jsx';
import Calendar from './pages/Calendar.jsx';
import Prep from './pages/Prep.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const { state } = useStore();
  useEffect(() => { document.documentElement.dataset.theme = state.settings.theme; }, [state.settings.theme]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="applications" element={<Applications />} />
        <Route path="board" element={<Board />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="prep" element={<Prep />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
