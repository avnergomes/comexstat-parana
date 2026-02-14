import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

// Coordenadas dos centros dos paises (lon, lat) - Todos os paises do dataset ComexStat
const COUNTRY_COORDS = {
  // Europa
  'Alemanha': [10.45, 51.17],
  'Albânia': [20.17, 41.15],
  'Andorra': [1.52, 42.51],
  'Áustria': [14.55, 47.52],
  'Bélgica': [4.47, 50.50],
  'Belarus': [27.95, 53.71],
  'Bulgária': [25.49, 42.73],
  'Chipre': [33.43, 35.13],
  'Croácia': [15.20, 45.10],
  'Dinamarca': [9.50, 56.26],
  'Eslováquia': [19.70, 48.67],
  'Eslovênia': [14.99, 46.15],
  'Espanha': [-3.75, 40.46],
  'Estônia': [25.01, 58.60],
  'Finlândia': [25.75, 61.92],
  'França': [2.21, 46.23],
  'Geórgia': [43.36, 42.32],
  'Grécia': [21.82, 39.07],
  'Hungria': [19.50, 47.16],
  'Irlanda': [-8.24, 53.41],
  'Islândia': [-19.02, 64.96],
  'Itália': [12.57, 41.87],
  'Letônia': [24.60, 56.88],
  'Lituânia': [23.88, 55.17],
  'Luxemburgo': [6.13, 49.82],
  'Macedônia': [21.75, 41.51],
  'Malta': [14.38, 35.94],
  'Moldávia': [28.37, 47.41],
  'Montenegro': [19.37, 42.71],
  'Noruega': [8.47, 60.47],
  'Países Baixos (Holanda)': [5.29, 52.13],
  'Polônia': [19.15, 51.92],
  'Portugal': [-8.22, 39.40],
  'Reino Unido': [-3.44, 55.38],
  'Romênia': [24.97, 45.94],
  'Rússia': [105.32, 61.52],
  'Sérvia': [21.01, 44.02],
  'Suécia': [18.64, 60.13],
  'Suíça': [8.23, 46.82],
  'Tcheca, República': [15.47, 49.82],
  'Ucrânia': [31.17, 48.38],

  // Asia
  'Afeganistão': [67.71, 33.94],
  'Arábia Saudita': [45.08, 23.89],
  'Armênia': [45.04, 40.07],
  'Azerbaijão': [47.58, 40.14],
  'Bangladesh': [90.36, 23.68],
  'Barein': [50.56, 26.07],
  'Brunei': [114.73, 4.54],
  'Butão': [90.43, 27.51],
  'Camboja': [104.99, 12.57],
  'Cazaquistão': [66.92, 48.02],
  'China': [104.20, 35.86],
  'Cingapura': [103.82, 1.35],
  'Singapura': [103.82, 1.35],
  'Coreia do Norte': [127.51, 40.34],
  'Coreia do Sul': [127.77, 35.91],
  'Emirados Árabes Unidos': [53.85, 23.42],
  'Filipinas': [121.77, 12.88],
  'Hong Kong': [114.11, 22.40],
  'Iêmen': [48.52, 15.55],
  'Índia': [78.96, 20.59],
  'Indonésia': [113.92, -0.79],
  'Irã': [53.69, 32.43],
  'Iraque': [43.68, 33.22],
  'Israel': [34.85, 31.05],
  'Japão': [138.25, 36.20],
  'Jordânia': [36.24, 30.59],
  'Coveite (Kuweit)': [47.48, 29.31],
  'Kuwait': [47.48, 29.31],
  'Laos': [102.50, 19.86],
  'Líbano': [35.86, 33.85],
  'Macau': [113.54, 22.20],
  'Malásia': [101.98, 4.21],
  'Maldivas': [73.22, 3.20],
  'Mianmar': [95.96, 21.91],
  'Mongólia': [103.85, 46.86],
  'Nepal': [84.12, 28.39],
  'Omã': [55.92, 21.51],
  'Paquistão': [69.35, 30.38],
  'Palestina': [35.23, 31.95],
  'Catar': [51.18, 25.35],
  'Quirguistão': [74.77, 41.20],
  'Síria': [38.99, 34.80],
  'Sri Lanka': [80.77, 7.87],
  'Tailândia': [100.99, 15.87],
  'Taiwan (Formosa)': [120.96, 23.69],
  'Taiwan': [120.96, 23.69],
  'Timor Leste': [125.73, -8.87],
  'Turcomenistão': [59.56, 38.97],
  'Turquia': [35.24, 38.96],
  'Uzbequistão': [64.59, 41.38],
  'Vietnã': [108.28, 14.06],

  // Americas
  'Antígua e Barbuda': [-61.80, 17.06],
  'Argentina': [-63.62, -38.42],
  'Bahamas': [-77.40, 25.03],
  'Barbados': [-59.54, 13.19],
  'Belize': [-88.50, 17.19],
  'Bolívia': [-63.59, -16.29],
  'Canadá': [-106.35, 56.13],
  'Chile': [-71.54, -35.68],
  'Colômbia': [-74.30, 4.57],
  'Costa Rica': [-83.75, 9.75],
  'Cuba': [-77.78, 21.52],
  'Dominica': [-61.37, 15.41],
  'El Salvador': [-88.90, 13.79],
  'Equador': [-78.18, -1.83],
  'Estados Unidos': [-95.71, 37.09],
  'Granada': [-61.68, 12.26],
  'Guatemala': [-90.23, 15.78],
  'Guiana': [-58.93, 4.86],
  'Haiti': [-72.29, 18.97],
  'Honduras': [-86.24, 15.20],
  'Jamaica': [-77.30, 18.11],
  'México': [-102.55, 23.63],
  'Nicarágua': [-85.21, 12.87],
  'Panamá': [-80.78, 8.54],
  'Paraguai': [-58.44, -23.44],
  'Peru': [-75.02, -9.19],
  'República Dominicana': [-70.16, 18.74],
  'Santa Lúcia': [-60.98, 13.91],
  'São Cristóvão e Névis': [-62.78, 17.36],
  'São Vicente e Granadinas': [-61.29, 12.98],
  'Suriname': [-56.03, 3.92],
  'Trinidad e Tobago': [-61.22, 10.69],
  'Uruguai': [-55.77, -32.52],
  'Venezuela': [-66.59, 6.42],

  // Africa
  'África do Sul': [22.94, -30.56],
  'Angola': [17.87, -11.20],
  'Argélia': [1.66, 28.03],
  'Benin': [2.32, 9.31],
  'Botsuana': [24.68, -22.33],
  'Burkina Faso': [-1.56, 12.24],
  'Burundi': [29.92, -3.37],
  'Cabo Verde': [-24.01, 16.00],
  'Camarões': [12.35, 7.37],
  'Chade': [18.73, 15.45],
  'Comores': [43.87, -11.88],
  'Congo': [15.83, -0.23],
  'Congo, República Democrática': [21.76, -4.04],
  'Costa do Marfim': [-5.55, 7.54],
  'Djibuti': [42.59, 11.83],
  'Egito': [30.80, 26.82],
  'Eritreia': [39.78, 15.18],
  'Etiópia': [40.49, 9.15],
  'Gabão': [11.61, -0.80],
  'Gâmbia': [-15.31, 13.44],
  'Gana': [-1.02, 7.95],
  'Guiné': [-9.70, 9.95],
  'Guiné Equatorial': [10.27, 1.65],
  'Guiné-Bissau': [-15.18, 11.80],
  'Líbia': [17.23, 26.34],
  'Libéria': [-9.43, 6.43],
  'Madagascar': [46.87, -18.77],
  'Malavi': [34.30, -13.25],
  'Mali': [-4.00, 17.57],
  'Marrocos': [-7.09, 31.79],
  'Maurício': [57.55, -20.35],
  'Mauritânia': [-10.94, 21.01],
  'Moçambique': [35.53, -18.67],
  'Namíbia': [18.49, -22.96],
  'Níger': [8.08, 17.61],
  'Nigéria': [8.68, 9.08],
  'Quênia': [37.91, -0.02],
  'República Centro-Africana': [20.94, 6.61],
  'Ruanda': [29.87, -1.94],
  'São Tomé e Príncipe': [6.61, 0.19],
  'Seicheles': [55.49, -4.68],
  'Senegal': [-14.45, 14.50],
  'Serra Leoa': [-11.78, 8.46],
  'Somália': [46.20, 5.15],
  'Sudão': [30.22, 12.86],
  'Sudão do Sul': [31.31, 6.88],
  'Tanzânia': [34.89, -6.37],
  'Togo': [0.82, 8.62],
  'Tunísia': [9.54, 33.89],
  'Uganda': [32.29, 1.37],
  'Zâmbia': [27.85, -13.13],
  'Zimbábue': [29.15, -19.02],

  // Oceania
  'Austrália': [133.78, -25.27],
  'Fiji': [179.41, -16.58],
  'Nova Zelândia': [174.89, -40.90],
  'Papua Nova Guiné': [143.96, -6.31],
  'Samoa': [-172.10, -13.76],
  'Tonga': [-175.20, -21.18],
  'Vanuatu': [166.96, -15.38],
}

// Centro do Parana (origem dos arcos)
const PARANA_CENTER = [-51.5, -24.5]

// Cores melhoradas para melhor contraste
const OCEAN_COLOR = '#e0f2fe' // Azul claro para oceano
const COUNTRY_DEFAULT_COLOR = '#f8fafc' // Cinza muito claro
const COUNTRY_BORDER_COLOR = '#94a3b8' // Borda mais visivel
const COUNTRY_HOVER_COLOR = '#fef3c7' // Amarelo hover

// Gradiente de cores para destinos (do mais claro ao mais escuro baseado no valor)
const DEST_COLORS = ['#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d']

// Cores dos arcos
const ARC_COLOR = '#059669' // Verde esmeralda
const ARC_HOVER_COLOR = '#f59e0b' // Amarelo/laranja

export default function ConnectionMap({
  data,
  title = 'Mapa de Conexoes Comerciais - Exportacoes do Parana',
  width = 900,
  height = 480,
}) {
  const svgRef = useRef()
  const [geoData, setGeoData] = useState(null)
  const [hoveredCountry, setHoveredCountry] = useState(null)

  // Carregar GeoJSON (world-countries.geojson com poligonos corretos)
  useEffect(() => {
    const BASE_URL = import.meta.env.BASE_URL || '/'
    fetch(`${BASE_URL}data/world-countries.geojson`)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Erro ao carregar GeoJSON:', err))
  }, [])

  // Processar dados de exportacao por pais
  const exportsByCountry = useMemo(() => {
    if (!data?.links) return {}

    const totals = {}
    data.links.forEach(link => {
      if (link.target?.startsWith('pais_')) {
        const country = link.target.replace('pais_', '')
        totals[country] = (totals[country] || 0) + link.value
      }
    })
    return totals
  }, [data])

  // Todos os paises ordenados por valor (sem limite)
  const allCountries = useMemo(() => {
    return Object.entries(exportsByCountry)
      .sort((a, b) => b[1] - a[1])
  }, [exportsByCountry])

  // Top 10 para lista lateral
  const topCountries = useMemo(() => {
    return allCountries.slice(0, 10)
  }, [allCountries])

  // Valores para escala
  const { minValue, maxValue } = useMemo(() => {
    const values = Object.values(exportsByCountry)
    return {
      minValue: Math.min(...values) || 1,
      maxValue: Math.max(...values) || 1,
    }
  }, [exportsByCountry])

  // Projecao e path generator
  const { projection, pathGenerator } = useMemo(() => {
    const proj = d3.geoNaturalEarth1()
      .scale(width / 5.5)
      .center([20, 10])
      .translate([width / 2, height / 2])

    return {
      projection: proj,
      pathGenerator: d3.geoPath().projection(proj),
    }
  }, [width, height])

  // Escala de espessura dos arcos
  const strokeScale = useMemo(() => {
    return d3.scaleLog()
      .domain([minValue, maxValue])
      .range([1, 6])
      .clamp(true)
  }, [minValue, maxValue])

  // Escala de opacidade
  const opacityScale = useMemo(() => {
    return d3.scaleLog()
      .domain([minValue, maxValue])
      .range([0.4, 0.9])
      .clamp(true)
  }, [minValue, maxValue])

  // Funcao para obter cor do pais destino baseado no valor
  const getDestinationColor = (value) => {
    if (!value || value === 0) return COUNTRY_DEFAULT_COLOR
    const ratio = Math.log(value) / Math.log(maxValue)
    const index = Math.min(Math.floor(ratio * DEST_COLORS.length), DEST_COLORS.length - 1)
    return DEST_COLORS[Math.max(0, index)]
  }

  // Formatar valor
  const formatValue = (v) => {
    if (v >= 1e9) return `US$ ${(v / 1e9).toFixed(1)} bi`
    if (v >= 1e6) return `US$ ${(v / 1e6).toFixed(1)} mi`
    if (v >= 1e3) return `US$ ${(v / 1e3).toFixed(0)} mil`
    return `US$ ${v?.toFixed(0) || 0}`
  }

  // Gerar path do arco (great circle)
  const getArcPath = (destCoords) => {
    if (!destCoords) return null
    const lineString = {
      type: 'LineString',
      coordinates: [PARANA_CENTER, destCoords],
    }
    return pathGenerator(lineString)
  }

  // Posicao do ponto de origem (Parana)
  const paranaPoint = projection(PARANA_CENTER)

  if (!geoData) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-700 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-dark-400">
          Carregando mapa...
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-dark-700 mb-4">{title}</h3>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Mapa SVG */}
        <div className="flex-1 overflow-hidden">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="mx-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          >
            {/* Fundo oceano */}
            <rect width={width} height={height} fill={OCEAN_COLOR} />

            {/* Paises */}
            <g>
              {geoData.features.map((feature, i) => {
                const countryName = feature.properties?.name || feature.properties?.ADMIN || ''
                const nameLower = countryName.toLowerCase().trim()

                // Mapeamento explicito de nomes GeoJSON para nomes do dataset
                const NAME_MAP = {
                  'china': 'China',
                  'germany': 'Alemanha',
                  'japan': 'Japão',
                  'south korea': 'Coreia do Sul',
                  'republic of korea': 'Coreia do Sul',
                  'india': 'Índia',
                  'iran': 'Irã',
                  'islamic republic of iran': 'Irã',
                  'netherlands': 'Países Baixos (Holanda)',
                  'bangladesh': 'Bangladesh',
                  'vietnam': 'Vietnã',
                  'viet nam': 'Vietnã',
                  'saudi arabia': 'Arábia Saudita',
                  'united arab emirates': 'Emirados Árabes Unidos',
                  'algeria': 'Argélia',
                  'united states of america': 'Estados Unidos',
                  'united states': 'Estados Unidos',
                  'united kingdom': 'Reino Unido',
                  'argentina': 'Argentina',
                  'spain': 'Espanha',
                  'italy': 'Itália',
                  'france': 'França',
                  'belgium': 'Bélgica',
                  'russia': 'Rússia',
                  'russian federation': 'Rússia',
                  'thailand': 'Tailândia',
                  'indonesia': 'Indonésia',
                  'malaysia': 'Malásia',
                  'philippines': 'Filipinas',
                  'singapore': 'Singapura',
                  'australia': 'Austrália',
                  'mexico': 'México',
                  'turkey': 'Turquia',
                  'egypt': 'Egito',
                  'south africa': 'África do Sul',
                  'nigeria': 'Nigéria',
                  'pakistan': 'Paquistão',
                  'chile': 'Chile',
                  'colombia': 'Colômbia',
                  'peru': 'Peru',
                  'canada': 'Canadá',
                  'poland': 'Polônia',
                  'morocco': 'Marrocos',
                  'taiwan': 'Taiwan (Formosa)',
                  'hong kong': 'Hong Kong',
                }

                // Buscar nome mapeado ou tentar match direto
                const mappedName = NAME_MAP[nameLower]
                const matchedCountry = mappedName && exportsByCountry[mappedName]
                  ? mappedName
                  : Object.keys(exportsByCountry).find(c => c.toLowerCase() === nameLower)

                const exportValue = matchedCountry ? exportsByCountry[matchedCountry] : 0
                const isHovered = hoveredCountry === matchedCountry

                let fillColor = COUNTRY_DEFAULT_COLOR
                if (isHovered) {
                  fillColor = COUNTRY_HOVER_COLOR
                } else if (exportValue > 0) {
                  fillColor = getDestinationColor(exportValue)
                }

                return (
                  <path
                    key={`country-${i}`}
                    d={pathGenerator(feature)}
                    fill={fillColor}
                    stroke={COUNTRY_BORDER_COLOR}
                    strokeWidth={0.5}
                    className="transition-colors duration-150"
                  />
                )
              })}
            </g>

            {/* Arcos de conexao - todos os paises */}
            <g>
              {allCountries.map(([country, value]) => {
                const coords = COUNTRY_COORDS[country]
                if (!coords) return null

                const arcPath = getArcPath(coords)
                if (!arcPath) return null

                const isHovered = hoveredCountry === country
                const strokeWidth = strokeScale(value)
                const opacity = isHovered ? 1 : opacityScale(value)

                return (
                  <path
                    key={`arc-${country}`}
                    d={arcPath}
                    fill="none"
                    stroke={isHovered ? ARC_HOVER_COLOR : ARC_COLOR}
                    strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
                    strokeLinecap="round"
                    opacity={opacity}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <title>{country}: {formatValue(value)}</title>
                  </path>
                )
              })}
            </g>

            {/* Pontos de destino - todos os paises */}
            <g>
              {allCountries.map(([country, value]) => {
                const coords = COUNTRY_COORDS[country]
                if (!coords) return null

                const point = projection(coords)
                if (!point) return null

                const isHovered = hoveredCountry === country
                const radius = Math.max(2, Math.min(10, strokeScale(value) + 1))

                return (
                  <circle
                    key={`point-${country}`}
                    cx={point[0]}
                    cy={point[1]}
                    r={isHovered ? radius + 2 : radius}
                    fill={isHovered ? ARC_HOVER_COLOR : ARC_COLOR}
                    stroke="white"
                    strokeWidth={1.5}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredCountry(country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <title>{country}: {formatValue(value)}</title>
                  </circle>
                )
              })}
            </g>

            {/* Ponto de origem (Parana) */}
            <g>
              <circle
                cx={paranaPoint[0]}
                cy={paranaPoint[1]}
                r={8}
                fill="#ef4444"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={paranaPoint[0] - 45}
                y={paranaPoint[1] + 20}
                fontSize={10}
                fontWeight="bold"
                fill="#334155"
              >
                Parana
              </text>
            </g>
          </svg>
        </div>

        {/* Legenda e Top Destinos */}
        <div className="lg:w-56 flex flex-col gap-4">
          {/* Legenda */}
          <div className="bg-dark-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-dark-600 mb-2">Legenda</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-dark-600">Origem (Parana)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ARC_COLOR }} />
                <span className="text-dark-600">Destino ({allCountries.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded" style={{ backgroundColor: ARC_COLOR }} />
                <span className="text-dark-600">Fluxo de exportacao</span>
              </div>
              <div className="mt-2 pt-2 border-t border-dark-200">
                <span className="text-dark-500 text-[10px]">Intensidade por valor:</span>
                <div className="flex items-center gap-0.5 mt-1">
                  {DEST_COLORS.map((color, i) => (
                    <div key={i} className="w-4 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-dark-400 mt-0.5">
                  <span>Menor</span>
                  <span>Maior</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Destinos */}
          <div className="bg-dark-50 rounded-lg p-3 flex-1">
            <h4 className="text-sm font-semibold text-dark-600 mb-2">Top 10 Destinos</h4>
            <div className="space-y-1">
              {topCountries.slice(0, 10).map(([country, value], i) => (
                <div
                  key={country}
                  className={`flex items-center justify-between text-xs py-1 px-1 rounded cursor-pointer transition-colors ${
                    hoveredCountry === country ? 'bg-amber-100' : 'hover:bg-dark-100'
                  }`}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <span className="text-dark-700 truncate">
                    {i + 1}. {country}
                  </span>
                  <span className="text-dark-500 font-mono text-[10px]">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Info do pais hover */}
          {hoveredCountry && exportsByCountry[hoveredCountry] && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-dark-700">{hoveredCountry}</h4>
              <p className="text-lg font-mono text-green-600 mt-1">
                {formatValue(exportsByCountry[hoveredCountry])}
              </p>
              <p className="text-xs text-dark-500 mt-1">
                em exportacoes do Parana
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rodape */}
      <div className="mt-4 pt-4 border-t text-xs text-dark-500">
        <p>Mapa mostra todos os {allCountries.length} destinos das exportacoes do Parana.</p>
        <p className="mt-1">Arcos representam great circles (rotas geodesicas). Espessura e cor proporcionais ao valor.</p>
      </div>
    </div>
  )
}
