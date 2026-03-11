import { X } from 'lucide-react';

const FILTER_LABELS = {
  categoria: 'Cadeia',
  pais: 'País',
  municipio: 'Município',
  ano: 'Ano',
};

export default function ActiveFilters({ filters, onRemove, onClear }) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== null);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-primary-50/80 backdrop-blur-sm rounded-xl mb-4 border border-primary-100/60 animate-in fade-in duration-200">
      <span className="text-sm font-medium text-primary-700">Filtros ativos:</span>
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="active-filter-badge bg-primary-100 text-primary-800 border-primary-200 shadow-sm hover:shadow-md"
        >
          <span className="text-primary-600">{FILTER_LABELS[key] || key}:</span>
          <span>{value}</span>
          <button
            onClick={() => onRemove(key)}
            className="ml-0.5 p-0.5 hover:bg-primary-200 hover:text-red-600 rounded-full transition-all duration-200"
            title={`Remover filtro ${FILTER_LABELS[key] || key}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="ml-2 text-sm text-primary-600 hover:text-red-600 hover:underline transition-colors duration-200"
      >
        Limpar todos
      </button>
    </div>
  );
}
