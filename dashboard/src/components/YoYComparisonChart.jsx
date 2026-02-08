import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatLargeNumber, formatPercent } from '../utils/format';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <span className="font-medium">
            {entry.name.includes('Variação') ? formatPercent(entry.value, 1) : formatCurrency(entry.value, 1)}
          </span>
        </p>
      ))}
    </div>
  );
}

function TrendIndicator({ value }) {
  if (!value || Math.abs(value) < 0.1) {
    return <Minus className="w-4 h-4 text-dark-400" />;
  }
  if (value > 0) {
    return <TrendingUp className="w-4 h-4 text-primary-600" />;
  }
  return <TrendingDown className="w-4 h-4 text-red-500" />;
}

export default function YoYComparisonChart({ data, title = 'Comparativo Anual', tipo = 'exportacoes' }) {
  const chartData = useMemo(() => {
    if (!data || data.length < 2) return [];

    return data.map((item, index) => {
      const valorAtual = tipo === 'exportacoes' ? item.valorExp : item.valorImp;
      const valorAnterior = index > 0
        ? (tipo === 'exportacoes' ? data[index - 1].valorExp : data[index - 1].valorImp)
        : null;

      const variacao = valorAnterior && valorAnterior > 0
        ? ((valorAtual - valorAnterior) / valorAnterior) * 100
        : null;

      return {
        ano: item.ano,
        valor: valorAtual,
        valorAnterior,
        variacao,
      };
    });
  }, [data, tipo]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;

    const variacoes = chartData.filter(d => d.variacao !== null).map(d => d.variacao);
    const mediaVariacao = variacoes.reduce((a, b) => a + b, 0) / variacoes.length;
    const ultimaVariacao = variacoes[variacoes.length - 1] || 0;
    const totalAtual = chartData[chartData.length - 1]?.valor || 0;
    const totalAnterior = chartData[chartData.length - 2]?.valor || 0;

    return {
      mediaVariacao,
      ultimaVariacao,
      totalAtual,
      totalAnterior,
      crescimentoTotal: totalAnterior > 0 ? ((totalAtual - totalAnterior) / totalAnterior) * 100 : 0,
    };
  }, [chartData]);

  if (!chartData || chartData.length < 2) {
    return (
      <div className="chart-container h-80 flex items-center justify-center">
        <p className="text-dark-400">Dados insuficientes para comparativo</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        {stats && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendIndicator value={stats.ultimaVariacao} />
              <span className={`text-sm font-medium ${stats.ultimaVariacao >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
                {formatPercent(stats.ultimaVariacao, 1)} último ano
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-50 rounded-lg p-3 text-center">
            <p className="text-xs text-dark-500">Último Ano</p>
            <p className="text-lg font-bold text-primary-600">{formatCurrency(stats.totalAtual, 1)}</p>
          </div>
          <div className="bg-dark-50 rounded-lg p-3 text-center">
            <p className="text-xs text-dark-500">Ano Anterior</p>
            <p className="text-lg font-bold text-dark-700">{formatCurrency(stats.totalAnterior, 1)}</p>
          </div>
          <div className="bg-dark-50 rounded-lg p-3 text-center">
            <p className="text-xs text-dark-500">Variação Média</p>
            <p className={`text-lg font-bold ${stats.mediaVariacao >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
              {formatPercent(stats.mediaVariacao, 1)}
            </p>
          </div>
        </div>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="ano"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => formatLargeNumber(value, 0)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine yAxisId="right" y={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar
              yAxisId="left"
              dataKey="valor"
              name={tipo === 'exportacoes' ? 'Exportações' : 'Importações'}
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="variacao"
              name="Variação YoY (%)"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ fill: '#0ea5e9', r: 4 }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-center text-dark-400 mt-2">
        Barras mostram valores absolutos; linha mostra variação percentual em relação ao ano anterior
      </p>
    </div>
  );
}
