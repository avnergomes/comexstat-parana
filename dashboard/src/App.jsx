import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Filters from './components/Filters';
import ActiveFilters from './components/ActiveFilters';
import KpiCards from './components/KpiCards';
import Tabs from './components/Tabs';
import Loading from './components/Loading';
import TimeSeriesChart from './components/TimeSeriesChart';
import BalanceChart from './components/BalanceChart';
import CategoryChart from './components/CategoryChart';
import CountryChart from './components/CountryChart';
import ProductTable from './components/ProductTable';
import SankeyChart from './components/SankeyChart';
import ChordDiagram from './components/ChordDiagram';
import MunicipalityChart from './components/MunicipalityChart';
import PRMap from './components/PRMap';
import WorldMap from './components/WorldMap';
import ForecastChart from './components/ForecastChart';
import HeatmapChart from './components/HeatmapChart';
import YoYComparisonChart from './components/YoYComparisonChart';
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

  // Estado de filtros interativos (clique nos gráficos)
  const [interactiveFilters, setInteractiveFilters] = useState({
    categoria: null,
    pais: null,
    municipio: null,
    ano: null,
  });

  // Handlers para filtros interativos
  const handleCategoriaClick = useCallback((categoria) => {
    setInteractiveFilters(prev => ({
      ...prev,
      categoria: prev.categoria === categoria ? null : categoria,
    }));
  }, []);

  const handlePaisClick = useCallback((pais) => {
    setInteractiveFilters(prev => ({
      ...prev,
      pais: prev.pais === pais ? null : pais,
    }));
  }, []);

  const handleMunicipioClick = useCallback((municipio) => {
    setInteractiveFilters(prev => ({
      ...prev,
      municipio: prev.municipio === municipio ? null : municipio,
    }));
  }, []);

  const handleAnoClick = useCallback((ano) => {
    setInteractiveFilters(prev => ({
      ...prev,
      ano: prev.ano === ano ? null : ano,
    }));
  }, []);

  const handleRemoveInteractiveFilter = useCallback((key) => {
    setInteractiveFilters(prev => ({
      ...prev,
      [key]: null,
    }));
  }, []);

  const clearInteractiveFilters = useCallback(() => {
    setInteractiveFilters({
      categoria: null,
      pais: null,
      municipio: null,
      ano: null,
    });
  }, []);

  // Verifica se há filtros interativos ativos
  const hasInteractiveFilters = useMemo(() => {
    return Object.values(interactiveFilters).some(v => v !== null);
  }, [interactiveFilters]);

  // Load data
  const { data, loading, error } = useData();

  // Apply filters
  const filteredData = useFilteredData(data, filters);

  // Aplica filtros interativos aos dados filtrados
  const interactiveFilteredData = useMemo(() => {
    if (!filteredData) return filteredData;

    const result = { ...filteredData };

    // Filtrar byCategoria
    if (interactiveFilters.categoria && result.byCategoria) {
      result.byCategoria = result.byCategoria.filter(item =>
        item.cadeia === interactiveFilters.categoria
      );
    }

    // Filtrar byPais
    if (interactiveFilters.pais && result.byPais) {
      result.byPais = result.byPais.filter(item =>
        item.pais === interactiveFilters.pais
      );
    }

    // Filtrar timeseries por ano
    if (interactiveFilters.ano && result.timeseries) {
      result.timeseries = result.timeseries.filter(item =>
        item.ano === interactiveFilters.ano
      );
    }

    // Filtrar municipios
    if (interactiveFilters.municipio && result.municipios) {
      result.municipios = result.municipios.filter(item =>
        item.municipio === interactiveFilters.municipio
      );
    }

    return result;
  }, [filteredData, interactiveFilters]);

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

        {/* Filtros Interativos (clique nos gráficos) */}
        <ActiveFilters
          filters={interactiveFilters}
          onRemove={handleRemoveInteractiveFilter}
          onClear={clearInteractiveFilters}
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
                  data={interactiveFilteredData?.timeseries}
                  title="Evolução das Exportações e Importações"
                  tipo={filters.tipo}
                  onAnoClick={handleAnoClick}
                  selectedAno={interactiveFilters.ano}
                />
                <BalanceChart
                  data={interactiveFilteredData?.timeseries}
                  title="Balança Comercial Agrícola"
                />
              </div>

              {/* Comparativo YoY */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <YoYComparisonChart
                  data={interactiveFilteredData?.timeseries}
                  title="Comparativo Anual - Exportações"
                  tipo="exportacoes"
                />
                <YoYComparisonChart
                  data={interactiveFilteredData?.timeseries}
                  title="Comparativo Anual - Importações"
                  tipo="importacoes"
                />
              </div>

              {/* Heatmap Sazonal */}
              {interactiveFilteredData?.detailed && (
                <HeatmapChart
                  data={filteredData.detailed}
                  title="Padrão Sazonal por Cadeia - Exportações"
                  tipo="exportacoes"
                />
              )}

              {/* Sankey Chart - Municipality to Country flow */}
              {filters.tipo !== 'importacoes' && (
                <SankeyChart
                  data={interactiveFilteredData?.sankey || data?.sankey}
                  filteredLinks={interactiveFilteredData?.filteredSankeyLinks}
                  title="Fluxo de Exportacoes: Municipio > Pais de Destino"
                  filterNote={filters.cadeias?.length > 0 ? `Filtrado por: ${filters.cadeias.join(', ')}` : null}
                />
              )}

              {/* Chord Diagram - Trade relationships */}
              {filters.tipo !== 'importacoes' && (
                <ChordDiagram
                  data={interactiveFilteredData?.sankey || data?.sankey}
                  title="Relacoes Comerciais: Municipios x Paises (Visao Circular)"
                  width={650}
                  height={650}
                  topN={10}
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
                    data={interactiveFilteredData?.byCategoria}
                    title="Exportações por Cadeia"
                    tipo="exportacoes"
                    onCategoriaClick={handleCategoriaClick}
                    selectedCategoria={interactiveFilters.categoria}
                  />
                  <CategoryChart
                    data={interactiveFilteredData?.byCategoria}
                    title="Importações por Cadeia"
                    tipo="importacoes"
                    onCategoriaClick={handleCategoriaClick}
                    selectedCategoria={interactiveFilters.categoria}
                  />
                </div>
              ) : (
                <CategoryChart
                  data={interactiveFilteredData?.byCategoria}
                  title={filters.tipo === 'exportacoes' ? 'Exportações por Cadeia' : 'Importações por Cadeia'}
                  tipo={filters.tipo}
                  onCategoriaClick={handleCategoriaClick}
                  selectedCategoria={interactiveFilters.categoria}
                />
              )}
            </div>
          )}

          {/* Por País */}
          {activeTab === 'paises' && (
            <div className="space-y-6">
              {/* World Map */}
              <WorldMap
                data={interactiveFilteredData?.byPais}
                title={filters.tipo === 'importacoes' ? 'Mapa de Origens das Importações' : 'Mapa de Destinos das Exportações'}
                tipo={filters.tipo === 'importacoes' ? 'importacoes' : 'exportacoes'}
                onPaisClick={handlePaisClick}
                selectedPais={interactiveFilters.pais}
              />

              {filters.tipo === 'todos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CountryChart
                    data={interactiveFilteredData?.byPais}
                    title="Principais Destinos (Exportações)"
                    tipo="exportacoes"
                    onPaisClick={handlePaisClick}
                    selectedPais={interactiveFilters.pais}
                  />
                  <CountryChart
                    data={interactiveFilteredData?.byPais}
                    title="Principais Origens (Importações)"
                    tipo="importacoes"
                    onPaisClick={handlePaisClick}
                    selectedPais={interactiveFilters.pais}
                  />
                </div>
              ) : (
                <CountryChart
                  data={interactiveFilteredData?.byPais}
                  title={filters.tipo === 'exportacoes' ? 'Principais Destinos (Exportações)' : 'Principais Origens (Importações)'}
                  tipo={filters.tipo}
                  onPaisClick={handlePaisClick}
                  selectedPais={interactiveFilters.pais}
                />
              )}
            </div>
          )}

          {/* Por Município */}
          {activeTab === 'municipios' && (
            <div className="space-y-6">
              {/* PR Map */}
              <PRMap
                data={interactiveFilteredData?.municipios || data?.municipios}
                title="Mapa dos Municípios Exportadores do Paraná"
                filterNote={filters.cadeias?.length > 0 ? `Filtrado por: ${filters.cadeias.join(', ')}` : null}
                onMunicipioClick={handleMunicipioClick}
                selectedMunicipio={interactiveFilters.municipio}
              />

              <MunicipalityChart
                data={interactiveFilteredData?.municipios || data?.municipios}
                title="Ranking dos Municípios Exportadores"
                limit={20}
                onMunicipioClick={handleMunicipioClick}
                selectedMunicipio={interactiveFilters.municipio}
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
                      data={{ topProdutos: interactiveFilteredData?.topProdutos }}
                      tipo="exportacoes"
                      limit={30}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark-800 mb-4">
                      Top Produtos Importados
                    </h3>
                    <ProductTable
                      data={{ topProdutos: interactiveFilteredData?.topProdutos }}
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
                    data={{ topProdutos: interactiveFilteredData?.topProdutos }}
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
