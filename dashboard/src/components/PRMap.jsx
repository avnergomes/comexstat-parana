import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function PRMap({ data, title }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const geojsonDataRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Color scale function
  const getColor = useCallback((value, maxValue) => {
    if (!value) return '#e2e8f0';
    const ratio = Math.log(value + 1) / Math.log(maxValue + 1);
    const colors = ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];
    const index = Math.min(Math.floor(ratio * colors.length), colors.length - 1);
    return colors[index];
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      const map = L.map(mapRef.current).setView([-24.5, -51.5], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Load GeoJSON
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/mun_PR.geojson`);
        const geojson = await response.json();
        geojsonDataRef.current = geojson;

        // Add legend
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = () => {
          const div = L.DomUtil.create('div', 'bg-white/90 p-3 rounded-lg shadow-lg');
          div.innerHTML = `
            <p class="text-xs font-semibold text-dark-700 mb-2">Valor Exportado</p>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background: #f0fdf4"></div>
              <span class="text-xs">Baixo</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background: #22c55e"></div>
              <span class="text-xs">Médio</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-4 h-4 rounded" style="background: #14532d"></div>
              <span class="text-xs">Alto</span>
            </div>
          `;
          return div;
        };
        legend.addTo(map);
      } catch (error) {
        console.error('GeoJSON load error:', error);
      }

      setLoading(false);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON layer when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const geojson = geojsonDataRef.current;
    if (!map || !geojson) return;

    // Remove existing layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    // Create value lookup from data
    const valueLookup = {};
    if (data?.municipios) {
      data.municipios.forEach(m => {
        valueLookup[m.codigo] = m;
      });
    }

    const maxValue = data?.municipios?.[0]?.valor || 1;

    // Style function
    const style = (feature) => {
      const codigo = parseInt(feature.properties.CodIbge);
      const munData = valueLookup[codigo];
      return {
        fillColor: getColor(munData?.valor, maxValue),
        weight: 1,
        opacity: 1,
        color: '#94a3b8',
        fillOpacity: 0.8
      };
    };

    const highlightStyle = {
      weight: 3,
      color: '#22c55e',
      fillOpacity: 0.9
    };

    // Import Leaflet and create layer
    import('leaflet').then(L => {
      const geojsonLayer = L.geoJSON(geojson, {
        style: style,
        onEachFeature: (feature, layer) => {
          const codigo = parseInt(feature.properties.CodIbge);
          const nome = feature.properties.Municipio;
          const munData = valueLookup[codigo];

          let popupContent = `<div class="p-2">
            <p class="font-semibold text-dark-800">${nome}</p>`;

          if (munData) {
            popupContent += `
              <p class="text-sm text-dark-600">Valor: ${formatCurrency(munData.valor, 1)}</p>
              <p class="text-sm text-dark-600">Participação: ${munData.percentual.toFixed(1)}%</p>`;
          } else {
            popupContent += `<p class="text-sm text-dark-400">Sem dados de exportação</p>`;
          }

          popupContent += `</div>`;
          layer.bindPopup(popupContent);

          layer.on({
            mouseover: (e) => {
              e.target.setStyle(highlightStyle);
              e.target.bringToFront();
            },
            mouseout: (e) => {
              geojsonLayer.resetStyle(e.target);
            },
            click: (e) => {
              map.fitBounds(e.target.getBounds());
            }
          });
        }
      }).addTo(map);

      geojsonLayerRef.current = geojsonLayer;
      map.fitBounds(geojsonLayer.getBounds());
    });
  }, [data, getColor]);

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-50 rounded-xl z-10">
            <p className="text-dark-500">Carregando mapa...</p>
          </div>
        )}
        <div
          ref={mapRef}
          className="h-[500px] rounded-xl overflow-hidden border border-dark-100"
        />
      </div>

      {/* Summary */}
      {data?.municipios && (
        <div className="mt-4 pt-4 border-t border-dark-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-dark-500">Total Exportado</p>
              <p className="font-semibold text-primary-600">
                {formatCurrency(data.totalValor, 1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-500">Municípios Ativos</p>
              <p className="font-semibold text-dark-800">
                {data.municipios.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-500">Líder</p>
              <p className="font-semibold text-dark-800">
                {data.municipios[0]?.nome}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
