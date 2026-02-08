import { useMemo } from 'react';
import { Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/format';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Paleta de cores para o heatmap (verde)
const COLOR_SCALE = [
  '#f0fdf4', // 0-10% - muito claro
  '#dcfce7', // 10-20%
  '#bbf7d0', // 20-30%
  '#86efac', // 30-40%
  '#4ade80', // 40-50%
  '#22c55e', // 50-60%
  '#16a34a', // 60-70%
  '#15803d', // 70-80%
  '#166534', // 80-90%
  '#14532d', // 90-100% - muito escuro
];

function getColor(value, maxValue) {
  if (!value || value === 0) return '#f8fafc';
  const ratio = Math.min(value / maxValue, 1);
  const index = Math.floor(ratio * (COLOR_SCALE.length - 1));
  return COLOR_SCALE[index];
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-1">{data.categoria}</p>
      <p className="text-sm text-dark-600">
        {data.mes}: <span className="font-medium">{formatCurrency(data.valor, 1)}</span>
      </p>
    </div>
  );
}

export default function HeatmapChart({ data, title = 'Padrão Sazonal por Cadeia', tipo = 'exportacoes' }) {
  const heatmapData = useMemo(() => {
    if (!data?.timeseriesMensal) return { rows: [], maxValue: 0 };

    // Agrupar por categoria e mês
    const byCatMonth = {};

    data.timeseriesMensal.forEach(item => {
      const periodo = item.periodo; // formato: "2024-01"
      const mes = parseInt(periodo.split('-')[1]) - 1; // 0-11
      const categoria = item.categoria || 'Geral';
      const valor = tipo === 'exportacoes' ? (item.valorExp || 0) : (item.valorImp || 0);

      if (!byCatMonth[categoria]) {
        byCatMonth[categoria] = Array(12).fill(0);
      }
      byCatMonth[categoria][mes] += valor;
    });

    // Converter para array de linhas
    const rows = Object.entries(byCatMonth).map(([categoria, valores]) => ({
      categoria,
      valores,
      total: valores.reduce((a, b) => a + b, 0),
    }));

    // Ordenar por total
    rows.sort((a, b) => b.total - a.total);

    // Calcular valor máximo
    const maxValue = Math.max(...rows.flatMap(r => r.valores));

    return { rows: rows.slice(0, 10), maxValue }; // Top 10 cadeias
  }, [data, tipo]);

  if (!heatmapData.rows.length) {
    return (
      <div className="chart-container h-80 flex items-center justify-center">
        <p className="text-dark-400">Sem dados mensais para exibir</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 font-medium text-dark-600 w-40">Cadeia</th>
              {MONTHS.map(mes => (
                <th key={mes} className="text-center py-2 px-1 font-medium text-dark-600 w-12">
                  {mes}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.rows.map((row, rowIndex) => (
              <tr key={row.categoria} className="group">
                <td className="py-1 px-3 font-medium text-dark-700 truncate max-w-40" title={row.categoria}>
                  {row.categoria.length > 20 ? row.categoria.substring(0, 18) + '...' : row.categoria}
                </td>
                {row.valores.map((valor, mesIndex) => (
                  <td key={mesIndex} className="p-0.5">
                    <div
                      className="w-10 h-8 rounded-sm flex items-center justify-center cursor-default transition-transform hover:scale-110 hover:z-10 relative"
                      style={{ backgroundColor: getColor(valor, heatmapData.maxValue) }}
                      title={`${row.categoria} - ${MONTHS[mesIndex]}: ${formatCurrency(valor, 1)}`}
                    >
                      {valor > heatmapData.maxValue * 0.7 && (
                        <span className="text-xs font-bold text-white">
                          {formatCurrency(valor, 0).replace('US$ ', '')}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="text-xs text-dark-500">Menor</span>
        <div className="flex h-3 rounded overflow-hidden shadow-sm">
          {COLOR_SCALE.map((color, i) => (
            <div key={i} className="w-6 h-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="text-xs text-dark-500">Maior</span>
      </div>

      <p className="text-xs text-center text-dark-400 mt-2">
        Valores agregados de todos os anos no período selecionado
      </p>
    </div>
  );
}
