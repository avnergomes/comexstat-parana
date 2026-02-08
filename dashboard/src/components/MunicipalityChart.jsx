import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ArrowUpDown, MapPin } from 'lucide-react';
import { formatCurrency, formatLargeNumber, stringToColor } from '../utils/format';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-1">{data.nome}</p>
      <p className="text-sm text-dark-600">
        Valor FOB: <span className="font-medium">{formatCurrency(data.valor, 1)}</span>
      </p>
      <p className="text-sm text-dark-600">
        Participação: <span className="font-medium">{data.percentual.toFixed(1)}%</span>
      </p>
    </div>
  );
}

export default function MunicipalityChart({ data, title, limit = 15, onMunicipioClick, selectedMunicipio }) {
  const [sortBy, setSortBy] = useState('valor');

  if (!data || !data.municipios || data.municipios.length === 0) {
    return (
      <div className="chart-container h-96 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  const chartData = [...data.municipios]
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, limit)
    .map(item => ({
      ...item,
      fill: stringToColor(item.nome),
    }));

  // Função para obter opacidade baseada na seleção
  const getOpacity = (nome) => {
    if (!selectedMunicipio) return 1;
    return nome === selectedMunicipio ? 1 : 0.4;
  };

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        </div>
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
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            style={{ cursor: onMunicipioClick ? 'pointer' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => formatLargeNumber(value, 0)}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fill: '#64748b', fontSize: 10 }}
              width={95}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="valor"
              radius={[0, 4, 4, 0]}
              onClick={(data) => onMunicipioClick?.(data.nome)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  opacity={getOpacity(entry.nome)}
                  stroke={entry.nome === selectedMunicipio ? '#1f2937' : 'none'}
                  strokeWidth={entry.nome === selectedMunicipio ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {onMunicipioClick && (
        <p className="text-xs text-center text-dark-400 mt-2">
          Clique para filtrar
        </p>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dark-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-xs text-dark-500">Total Exportado</p>
            <p className="font-semibold text-primary-600">
              {formatCurrency(data.totalValor, 1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500">Municípios Exportadores</p>
            <p className="font-semibold text-dark-800">
              {data.municipios.length}
            </p>
          </div>
        </div>

        {/* Top 5 chips */}
        <div className="mt-4">
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
                <span className="font-medium">{item.nome}</span>
                <span className="text-dark-400">
                  {item.percentual.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
