import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { STATUSES, TONE, TONE_COLOR } from '../utils/helpers.js';

const axis = { fontSize: 12, fill: '#77738B' };
export const statusData = (apps) => STATUSES.map((s) => ({ name: s, value: apps.filter((a) => a.status === s).length, color: TONE_COLOR[TONE[s]] })).filter((d) => d.value > 0);

export function Bars({ data, horizontal, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: horizontal ? 24 : -20, right: 12 }}>
        <CartesianGrid stroke="#EAE6F2" vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? <><XAxis type="number" allowDecimals={false} tick={axis} /><YAxis type="category" dataKey="name" tick={axis} width={90} /></> : <><XAxis dataKey="name" tick={axis} /><YAxis allowDecimals={false} tick={axis} /></>}
        <Tooltip cursor={{ fill: '#F3E8FF' }} />
        <Bar dataKey="value" name="Applications" fill="#7C3AED" radius={4} barSize={horizontal ? 18 : 26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function Trend({ data, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -20, right: 12 }}>
        <CartesianGrid stroke="#EAE6F2" vertical={false} />
        <XAxis dataKey="name" tick={axis} /><YAxis allowDecimals={false} tick={axis} /><Tooltip />
        <Line dataKey="value" name="Applications" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
export function Donut({ apps }) {
  const data = statusData(apps);
  return (
    <div className="donut">
      <ResponsiveContainer width={170} height={170}>
        <PieChart><Pie data={data} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2}>{data.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /></PieChart>
      </ResponsiveContainer>
      <ul className="legend">{data.map((d) => <li key={d.name}><i style={{ background: d.color }} />{d.name}<b>{d.value}</b></li>)}</ul>
    </div>
  );
}
