import { ResponsiveSankey } from '@nivo/sankey';
import { formatCurrency } from '../utils/format';

function CustomTooltip({ node, link }) {
  if (node) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
        <p className="font-semibold text-dark-800">{node.id.replace('mun_', '').replace('pais_', '')}</p>
        <p className="text-sm text-dark-600">
          Valor: <span className="font-medium">{formatCurrency(node.value, 1)}</span>
        </p>
      </div>
    );
  }
  if (link) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-dark-100 p-3">
        <p className="font-semibold text-dark-800 mb-1">
          {link.source.id.replace('mun_', '')} → {link.target.id.replace('pais_', '')}
        </p>
        <p className="text-sm text-dark-600">
          Valor FOB: <span className="font-medium">{formatCurrency(link.value, 1)}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function SankeyChart({ data, title, filterNote, filteredLinks }) {
  // Usar links filtrados se disponíveis
  const links = filteredLinks || data?.links || [];
  const nodes = data?.nodes || [];

  if (!data || nodes.length === 0 || links.length === 0) {
    return (
      <div className="chart-container h-[500px] flex items-center justify-center">
        <p className="text-dark-400">Sem dados para exibir</p>
      </div>
    );
  }

  // Filtrar nodes para incluir apenas os que têm links
  const usedNodeIds = new Set();
  links.forEach(link => {
    usedNodeIds.add(link.source);
    usedNodeIds.add(link.target);
  });

  const filteredNodes = nodes.filter(n => usedNodeIds.has(n.id));

  // Preparar dados para o Nivo Sankey
  const sankeyData = {
    nodes: filteredNodes.map(n => ({
      id: n.id,
      nodeColor: n.type === 'municipio' ? '#22c55e' : '#3b82f6'
    })),
    links: links.map(l => ({
      source: l.source,
      target: l.target,
      value: l.value
    }))
  };

  return (
    <div className="chart-container">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
          {filterNote && (
            <span className="text-xs text-dark-500 bg-dark-100 px-2 py-1 rounded">
              {filterNote}
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary-500" />
          <span className="text-sm text-dark-600">Municípios do PR</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent-500" />
          <span className="text-sm text-dark-600">Países de Destino</span>
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
          align="justify"
          colors={(node) => node.nodeColor || '#64748b'}
          nodeOpacity={1}
          nodeHoverOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={18}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderRadius={3}
          linkOpacity={0.5}
          linkHoverOpacity={0.8}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={16}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1]]
          }}
          label={(node) => node.id.replace('mun_', '').replace('pais_', '')}
          tooltip={CustomTooltip}
        />
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dark-100">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-dark-500">Municípios</p>
            <p className="font-semibold text-primary-600">
              {filteredNodes.filter(n => n.type === 'municipio').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-500">Países de Destino</p>
            <p className="font-semibold text-accent-600">
              {filteredNodes.filter(n => n.type === 'pais').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
