import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
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

export default function BalanceChart({ data, title }) {
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
    importacoes: -(item.valorImp || 0), // Negativo para visualizacao
    saldo: (item.valorExp || 0) - (item.valorImp || 0),
  }));

  return (
    <div className="chart-container">
      {title && (
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
      )}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="ano"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(value) => formatLargeNumber(Math.abs(value), 0)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
            />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Bar dataKey="exportacoes" name="Exportacoes" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="importacoes" name="Importacoes" fill="#3b82f6" radius={[0, 0, 4, 4]} />
            <Line
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#eab308"
              strokeWidth={3}
              dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dark-100 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-dark-500">Total Exportado</p>
          <p className="font-semibold text-primary-600">
            {formatCurrency(chartData.reduce((sum, d) => sum + d.exportacoes, 0), 1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-500">Total Importado</p>
          <p className="font-semibold text-accent-600">
            {formatCurrency(chartData.reduce((sum, d) => sum + Math.abs(d.importacoes), 0), 1)}
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-500">Saldo Acumulado</p>
          <p className="font-semibold text-secondary-600">
            {formatCurrency(chartData.reduce((sum, d) => sum + d.saldo, 0), 1)}
          </p>
        </div>
      </div>
    </div>
  );
}
