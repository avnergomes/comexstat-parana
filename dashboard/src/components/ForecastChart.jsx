import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '../utils/format';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  const isForecast = data?.forecast;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-2">
        {label} {isForecast && <span className="text-xs text-secondary-500">(Projeção)</span>}
      </p>
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
      {data?.upperBound && (
        <p className="text-xs text-dark-400 mt-2">
          Intervalo: {formatCurrency(data.lowerBound, 1)} - {formatCurrency(data.upperBound, 1)}
        </p>
      )}
    </div>
  );
}

function TrendIndicator({ value, previousValue }) {
  if (!value || !previousValue) return null;

  const change = ((value - previousValue) / previousValue) * 100;
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 1;

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-dark-500">
        <Minus className="w-4 h-4" />
        <span className="text-sm">Estável</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-primary-600' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      <span className="text-sm font-medium">{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
    </div>
  );
}

export default function ForecastChart({ historicalData, forecastData, title }) {
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="chart-container h-80 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  // Prepare chart data
  const historicalChartData = historicalData.map(item => ({
    ano: item.ano,
    exportacoes: item.valorExp || 0,
    importacoes: item.valorImp || 0,
    saldo: (item.valorExp || 0) - (item.valorImp || 0),
    forecast: false
  }));

  // Add forecast data if available
  const forecastChartData = forecastData?.map(item => ({
    ano: item.ano,
    exportacoes: item.valorExp || 0,
    exportacoesProj: item.valorExp || 0,
    importacoes: item.valorImp || 0,
    importacoesProj: item.valorImp || 0,
    saldo: (item.valorExp || 0) - (item.valorImp || 0),
    upperBound: item.upperBound,
    lowerBound: item.lowerBound,
    forecast: true
  })) || [];

  // Connect last historical point with first forecast
  if (forecastChartData.length > 0 && historicalChartData.length > 0) {
    const lastHistorical = historicalChartData[historicalChartData.length - 1];
    forecastChartData[0] = {
      ...forecastChartData[0],
      exportacoes: lastHistorical.exportacoes,
      importacoes: lastHistorical.importacoes
    };
  }

  const chartData = [...historicalChartData, ...forecastChartData];

  // Calculate KPIs
  const lastHistorical = historicalChartData[historicalChartData.length - 1];
  const previousHistorical = historicalChartData[historicalChartData.length - 2];
  const lastForecast = forecastChartData[forecastChartData.length - 1];

  return (
    <div className="chart-container">
      {title && (
        <h3 className="text-lg font-semibold text-dark-800 mb-4">{title}</h3>
      )}

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
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

            {/* Forecast confidence band */}
            {forecastChartData.length > 0 && (
              <Area
                dataKey="upperBound"
                stroke="none"
                fill="url(#forecastGradient)"
                fillOpacity={0.5}
              />
            )}

            {/* Historical lines */}
            <Line
              type="monotone"
              dataKey="exportacoes"
              name="Exportações"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 4 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="importacoes"
              name="Importações"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              connectNulls
            />

            {/* Forecast lines (dashed) */}
            <Line
              type="monotone"
              dataKey="exportacoesProj"
              name="Exp. Projetada"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#22c55e', r: 4, strokeDasharray: 'none' }}
            />
            <Line
              type="monotone"
              dataKey="importacoesProj"
              name="Imp. Projetada"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', r: 4, strokeDasharray: 'none' }}
            />

            <ReferenceLine y={0} stroke="#94a3b8" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast KPIs */}
      <div className="mt-4 pt-4 border-t border-dark-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-dark-500">Último Ano (Real)</p>
            <p className="font-semibold text-primary-600">
              {formatCurrency(lastHistorical?.exportacoes, 1)}
            </p>
            <TrendIndicator
              value={lastHistorical?.exportacoes}
              previousValue={previousHistorical?.exportacoes}
            />
          </div>

          {lastForecast && (
            <>
              <div className="text-center">
                <p className="text-xs text-dark-500">Projeção {lastForecast.ano}</p>
                <p className="font-semibold text-secondary-600">
                  {formatCurrency(lastForecast.exportacoesProj, 1)}
                </p>
                <TrendIndicator
                  value={lastForecast.exportacoesProj}
                  previousValue={lastHistorical?.exportacoes}
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-dark-500">Saldo Projetado</p>
                <p className={`font-semibold ${lastForecast.saldo >= 0 ? 'text-primary-600' : 'text-red-500'}`}>
                  {formatCurrency(lastForecast.saldo, 1)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-dark-500">Tendência</p>
                <p className="font-semibold text-dark-800">
                  {lastForecast.exportacoesProj > lastHistorical?.exportacoes ? 'Alta' : 'Baixa'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-dark-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-primary-500" />
          <span>Dados Históricos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-primary-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #22c55e, #22c55e 5px, transparent 5px, transparent 10px)' }} />
          <span>Projeção</span>
        </div>
      </div>
    </div>
  );
}
