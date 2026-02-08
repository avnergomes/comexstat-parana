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
    <div className="flex flex-wrap items-center gap-2 p-3 bg-primary-50 rounded-xl mb-4 animate-in fade-in duration-200">
      <span className="text-sm font-medium text-primary-700">Filtros ativos:</span>
      {activeFilters.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium shadow-sm"
        >
          <span className="text-primary-600">{FILTER_LABELS[key] || key}:</span>
          <span>{value}</span>
          <button
            onClick={() => onRemove(key)}
            className="ml-0.5 p-0.5 hover:bg-primary-200 rounded-full transition-colors"
            title={`Remover filtro ${FILTER_LABELS[key] || key}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="ml-2 text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors"
      >
        Limpar todos
      </button>
    </div>
  );
}
