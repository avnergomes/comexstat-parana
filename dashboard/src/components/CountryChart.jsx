import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatLargeNumber, stringToColor } from '../utils/format';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-1">{data.pais}</p>
      <p className="text-sm text-dark-600">
        Valor FOB: <span className="font-medium">{formatCurrency(data.valor, 1)}</span>
      </p>
      {data.percentual && (
        <p className="text-sm text-dark-600">
          Participacao: <span className="font-medium">{data.percentual.toFixed(1)}%</span>
        </p>
      )}
    </div>
  );
}

export default function CountryChart({ data, title, tipo = 'exportacoes', limit = 15 }) {
  const [sortBy, setSortBy] = useState('valor');

  if (!data) return null;

  const paisesData = data[tipo] || [];

  // Ordenar e limitar
  const chartData = [...paisesData]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, limit)
    .map(item => ({
      ...item,
      fill: stringToColor(item.pais),
    }));

  if (chartData.length === 0) {
    return (
      <div className="chart-container h-96 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  // Calcular total para percentual
  const total = paisesData.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        <button
          onClick={() => setSortBy(sortBy === 'valor' ? 'peso' : 'valor')}
          className="flex items-center gap-1 text-sm text-dark-500 hover:text-primary-600 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          Por {sortBy === 'valor' ? 'peso' : 'valor'}
        </button>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => formatLargeNumber(value, 0)}
            />
            <YAxis
              type="category"
              dataKey="pais"
              tick={{ fill: '#64748b', fontSize: 10 }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 summary */}
      <div className="mt-4 pt-4 border-t border-dark-100">
        <p className="text-xs text-dark-500 mb-2">Top 5 representam:</p>
        <div className="flex flex-wrap gap-2">
          {chartData.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-dark-50 rounded-full text-xs"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="font-medium">{item.pais}</span>
              <span className="text-dark-400">
                {((item.valor / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
