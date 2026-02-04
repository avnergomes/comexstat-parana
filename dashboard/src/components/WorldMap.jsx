import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { formatCurrency } from '../utils/format';

// Mapping Portuguese country names to ISO 2-letter codes
const COUNTRY_TO_ISO = {
  'Afeganistão': 'AF', 'África do Sul': 'ZA', 'Albânia': 'AL', 'Alemanha': 'DE',
  'Andorra': 'AD', 'Angola': 'AO', 'Antígua e Barbuda': 'AG', 'Arábia Saudita': 'SA',
  'Argélia': 'DZ', 'Argentina': 'AR', 'Armênia': 'AM', 'Austrália': 'AU',
  'Áustria': 'AT', 'Azerbaijão': 'AZ', 'Bahamas': 'BS', 'Bangladesh': 'BD',
  'Barbados': 'BB', 'Barein': 'BH', 'Belarus': 'BY', 'Bélgica': 'BE',
  'Belize': 'BZ', 'Benin': 'BJ', 'Bolívia': 'BO', 'Botsuana': 'BW',
  'Brasil': 'BR', 'Brunei': 'BN', 'Bulgária': 'BG', 'Burkina Faso': 'BF',
  'Burundi': 'BI', 'Butão': 'BT', 'Cabo Verde': 'CV', 'Camarões': 'CM',
  'Camboja': 'KH', 'Canadá': 'CA', 'Catar': 'QA', 'Cazaquistão': 'KZ',
  'Chade': 'TD', 'Chile': 'CL', 'China': 'CN', 'Chipre': 'CY',
  'Colômbia': 'CO', 'Comores': 'KM', 'Congo': 'CG', 'Congo, República Democrática': 'CD',
  'Coreia do Norte': 'KP', 'Coreia do Sul': 'KR', 'Costa do Marfim': 'CI',
  'Costa Rica': 'CR', 'Coveite (Kuweit)': 'KW', 'Croácia': 'HR', 'Cuba': 'CU',
  'Dinamarca': 'DK', 'Djibuti': 'DJ', 'Dominica': 'DM', 'Egito': 'EG',
  'El Salvador': 'SV', 'Emirados Árabes Unidos': 'AE', 'Equador': 'EC',
  'Eritreia': 'ER', 'Eslováquia': 'SK', 'Eslovênia': 'SI', 'Espanha': 'ES',
  'Estados Unidos': 'US', 'Estônia': 'EE', 'Etiópia': 'ET', 'Fiji': 'FJ',
  'Filipinas': 'PH', 'Finlândia': 'FI', 'França': 'FR', 'Gabão': 'GA',
  'Gâmbia': 'GM', 'Gana': 'GH', 'Geórgia': 'GE', 'Granada': 'GD',
  'Grécia': 'GR', 'Guatemala': 'GT', 'Guiana': 'GY', 'Guiné': 'GN',
  'Guiné Equatorial': 'GQ', 'Guiné-Bissau': 'GW', 'Haiti': 'HT', 'Honduras': 'HN',
  'Hong Kong': 'HK', 'Hungria': 'HU', 'Iêmen': 'YE', 'Índia': 'IN',
  'Indonésia': 'ID', 'Irã': 'IR', 'Iraque': 'IQ', 'Irlanda': 'IE',
  'Islândia': 'IS', 'Israel': 'IL', 'Itália': 'IT', 'Jamaica': 'JM',
  'Japão': 'JP', 'Jordânia': 'JO', 'Laos': 'LA', 'Letônia': 'LV',
  'Líbano': 'LB', 'Libéria': 'LR', 'Líbia': 'LY', 'Lituânia': 'LT',
  'Luxemburgo': 'LU', 'Macau': 'MO', 'Macedônia': 'MK', 'Madagascar': 'MG',
  'Malásia': 'MY', 'Malavi': 'MW', 'Maldivas': 'MV', 'Mali': 'ML',
  'Malta': 'MT', 'Marrocos': 'MA', 'Maurício': 'MU', 'Mauritânia': 'MR',
  'México': 'MX', 'Mianmar': 'MM', 'Moldávia': 'MD', 'Mongólia': 'MN',
  'Montenegro': 'ME', 'Moçambique': 'MZ', 'Namíbia': 'NA', 'Nepal': 'NP',
  'Nicarágua': 'NI', 'Níger': 'NE', 'Nigéria': 'NG', 'Noruega': 'NO',
  'Nova Zelândia': 'NZ', 'Omã': 'OM', 'Países Baixos (Holanda)': 'NL',
  'Paquistão': 'PK', 'Panamá': 'PA', 'Papua Nova Guiné': 'PG', 'Paraguai': 'PY',
  'Peru': 'PE', 'Polônia': 'PL', 'Portugal': 'PT', 'Quênia': 'KE',
  'Quirguistão': 'KG', 'Reino Unido': 'GB', 'República Centro-Africana': 'CF',
  'República Dominicana': 'DO', 'Romênia': 'RO', 'Ruanda': 'RW', 'Rússia': 'RU',
  'Samoa': 'WS', 'Senegal': 'SN', 'Serra Leoa': 'SL', 'Sérvia': 'RS',
  'Singapura': 'SG', 'Síria': 'SY', 'Somália': 'SO', 'Sri Lanka': 'LK',
  'Sudão': 'SD', 'Sudão do Sul': 'SS', 'Suécia': 'SE', 'Suíça': 'CH',
  'Suriname': 'SR', 'Tailândia': 'TH', 'Taiwan (Formosa)': 'TW', 'Tanzânia': 'TZ',
  'Tcheca, República': 'CZ', 'Timor Leste': 'TL', 'Togo': 'TG', 'Tonga': 'TO',
  'Trinidad e Tobago': 'TT', 'Tunísia': 'TN', 'Turcomenistão': 'TM', 'Turquia': 'TR',
  'Ucrânia': 'UA', 'Uganda': 'UG', 'Uruguai': 'UY', 'Uzbequistão': 'UZ',
  'Vanuatu': 'VU', 'Venezuela': 'VE', 'Vietnã': 'VN', 'Zâmbia': 'ZM', 'Zimbábue': 'ZW',
  'Palestina': 'PS', 'Santa Lúcia': 'LC', 'São Vicente e Granadinas': 'VC',
  'Seicheles': 'SC', 'São Tomé e Príncipe': 'ST', 'São Cristóvão e Névis': 'KN',
};

// Color scale - 5 levels like VBP (MAP_GRADIENTS.green)
const MAP_COLORS = ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'];

const getColor = (value, maxValue) => {
  if (!value || value === 0) return '#f3f4f6'; // gray-100 for no data

  // Use percentage of max value
  const percent = (value / maxValue) * 100;

  // 5 levels based on percentage
  if (percent > 15) return MAP_COLORS[4];  // darkest (>15%)
  if (percent > 5) return MAP_COLORS[3];   // dark (5-15%)
  if (percent > 2) return MAP_COLORS[2];   // medium (2-5%)
  if (percent > 0.5) return MAP_COLORS[1]; // light (0.5-2%)
  return MAP_COLORS[0];                     // lightest (<0.5%)
};

export default function WorldMap({ data, title, tipo = 'exportacoes' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const countries = data?.[tipo] || [];
  const total = countries.reduce((sum, c) => sum + (c.valor || 0), 0);
  const maxValue = countries[0]?.valor || 1;

  // Create lookup by ISO code
  const dataByIso = {};
  countries.forEach(c => {
    const iso = COUNTRY_TO_ISO[c.pais];
    if (iso) {
      dataByIso[iso] = {
        ...c,
        percentual: total > 0 ? (c.valor / total) * 100 : 0,
      };
    }
  });

  // Store current data in ref for event handlers
  const dataRef = useRef({ dataByIso, maxValue });
  dataRef.current = { dataByIso, maxValue };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet
    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      // Create map
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 6,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add tile layer (simple gray basemap)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Load GeoJSON
      try {
        const response = await fetch('./data/countries_merged.geojson');
        const geojson = await response.json();

        // Style function - uses dataRef for current values
        const style = (feature) => {
          const iso = feature.properties?.ISO_CODE;
          const { dataByIso: currentData, maxValue: currentMax } = dataRef.current;
          const countryData = currentData[iso];
          const value = countryData?.valor || 0;

          return {
            fillColor: getColor(value, currentMax),
            weight: 0.5,
            opacity: 1,
            color: '#9ca3af',
            fillOpacity: value > 0 ? 0.8 : 0.3,
          };
        };

        // Highlight on hover - uses dataRef for current values
        const onEachFeature = (feature, layer) => {
          const iso = feature.properties?.ISO_CODE;

          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              const { dataByIso: currentData } = dataRef.current;
              const countryData = currentData[iso];
              layer.setStyle({
                weight: 2,
                color: '#1f2937',
                fillOpacity: 0.9,
              });
              layer.bringToFront();
              if (countryData) {
                setSelectedCountry(countryData);
              }
            },
            mouseout: (e) => {
              geojsonLayerRef.current?.resetStyle(e.target);
              setSelectedCountry(null);
            },
          });
        };

        const geojsonLayer = L.geoJSON(geojson, {
          style,
          onEachFeature,
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer;
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update styles when data changes
  useEffect(() => {
    if (!geojsonLayerRef.current) return;

    geojsonLayerRef.current.eachLayer((layer) => {
      if (layer.feature) {
        const iso = layer.feature.properties?.ISO_CODE;
        const countryData = dataByIso[iso];
        const value = countryData?.valor || 0;

        layer.setStyle({
          fillColor: getColor(value, maxValue),
          fillOpacity: value > 0 ? 0.8 : 0.3,
        });
      }
    });
  }, [data, tipo, dataByIso, maxValue]);

  const topCountries = countries.slice(0, 10);

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-dark-800">{title}</h3>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="h-[400px] w-full rounded-xl border border-dark-100 bg-dark-50 z-0"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-dark-500">Carregando mapa...</div>
          </div>
        )}

        {/* Tooltip */}
        {selectedCountry && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-dark-100 z-[1000]">
            <p className="font-semibold text-dark-800">{selectedCountry.pais}</p>
            <p className="text-sm text-dark-600">
              Valor: {formatCurrency(selectedCountry.valor, 2)}
            </p>
            <p className="text-sm text-dark-600">
              Participação: {selectedCountry.percentual?.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 border border-dark-100 z-[1000]">
          <p className="text-xs font-medium text-dark-700 mb-1">Participação</p>
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#f3f4f6' }}></div>
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#dcfce7' }}></div>
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#86efac' }}></div>
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }}></div>
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#15803d' }}></div>
            <div className="w-6 h-3 rounded-sm" style={{ backgroundColor: '#14532d' }}></div>
          </div>
          <div className="flex justify-between text-[9px] text-dark-500 mt-0.5 px-0.5">
            <span>0</span>
            <span>0.5%</span>
            <span>2%</span>
            <span>5%</span>
            <span>15%+</span>
          </div>
        </div>
      </div>

      {/* Top 10 Countries */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {topCountries.map((country, idx) => (
          <div
            key={country.pais}
            className="p-2 rounded-lg border border-dark-100 bg-white hover:bg-dark-50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-dark-400">{idx + 1}º</span>
              <span className="text-xs font-medium text-dark-700 truncate">
                {country.pais}
              </span>
            </div>
            <p className="text-sm font-semibold text-dark-800 mt-0.5">
              {formatCurrency(country.valor, 1)}
            </p>
            <p className="text-xs text-dark-400">
              {((country.valor / total) * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-dark-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-dark-500">
              Total {tipo === 'importacoes' ? 'Importado' : 'Exportado'}
            </p>
            <p className={`font-semibold ${tipo === 'importacoes' ? 'text-accent-600' : 'text-primary-600'}`}>
              {formatCurrency(total, 1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-dark-500">Países</p>
            <p className="font-semibold text-dark-800">{countries.length}</p>
          </div>
          <div>
            <p className="text-xs text-dark-500">Principal Parceiro</p>
            <p className="font-semibold text-dark-800">{countries[0]?.pais || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
