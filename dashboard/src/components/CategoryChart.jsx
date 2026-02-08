import { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Grid3X3 } from 'lucide-react';
import { formatCurrency, formatLargeNumber, getRainbowColor, CHART_COLORS } from '../utils/format';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
      <p className="font-semibold text-dark-800 mb-1">{data.categoria || data.name}</p>
      <p className="text-sm text-dark-600">
        Valor: <span className="font-medium">{formatCurrency(data.valor || data.value, 1)}</span>
      </p>
      {data.produtos && (
        <p className="text-sm text-dark-600">
          Produtos: <span className="font-medium">{data.produtos}</span>
        </p>
      )}
    </div>
  );
}

function TreemapContent({ root, depth, x, y, width, height, name, value, index, fill, selectedCategoria, onCategoriaClick }) {
  if (depth === 1 && width > 50 && height > 30) {
    const opacity = !selectedCategoria ? 1 : (name === selectedCategoria ? 1 : 0.4);
    const isSelected = name === selectedCategoria;
    return (
      <g
        style={{ cursor: onCategoriaClick ? 'pointer' : 'default' }}
        onClick={() => onCategoriaClick?.(name)}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill || getRainbowColor(index)}
          stroke={isSelected ? '#1f2937' : '#fff'}
          strokeWidth={isSelected ? 3 : 2}
          opacity={opacity}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={width > 80 ? 11 : 9}
          fontWeight="500"
          opacity={opacity}
        >
          {width > 80 ? name : name.substring(0, 8)}
        </text>
      </g>
    );
  }
  return null;
}

export default function CategoryChart({ data, title, tipo = 'exportacoes', onCategoriaClick, selectedCategoria }) {
  const [viewType, setViewType] = useState('bar');

  if (!data) return null;

  const chartData = (data[tipo] || []).slice(0, 12).map((item, idx) => ({
    ...item,
    name: item.categoria,
    value: item.valor,
    fill: item.cor || getRainbowColor(idx),
    index: idx,
  }));

  // Função para obter opacidade baseada na seleção
  const getOpacity = (categoria) => {
    if (!selectedCategoria) return 1;
    return categoria === selectedCategoria ? 1 : 0.4;
  };

  if (chartData.length === 0) {
    return (
      <div className="chart-container h-96 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
        <div className="flex gap-1 bg-dark-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('bar')}
            className={`p-2 rounded-md transition-colors ${viewType === 'bar' ? 'bg-white shadow-sm' : 'hover:bg-dark-200'}`}
            title="Grafico de barras"
          >
            <BarChart3 className="w-4 h-4 text-dark-600" />
          </button>
          <button
            onClick={() => setViewType('pie')}
            className={`p-2 rounded-md transition-colors ${viewType === 'pie' ? 'bg-white shadow-sm' : 'hover:bg-dark-200'}`}
            title="Grafico de pizza"
          >
            <PieChartIcon className="w-4 h-4 text-dark-600" />
          </button>
          <button
            onClick={() => setViewType('treemap')}
            className={`p-2 rounded-md transition-colors ${viewType === 'treemap' ? 'bg-white shadow-sm' : 'hover:bg-dark-200'}`}
            title="Treemap"
          >
            <Grid3X3 className="w-4 h-4 text-dark-600" />
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'bar' ? (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              style={{ cursor: onCategoriaClick ? 'pointer' : 'default' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => formatLargeNumber(value, 0)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 10 }}
                width={110}
                interval={0}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                onClick={(data) => onCategoriaClick?.(data.name)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    opacity={getOpacity(entry.name)}
                    stroke={entry.name === selectedCategoria ? '#1f2937' : 'none'}
                    strokeWidth={entry.name === selectedCategoria ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : viewType === 'pie' ? (
            <PieChart style={{ cursor: onCategoriaClick ? 'pointer' : 'default' }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name.substring(0, 10)} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
                onClick={(data) => onCategoriaClick?.(data.name)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    opacity={getOpacity(entry.name)}
                    stroke={entry.name === selectedCategoria ? '#1f2937' : 'none'}
                    strokeWidth={entry.name === selectedCategoria ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <Treemap
              data={chartData}
              dataKey="value"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<TreemapContent selectedCategoria={selectedCategoria} onCategoriaClick={onCategoriaClick} />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          )}
        </ResponsiveContainer>
      </div>

      {onCategoriaClick && (
        <p className="text-xs text-center text-dark-400 mt-2">
          Clique para filtrar
        </p>
      )}
    </div>
  );
}
