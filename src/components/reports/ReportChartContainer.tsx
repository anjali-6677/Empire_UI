import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart2, AlertCircle } from 'lucide-react';
import { formatAmountLakhsCrores } from '../../utils/reportCalculators';

export interface ChartSeriesConfig {
  key: string;
  label: string;
  color: string;
  unit?: 'currency' | 'number' | 'percentage';
}

interface ReportChartContainerProps {
  title: string;
  subtitle?: string;
  type: 'bar' | 'stacked_bar' | 'horizontal_bar' | 'line' | 'donut';
  data: any[];
  series: ChartSeriesConfig[];
  xAxisKey?: string;
  height?: number;
}

const DONUT_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const ReportChartContainer: React.FC<ReportChartContainerProps> = ({
  title,
  subtitle,
  type,
  data,
  series,
  xAxisKey = 'label',
  height = 320,
}) => {
  // Limit chart data items if too large to ensure clean readable visual layout
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (data.length > 12) {
      const top10 = data.slice(0, 10);
      const remaining = data.slice(10);
      const otherRow: any = { [xAxisKey]: 'Others' };
      series.forEach((s) => {
        otherRow[s.key] = remaining.reduce((sum, item) => sum + (Number(item[s.key]) || 0), 0);
      });
      return [...top10, otherRow];
    }
    return data;
  }, [data, xAxisKey, series]);

  const hasData = chartData.length > 0 && series.some((s) => chartData.some((row) => Number(row[s.key]) > 0));

  const formatValue = (val: number, unit?: string) => {
    if (unit === 'currency') return formatAmountLakhsCrores(val);
    if (unit === 'percentage') return `${val}%`;
    return val.toLocaleString('en-IN');
  };

  const formatAxisTick = (val: number) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return String(val);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between border-b border-gray-150 pb-2">
        <div>
          <h3 className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-brand-600" /> {title}
          </h3>
          {subtitle && <p className="text-[10px] text-gray-400 font-medium">{subtitle}</p>}
        </div>
      </div>

      {!hasData ? (
        <div className="h-[280px] w-full flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50 rounded border border-dashed border-gray-200 p-6 text-center">
          <AlertCircle className="h-7 w-7 text-amber-500/80" />
          <p className="font-bold text-xs text-gray-700">No report graph data available for current filter selection</p>
          <p className="text-[11px] text-gray-400">Try adjusting your project, date, or category filters.</p>
        </div>
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={chartData} margin={{ top: 15, right: 30, left: 15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatAxisTick} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                        <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                        {payload.map((entry: any, i: number) => {
                          const s = series.find((s) => s.key === entry.dataKey);
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-white">{formatValue(Number(entry.value), s?.unit)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {series.map((s) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2.5} dot={{ r: 4 }} />
                ))}
              </LineChart>
            ) : type === 'horizontal_bar' ? (
              <BarChart data={chartData} layout="vertical" margin={{ top: 15, right: 30, left: 40, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatAxisTick} />
                <YAxis type="category" dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#475569' }} width={120} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                        <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                        {payload.map((entry: any, i: number) => {
                          const s = series.find((s) => s.key === entry.dataKey);
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-white">{formatValue(Number(entry.value), s?.unit)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {series.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[0, 4, 4, 0]} barSize={16} />
                ))}
              </BarChart>
            ) : type === 'donut' ? (
              <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0];
                    return (
                      <div className="bg-gray-900 text-white p-2 rounded shadow text-xs font-mono font-bold">
                        {item.name}: {formatValue(Number(item.value), series[0]?.unit)}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Pie
                  data={chartData}
                  dataKey={series[0]?.key || 'value'}
                  nameKey={xAxisKey}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={formatAxisTick} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-gray-900 text-white p-2.5 rounded shadow-lg text-xs space-y-1 border border-gray-700 z-50">
                        <p className="font-bold border-b border-gray-700 pb-1 text-amber-400">{label}</p>
                        {payload.map((entry: any, i: number) => {
                          const s = series.find((s) => s.key === entry.dataKey);
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-white">{formatValue(Number(entry.value), s?.unit)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {series.map((s) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    fill={s.color}
                    stackId={type === 'stacked_bar' ? 'stack' : undefined}
                    radius={type === 'stacked_bar' ? [0, 0, 0, 0] : [3, 3, 0, 0]}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
