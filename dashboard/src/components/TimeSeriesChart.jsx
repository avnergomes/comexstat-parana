import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { formatCurrency, formatLargeNumber } from '../utils/format';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-dark-600">{entry.name}:</span>
          <span className="font-medium text-dark-800">
            {formatCurrency(entry.value, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TimeSeriesChart({ data, title, showBalance = true, tipo = 'todos' }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container h-80 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  // Preparar dados
  const chartData = data.map(item => ({
    ano: item.ano,
    exportacoes: item.valorExp || 0,
    importacoes: item.valorImp || 0,
    saldo: (item.valorExp || 0) - (item.valorImp || 0),
  }));

  const showExportacoes = tipo === 'todos' || tipo === 'exportacoes';
  const showImportacoes = tipo === 'todos' || tipo === 'importacoes';

  return (
    <div className="chart-container">
      {title && (
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
      )}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientImp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="ano"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(value) => formatLargeNumber(value, 0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
            />
            {showExportacoes && (
              <Area
                type="monotone"
                dataKey="exportacoes"
                name="Exportações"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gradientExp)"
              />
            )}
            {showImportacoes && (
              <Area
                type="monotone"
                dataKey="importacoes"
                name="Importações"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradientImp)"
              />
            )}
            {showBalance && tipo === 'todos' && (
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
