import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Filters from './components/Filters';
import KpiCards from './components/KpiCards';
import Tabs from './components/Tabs';
import Loading from './components/Loading';
import TimeSeriesChart from './components/TimeSeriesChart';
import BalanceChart from './components/BalanceChart';
import CategoryChart from './components/CategoryChart';
import CountryChart from './components/CountryChart';
import ProductTable from './components/ProductTable';
import SankeyChart from './components/SankeyChart';
import MunicipalityChart from './components/MunicipalityChart';
import PRMap from './components/PRMap';
import WorldMap from './components/WorldMap';
import ForecastChart from './components/ForecastChart';
import { useData, useFilteredData, useAggregations } from './hooks/useData';

const TABS = [
  { id: 'visao-geral', label: 'Visão Geral', icon: 'LayoutDashboard' },
  { id: 'categorias', label: 'Por Categoria', icon: 'PieChart' },
  { id: 'paises', label: 'Por País', icon: 'Globe' },
  { id: 'municipios', label: 'Por Município', icon: 'MapPin' },
  { id: 'produtos', label: 'Produtos', icon: 'Package' },
  { id: 'previsoes', label: 'Previsões', icon: 'TrendingUp' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [filters, setFilters] = useState({
    anoMin: null,
    anoMax: null,
    tipo: 'todos',
    tipoCategoria: 'todos',  // 'todos', 'produtos', 'insumos'
    cadeias: null,
  });

  // Load data
  const { data, loading, error } = useData();

  // Apply filters
  const filteredData = useFilteredData(data, filters);

  // Calculate aggregations (uses main data + filters, not filteredData)
  const aggregations = useAggregations(data, filters);

  // Set initial filter values when data loads
  useEffect(() => {
    if (data?.metadata) {
      setFilters(prev => ({
        ...prev,
        anoMin: prev.anoMin || data.metadata.anoMin,
        anoMax: prev.anoMax || data.metadata.anoMax,
      }));
    }
  }, [data?.metadata]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Erro ao carregar dados</p>
          <p className="text-dark-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-primary-50/30">
      <Header metadata={data?.metadata} />

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Filters
          filters={filters}
          onChange={setFilters}
          metadata={data?.metadata}
          cadeias={data?.filters?.cadeias}
        />

        {/* KPI Cards */}
        <KpiCards totals={aggregations?.totals} />

        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {/* Visão Geral */}
          {activeTab === 'visao-geral' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeSeriesChart
                  data={filteredData?.timeseries}
                  title="Evolução das Exportações e Importações"
                  tipo={filters.tipo}
                />
                <BalanceChart
                  data={filteredData?.timeseries}
                  title="Balança Comercial Agrícola"
                />
              </div>

              {/* Sankey Chart - Municipality to Country flow */}
              {filters.tipo !== 'importacoes' && (
                <SankeyChart
                  data={filteredData?.sankey || data?.sankey}
                  filteredLinks={filteredData?.filteredSankeyLinks}
                  title="Fluxo de Exportações: Município → País de Destino"
                  filterNote={filters.cadeias?.length > 0 ? `Filtrado por: ${filters.cadeias.join(', ')}` : null}
                />
              )}
            </div>
          )}

          {/* Por Categoria */}
          {activeTab === 'categorias' && (
            <div className="space-y-6">
              {filters.tipo === 'todos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CategoryChart
                    data={filteredData?.byCategoria}
                    title="Exportações por Cadeia"
                    tipo="exportacoes"
                  />
                  <CategoryChart
                    data={filteredData?.byCategoria}
                    title="Importações por Cadeia"
                    tipo="importacoes"
                  />
                </div>
              ) : (
                <CategoryChart
                  data={filteredData?.byCategoria}
                  title={filters.tipo === 'exportacoes' ? 'Exportações por Cadeia' : 'Importações por Cadeia'}
                  tipo={filters.tipo}
                />
              )}
            </div>
          )}

          {/* Por País */}
          {activeTab === 'paises' && (
            <div className="space-y-6">
              {/* World Map */}
              <WorldMap
                data={filteredData?.byPais}
                title={filters.tipo === 'importacoes' ? 'Mapa de Origens das Importações' : 'Mapa de Destinos das Exportações'}
                tipo={filters.tipo === 'importacoes' ? 'importacoes' : 'exportacoes'}
              />

              {filters.tipo === 'todos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CountryChart
                    data={filteredData?.byPais}
                    title="Principais Destinos (Exportações)"
                    tipo="exportacoes"
                  />
                  <CountryChart
                    data={filteredData?.byPais}
                    title="Principais Origens (Importações)"
                    tipo="importacoes"
                  />
                </div>
              ) : (
                <CountryChart
                  data={filteredData?.byPais}
                  title={filters.tipo === 'exportacoes' ? 'Principais Destinos (Exportações)' : 'Principais Origens (Importações)'}
                  tipo={filters.tipo}
                />
              )}
            </div>
          )}

          {/* Por Município */}
          {activeTab === 'municipios' && (
            <div className="space-y-6">
              {/* PR Map */}
              <PRMap
                data={filteredData?.municipios || data?.municipios}
                title="Mapa dos Municípios Exportadores do Paraná"
                filterNote={filters.cadeias?.length > 0 ? `Filtrado por: ${filters.cadeias.join(', ')}` : null}
              />

              <MunicipalityChart
                data={filteredData?.municipios || data?.municipios}
                title="Ranking dos Municípios Exportadores"
                limit={20}
              />
            </div>
          )}

          {/* Produtos */}
          {activeTab === 'produtos' && (
            <div className="space-y-6">
              {filters.tipo === 'todos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-800 mb-4">
                      Top Produtos Exportados
                    </h3>
                    <ProductTable
                      data={{ topProdutos: filteredData?.topProdutos }}
                      tipo="exportacoes"
                      limit={30}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark-800 mb-4">
                      Top Produtos Importados
                    </h3>
                    <ProductTable
                      data={{ topProdutos: filteredData?.topProdutos }}
                      tipo="importacoes"
                      limit={30}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-dark-800 mb-4">
                    {filters.tipo === 'exportacoes' ? 'Top Produtos Exportados' : 'Top Produtos Importados'}
                  </h3>
                  <ProductTable
                    data={{ topProdutos: filteredData?.topProdutos }}
                    tipo={filters.tipo}
                    limit={50}
                  />
                </div>
              )}
            </div>
          )}

          {/* Previsões */}
          {activeTab === 'previsoes' && (
            <div className="space-y-6">
              <ForecastChart
                historicalData={data?.timeseries}
                forecastData={data?.forecasts}
                title="Projeções de Comércio Exterior Agrícola"
              />

              <div className="chart-container">
                <h3 className="text-lg font-semibold text-dark-800 mb-4">
                  Metodologia das Projeções
                </h3>
                <div className="prose prose-sm text-dark-600">
                  <p>
                    As projeções são calculadas utilizando médias móveis exponenciais
                    e análise de tendência linear dos últimos 5 anos de dados.
                    O intervalo de confiança considera a volatilidade histórica das séries.
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>• Dados históricos: 2020-2025</li>
                    <li>• Modelo: Média móvel exponencial + tendência</li>
                    <li>• Intervalo de confiança: 80%</li>
                  </ul>
                  <p className="text-xs text-dark-400 mt-4">
                    Nota: As projeções são estimativas baseadas em dados históricos
                    e não devem ser consideradas como previsões definitivas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
