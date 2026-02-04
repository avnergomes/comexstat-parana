import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency, formatWeight, getCategoryColor } from '../utils/format';

export default function ProductTable({ data, tipo = 'exportacoes', limit = 50 }) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('valor');
  const [sortDirection, setSortDirection] = useState('desc');

  const produtos = data?.topProdutos?.[tipo] || [];

  // Filtrar e ordenar
  const filteredData = useMemo(() => {
    let result = [...produtos];

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.ncm?.toString().includes(searchLower) ||
        item.descricao?.toLowerCase().includes(searchLower) ||
        item.categoria?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar
    result.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result.slice(0, limit);
  }, [produtos, search, sortField, sortDirection, limit]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  if (produtos.length === 0) {
    return (
      <div className="chart-container h-96 flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por NCM, produto ou categoria..."
            className="w-full pl-10 pr-4 py-2 bg-dark-50 border border-dark-200 rounded-xl text-sm
                     focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
        <span className="text-sm text-dark-500">
          {filteredData.length} de {produtos.length} produtos
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left">NCM</th>
              <th className="px-4 py-3 text-left">Produto</th>
              <th className="px-4 py-3 text-left">Categoria</th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-dark-100"
                onClick={() => handleSort('valor')}
              >
                <div className="flex items-center justify-end gap-1">
                  Valor FOB
                  <SortIcon field="valor" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:bg-dark-100"
                onClick={() => handleSort('peso')}
              >
                <div className="flex items-center justify-end gap-1">
                  Peso
                  <SortIcon field="peso" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="table-row">
                <td className="px-4 py-3 font-mono text-sm text-dark-600">
                  {item.ncm}
                </td>
                <td className="px-4 py-3 text-sm text-dark-800 max-w-xs truncate" title={item.descricao}>
                  {item.descricao}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getCategoryColor(item.categoria)}20`,
                      color: getCategoryColor(item.categoria)
                    }}
                  >
                    {item.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-dark-800">
                  {formatCurrency(item.valor, 1)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-dark-600">
                  {formatWeight(item.peso)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
