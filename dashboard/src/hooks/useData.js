import { useState, useEffect, useMemo } from 'react';

const BASE_URL = './';

/**
 * Hook para carregar todos os dados do dashboard
 */
export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Carregar dados em paralelo
        const [aggRes, detRes, foreRes, mapRes, sankeyRes, munRes] = await Promise.all([
          fetch(`${BASE_URL}data/aggregated.json`),
          fetch(`${BASE_URL}data/detailed.json`).catch(() => null),
          fetch(`${BASE_URL}data/forecasts.json`).catch(() => null),
          fetch(`${BASE_URL}data/map_data.json`).catch(() => null),
          fetch(`${BASE_URL}data/sankey_data.json`).catch(() => null),
          fetch(`${BASE_URL}data/municipios_data.json`).catch(() => null),
        ]);

        if (!aggRes.ok) throw new Error('Erro ao carregar dados agregados');

        const aggregated = await aggRes.json();
        const detailed = detRes?.ok ? await detRes.json() : null;
        const forecasts = foreRes?.ok ? await foreRes.json() : null;
        const mapData = mapRes?.ok ? await mapRes.json() : null;
        const sankey = sankeyRes?.ok ? await sankeyRes.json() : null;
        const municipios = munRes?.ok ? await munRes.json() : null;

        // Combinar todos os dados
        setData({
          metadata: aggregated.metadata,
          filters: aggregated.filters,
          timeseries: aggregated.timeseries,
          timeseriesByCadeia: aggregated.timeseriesByCadeia || [],
          byCategoria: aggregated.byCategoria,
          byPais: aggregated.byPais,
          topProdutos: aggregated.topProdutos,
          detailed,
          forecasts: forecasts?.previsoes || null,
          mapData,
          sankey,
          municipios
        });

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * Hook para filtrar dados com base nos filtros selecionados
 */
export function useFilteredData(data, filters) {
  return useMemo(() => {
    if (!data) return null;

    const { anoMin, anoMax, cadeias, tipo } = filters;

    // Filtrar série temporal por ano e cadeia
    let timeseries = data.timeseries || [];

    // Se há filtro de cadeias, recalcular timeseries a partir de timeseriesByCadeia
    if (cadeias && cadeias.length > 0 && data.timeseriesByCadeia) {
      // Filtrar por cadeias selecionadas
      const filteredByCadeia = data.timeseriesByCadeia.filter(item =>
        cadeias.includes(item.cadeia)
      );

      // Agrupar por ano
      const byYear = {};
      filteredByCadeia.forEach(item => {
        if (!byYear[item.ano]) {
          byYear[item.ano] = { ano: item.ano, valorExp: 0, valorImp: 0, pesoExp: 0, pesoImp: 0 };
        }
        byYear[item.ano].valorExp += item.valorExp || 0;
        byYear[item.ano].valorImp += item.valorImp || 0;
        byYear[item.ano].pesoExp += item.pesoExp || 0;
        byYear[item.ano].pesoImp += item.pesoImp || 0;
      });

      timeseries = Object.values(byYear).sort((a, b) => a.ano - b.ano);
    }

    // Filtrar por ano
    if (anoMin || anoMax) {
      timeseries = timeseries.filter(item => {
        if (anoMin && item.ano < anoMin) return false;
        if (anoMax && item.ano > anoMax) return false;
        return true;
      });
    }

    // Filtrar por categoria (cadeia)
    let byCategoria = data.byCategoria || { exportacoes: [], importacoes: [] };
    if (cadeias && cadeias.length > 0) {
      byCategoria = {
        exportacoes: byCategoria.exportacoes.filter(item =>
          cadeias.includes(item.categoria)
        ),
        importacoes: byCategoria.importacoes.filter(item =>
          cadeias.includes(item.categoria)
        )
      };
    }

    // Filtrar por país
    let byPais = data.byPais || { exportacoes: [], importacoes: [] };

    // Filtrar top produtos
    let topProdutos = data.topProdutos || { exportacoes: [], importacoes: [] };
    if (cadeias && cadeias.length > 0) {
      topProdutos = {
        exportacoes: topProdutos.exportacoes.filter(item =>
          cadeias.includes(item.cadeia)
        ),
        importacoes: topProdutos.importacoes.filter(item =>
          cadeias.includes(item.cadeia)
        )
      };
    }

    // Filtrar dados detalhados se disponíveis
    let detailed = null;
    if (data.detailed) {
      let timeseriesMensal = data.detailed.timeseriesMensal || [];
      if (anoMin || anoMax) {
        timeseriesMensal = timeseriesMensal.filter(item => {
          const ano = parseInt(item.periodo.split('-')[0]);
          if (anoMin && ano < anoMin) return false;
          if (anoMax && ano > anoMax) return false;
          return true;
        });
      }
      detailed = { timeseriesMensal };
    }

    // Filtrar dados do Sankey por cadeia
    let sankey = data.sankey || null;
    let filteredSankeyLinks = null;

    if (sankey && cadeias && cadeias.length > 0 && sankey.linksByCadeia) {
      // Debug: verificar dados
      console.log('[Sankey Filter] Cadeias selecionadas:', cadeias);
      console.log('[Sankey Filter] Total linksByCadeia:', sankey.linksByCadeia.length);
      console.log('[Sankey Filter] Cadeias disponíveis:', [...new Set(sankey.linksByCadeia.map(l => l.cadeia))]);

      // Filtrar links por cadeias selecionadas
      const filteredLinks = sankey.linksByCadeia.filter(link =>
        cadeias.includes(link.cadeia)
      );

      console.log('[Sankey Filter] Links filtrados:', filteredLinks.length);

      if (filteredLinks.length > 0) {
        // Agregar links do mesmo source-target
        const linkMap = {};
        filteredLinks.forEach(link => {
          const key = `${link.source}|${link.target}`;
          if (!linkMap[key]) {
            linkMap[key] = { source: link.source, target: link.target, value: 0 };
          }
          linkMap[key].value += link.value;
        });

        filteredSankeyLinks = Object.values(linkMap).sort((a, b) => b.value - a.value);

        // Filtrar nodes para manter apenas os que têm links
        const usedNodes = new Set();
        filteredSankeyLinks.forEach(link => {
          usedNodes.add(link.source);
          usedNodes.add(link.target);
        });

        const filteredNodes = sankey.nodes.filter(node => usedNodes.has(node.id));

        sankey = {
          ...sankey,
          nodes: filteredNodes,
          links: filteredSankeyLinks
        };
      }
    }

    return {
      timeseries,
      byCategoria,
      byPais,
      topProdutos,
      detailed,
      tipo,
      sankey,
      filteredSankeyLinks,
    };

  }, [data, filters]);
}

/**
 * Hook para calcular agregacoes com base nos dados filtrados
 */
export function useAggregations(data, filters = {}) {
  return useMemo(() => {
    if (!data) return null;

    const { anoMin, anoMax, cadeias } = filters;

    // Calcular timeseries filtrado (igual ao useFilteredData)
    let timeseries = data.timeseries || [];

    // Se há filtro de cadeias, recalcular timeseries a partir de timeseriesByCadeia
    if (cadeias && cadeias.length > 0 && data.timeseriesByCadeia) {
      const filteredByCadeia = data.timeseriesByCadeia.filter(item =>
        cadeias.includes(item.cadeia)
      );

      const byYear = {};
      filteredByCadeia.forEach(item => {
        if (!byYear[item.ano]) {
          byYear[item.ano] = { ano: item.ano, valorExp: 0, valorImp: 0, pesoExp: 0, pesoImp: 0 };
        }
        byYear[item.ano].valorExp += item.valorExp || 0;
        byYear[item.ano].valorImp += item.valorImp || 0;
        byYear[item.ano].pesoExp += item.pesoExp || 0;
        byYear[item.ano].pesoImp += item.pesoImp || 0;
      });

      timeseries = Object.values(byYear).sort((a, b) => a.ano - b.ano);
    }

    // Filtrar por ano
    if (anoMin || anoMax) {
      timeseries = timeseries.filter(item => {
        if (anoMin && item.ano < anoMin) return false;
        if (anoMax && item.ano > anoMax) return false;
        return true;
      });
    }

    // Calcular totais da série temporal filtrada
    const totals = {
      valorExp: timeseries.reduce((sum, item) => sum + (item.valorExp || 0), 0),
      valorImp: timeseries.reduce((sum, item) => sum + (item.valorImp || 0), 0),
      pesoExp: timeseries.reduce((sum, item) => sum + (item.pesoExp || 0), 0),
      pesoImp: timeseries.reduce((sum, item) => sum + (item.pesoImp || 0), 0),
    };

    totals.saldo = totals.valorExp - totals.valorImp;
    totals.corrente = totals.valorExp + totals.valorImp;

    // Calcular variacao YoY
    if (timeseries.length >= 2) {
      const lastYear = timeseries[timeseries.length - 1];
      const prevYear = timeseries[timeseries.length - 2];

      totals.variacaoExp = prevYear.valorExp > 0
        ? ((lastYear.valorExp - prevYear.valorExp) / prevYear.valorExp) * 100
        : 0;

      totals.variacaoImp = prevYear.valorImp > 0
        ? ((lastYear.valorImp - prevYear.valorImp) / prevYear.valorImp) * 100
        : 0;
    } else {
      totals.variacaoExp = 0;
      totals.variacaoImp = 0;
    }

    return {
      totals,
      timeseries
    };

  }, [data, filters]);
}

export default useData;
