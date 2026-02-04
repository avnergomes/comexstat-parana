import { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp, X, TrendingUp, TrendingDown, ArrowLeftRight, Leaf, FlaskConical } from 'lucide-react';

export default function Filters({ filters, onChange, metadata, cadeias }) {
  const [expanded, setExpanded] = useState(false);

  if (!metadata) return null;

  const anos = metadata.anos || [];

  // Filtrar cadeias por tipoCategoria
  const filteredCadeias = cadeias?.filter(c => {
    if (!filters.tipoCategoria || filters.tipoCategoria === 'todos') return true;
    if (filters.tipoCategoria === 'produtos') return c.tipo === 'produto';
    if (filters.tipoCategoria === 'insumos') return c.tipo === 'insumo';
    return true;
  }) || [];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleCadeiaToggle = (cadeia) => {
    const current = filters.cadeias || [];
    const updated = current.includes(cadeia)
      ? current.filter(c => c !== cadeia)
      : [...current, cadeia];
    handleChange('cadeias', updated.length > 0 ? updated : null);
  };

  const handleReset = () => {
    onChange({
      anoMin: metadata.anoMin,
      anoMax: metadata.anoMax,
      tipo: 'todos',
      tipoCategoria: 'todos',
      cadeias: null,
    });
  };

  const hasActiveFilters =
    (filters.anoMin && filters.anoMin !== metadata.anoMin) ||
    (filters.anoMax && filters.anoMax !== metadata.anoMax) ||
    filters.tipo !== 'todos' ||
    filters.tipoCategoria !== 'todos' ||
    (filters.cadeias && filters.cadeias.length > 0);

  const activeFiltersCount = [
    filters.anoMin !== metadata.anoMin || filters.anoMax !== metadata.anoMax,
    filters.tipo !== 'todos',
    filters.tipoCategoria && filters.tipoCategoria !== 'todos',
    filters.cadeias && filters.cadeias.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-dark-100 mb-6 overflow-hidden">
      {/* Header compacto */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-dark-800">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Toggle Tipo - sempre visível */}
          <div className="hidden sm:flex items-center bg-dark-100 rounded-lg p-1">
            <button
              onClick={() => handleChange('tipo', 'todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filters.tipo === 'todos'
                  ? 'bg-white text-dark-800 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Todos
            </button>
            <button
              onClick={() => handleChange('tipo', 'exportacoes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filters.tipo === 'exportacoes'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Exportações
            </button>
            <button
              onClick={() => handleChange('tipo', 'importacoes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filters.tipo === 'importacoes'
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Importações
            </button>
          </div>

          {/* Toggle Categoria - Produtos vs Insumos */}
          <div className="hidden sm:flex items-center bg-dark-100 rounded-lg p-1">
            <button
              onClick={() => handleChange('tipoCategoria', 'todos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                (!filters.tipoCategoria || filters.tipoCategoria === 'todos')
                  ? 'bg-white text-dark-800 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              Todas Cadeias
            </button>
            <button
              onClick={() => handleChange('tipoCategoria', 'produtos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filters.tipoCategoria === 'produtos'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              Produtos
            </button>
            <button
              onClick={() => handleChange('tipoCategoria', 'insumos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                filters.tipoCategoria === 'insumos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Insumos
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-dark-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-dark-600 hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-dark-50"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="hidden sm:inline">Menos</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="hidden sm:inline">Mais filtros</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-dark-100 pt-4 space-y-4">
          {/* Tipo - versão mobile */}
          <div className="sm:hidden">
            <label className="block text-xs font-medium text-dark-600 mb-2">
              Tipo de Operação
            </label>
            <div className="flex items-center bg-dark-100 rounded-lg p-1">
              <button
                onClick={() => handleChange('tipo', 'todos')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  filters.tipo === 'todos'
                    ? 'bg-white text-dark-800 shadow-sm'
                    : 'text-dark-500'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleChange('tipo', 'exportacoes')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  filters.tipo === 'exportacoes'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-dark-500'
                }`}
              >
                Exportações
              </button>
              <button
                onClick={() => handleChange('tipo', 'importacoes')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  filters.tipo === 'importacoes'
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-dark-500'
                }`}
              >
                Importações
              </button>
            </div>
          </div>

          {/* Período */}
          <div>
            <label className="block text-xs font-medium text-dark-600 mb-2">
              Período
            </label>
            <div className="flex flex-wrap gap-1.5">
              {anos.map(ano => {
                const isInRange = ano >= (filters.anoMin || metadata.anoMin) &&
                                  ano <= (filters.anoMax || metadata.anoMax);
                const isStart = ano === filters.anoMin;
                const isEnd = ano === filters.anoMax;

                return (
                  <button
                    key={ano}
                    onClick={() => {
                      // Se clicar no mesmo ano, seleciona só esse ano
                      // Se não tem seleção, define como início
                      // Se tem início mas não fim, define como fim
                      if (!filters.anoMin || (filters.anoMin === ano && filters.anoMax === ano)) {
                        handleChange('anoMin', ano);
                        handleChange('anoMax', ano);
                      } else if (ano < filters.anoMin) {
                        handleChange('anoMin', ano);
                      } else if (ano > filters.anoMax) {
                        handleChange('anoMax', ano);
                      } else {
                        // Clicou dentro do range, ajusta o mais próximo
                        const distToMin = Math.abs(ano - filters.anoMin);
                        const distToMax = Math.abs(ano - filters.anoMax);
                        if (distToMin <= distToMax) {
                          handleChange('anoMin', ano);
                        } else {
                          handleChange('anoMax', ano);
                        }
                      }
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      isInRange
                        ? isStart || isEnd
                          ? 'bg-primary-600 text-white'
                          : 'bg-primary-100 text-primary-700'
                        : 'bg-dark-100 text-dark-500 hover:bg-dark-200'
                    }`}
                  >
                    {ano}
                  </button>
                );
              })}
              {(filters.anoMin !== metadata.anoMin || filters.anoMax !== metadata.anoMax) && (
                <button
                  onClick={() => {
                    handleChange('anoMin', metadata.anoMin);
                    handleChange('anoMax', metadata.anoMax);
                  }}
                  className="px-2 py-1.5 text-xs text-dark-400 hover:text-dark-600 transition-colors"
                >
                  Todos os anos
                </button>
              )}
            </div>
            <p className="text-xs text-dark-400 mt-1.5">
              {filters.anoMin === filters.anoMax
                ? `Ano: ${filters.anoMin}`
                : `Período: ${filters.anoMin || metadata.anoMin} - ${filters.anoMax || metadata.anoMax}`
              }
            </p>
          </div>

          {/* Cadeias Produtivas */}
          {filteredCadeias && filteredCadeias.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-dark-600">
                  Cadeias Produtivas
                  {filters.tipoCategoria && filters.tipoCategoria !== 'todos' && (
                    <span className="ml-2 text-dark-400">
                      ({filters.tipoCategoria === 'produtos' ? 'Produtos Agrícolas' : 'Insumos Agrícolas'})
                    </span>
                  )}
                </label>
                {filters.cadeias && filters.cadeias.length > 0 && (
                  <button
                    onClick={() => handleChange('cadeias', null)}
                    className="text-xs text-dark-400 hover:text-dark-600"
                  >
                    Limpar seleção
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filteredCadeias.map(cadeia => {
                  const isSelected = filters.cadeias?.includes(cadeia.nome);
                  return (
                    <button
                      key={cadeia.nome}
                      onClick={() => handleCadeiaToggle(cadeia.nome)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'text-white shadow-sm'
                          : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                      }`}
                      style={isSelected ? { backgroundColor: cadeia.cor } : {}}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: isSelected ? '#fff' : cadeia.cor }}
                      />
                      {cadeia.nome}
                      {isSelected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              {filters.cadeias && filters.cadeias.length > 0 && (
                <p className="text-xs text-dark-400 mt-1.5">
                  {filters.cadeias.length} cadeia{filters.cadeias.length > 1 ? 's' : ''} selecionada{filters.cadeias.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chips de filtros ativos (quando colapsado) */}
      {!expanded && hasActiveFilters && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {(filters.anoMin !== metadata.anoMin || filters.anoMax !== metadata.anoMax) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-dark-100 text-dark-600 text-xs rounded-full">
              {filters.anoMin === filters.anoMax ? filters.anoMin : `${filters.anoMin}-${filters.anoMax}`}
              <button
                onClick={() => {
                  handleChange('anoMin', metadata.anoMin);
                  handleChange('anoMax', metadata.anoMax);
                }}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.cadeias?.map(cadeia => {
            const cadeiaInfo = cadeias?.find(c => c.nome === cadeia);
            return (
              <span
                key={cadeia}
                className="inline-flex items-center gap-1 px-2 py-1 text-white text-xs rounded-full"
                style={{ backgroundColor: cadeiaInfo?.cor || '#64748b' }}
              >
                {cadeia}
                <button
                  onClick={() => handleCadeiaToggle(cadeia)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
