import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

// Coordenadas dos centros dos paises (lon, lat)
const COUNTRY_COORDS = {
  'China': [104.20, 35.86],
  'Estados Unidos': [-95.71, 37.09],
  'Argentina': [-63.62, -38.42],
  'Países Baixos (Holanda)': [5.29, 52.13],
  'Alemanha': [10.45, 51.17],
  'Japão': [138.25, 36.20],
  'Coreia do Sul': [127.77, 35.91],
  'Vietnã': [108.28, 14.06],
  'Tailândia': [100.99, 15.87],
  'Bangladesh': [90.36, 23.68],
  'Emirados Árabes Unidos': [53.85, 23.42],
  'Índia': [78.96, 20.59],
  'Indonésia': [113.92, -0.79],
  'Rússia': [105.32, 61.52],
  'Reino Unido': [-3.44, 55.38],
  'Espanha': [-3.75, 40.46],
  'Itália': [12.57, 41.87],
  'França': [2.21, 46.23],
  'México': [-102.55, 23.63],
  'Egito': [30.80, 26.82],
  'Arábia Saudita': [45.08, 23.89],
  'Irã': [53.69, 32.43],
  'Turquia': [35.24, 38.96],
  'Malásia': [101.98, 4.21],
  'Filipinas': [121.77, 12.88],
  'Singapura': [103.82, 1.35],
  'Hong Kong': [114.11, 22.40],
  'Taiwan': [120.96, 23.69],
  'Chile': [-71.54, -35.68],
  'Colômbia': [-74.30, 4.57],
  'Peru': [-75.02, -9.19],
  'Canadá': [-106.35, 56.13],
  'África do Sul': [22.94, -30.56],
  'Nigéria': [8.68, 9.08],
  'Paquistão': [69.35, 30.38],
  'Paraguai': [-58.44, -23.44],
  'Uruguai': [-55.77, -32.52],
  'Bolívia': [-63.59, -16.29],
  'Venezuela': [-66.59, 6.42],
  'Equador': [-78.18, -1.83],
  'Cuba': [-77.78, 21.52],
  'Austrália': [133.78, -25.27],
  'Nova Zelândia': [174.89, -40.90],
  'Polônia': [19.15, 51.92],
  'Bélgica': [4.47, 50.50],
  'Suíça': [8.23, 46.82],
  'Áustria': [14.55, 47.52],
  'Portugal': [-8.22, 39.40],
  'Grécia': [21.82, 39.07],
  'Suécia': [18.64, 60.13],
  'Noruega': [8.47, 60.47],
  'Dinamarca': [9.50, 56.26],
  'Finlândia': [25.75, 61.92],
  'Irlanda': [-8.24, 53.41],
  'República Tcheca': [15.47, 49.82],
  'Hungria': [19.50, 47.16],
  'Romênia': [24.97, 45.94],
  'Ucrânia': [31.17, 48.38],
  'Belarus': [27.95, 53.71],
  'Cazaquistão': [66.92, 48.02],
  'Israel': [34.85, 31.05],
  'Jordânia': [36.24, 30.59],
  'Líbano': [35.86, 33.85],
  'Iraque': [43.68, 33.22],
  'Kuwait': [47.48, 29.31],
  'Catar': [51.18, 25.35],
  'Omã': [55.92, 21.51],
  'Marrocos': [-7.09, 31.79],
  'Tunísia': [9.54, 33.89],
  'Argélia': [1.66, 28.03],
  'Quênia': [37.91, -0.02],
  'Etiópia': [40.49, 9.15],
  'Gana': [-1.02, 7.95],
  'Senegal': [-14.45, 14.50],
  'Costa do Marfim': [-5.55, 7.54],
  'Camarões': [12.35, 7.37],
  'Angola': [17.87, -11.20],
  'Moçambique': [35.53, -18.67],
  'Sri Lanka': [80.77, 7.87],
  'Myanmar': [95.96, 21.91],
  'Camboja': [104.99, 12.57],
  'Nepal': [84.12, 28.39],
}

// Centro do Parana (origem dos arcos)
const PARANA_CENTER = [-51.5, -24.5]

// Cores
const ARC_COLOR = '#22c55e'
const ARC_HOVER_COLOR = '#f59e0b'
const COUNTRY_DEST_COLOR = '#dcfce7'
const COUNTRY_DEFAULT_COLOR = '#f1f5f9'
const COUNTRY_HOVER_COLOR = '#fef3c7'

export default function ConnectionMap({
  data,
  title = 'Mapa de Conexoes Comerciais - Exportacoes do Parana',
  width = 900,
  height = 480,
}) {
  const svgRef = useRef()
  const [geoData, setGeoData] = useState(null)
  const [hoveredCountry, setHoveredCountry] = useState(null)

  // Carregar GeoJSON
  useEffect(() => {
    const BASE_URL = import.meta.env.BASE_URL || '/'
    fetch(`${BASE_URL}data/countries_merged.geojson`)
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

  // Top paises ordenados por valor
  const topCountries = useMemo(() => {
    return Object.entries(exportsByCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
  }, [exportsByCountry])

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
      .range([0.3, 0.85])
      .clamp(true)
  }, [minValue, maxValue])

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
            {/* Fundo */}
            <rect width={width} height={height} fill="#f8fafc" />

            {/* Paises */}
            <g>
              {geoData.features.map((feature, i) => {
                const countryName = feature.properties?.ADMIN || feature.properties?.name || ''
                const isDestination = Object.keys(exportsByCountry).some(
                  c => countryName.toLowerCase().includes(c.toLowerCase()) ||
                       c.toLowerCase().includes(countryName.toLowerCase())
                )
                const isHovered = hoveredCountry === countryName

                return (
                  <path
                    key={`country-${i}`}
                    d={pathGenerator(feature)}
                    fill={isHovered ? COUNTRY_HOVER_COLOR : (isDestination ? COUNTRY_DEST_COLOR : COUNTRY_DEFAULT_COLOR)}
                    stroke="#cbd5e1"
                    strokeWidth={0.5}
                    className="transition-colors duration-150"
                  />
                )
              })}
            </g>

            {/* Arcos de conexao */}
            <g>
              {topCountries.map(([country, value]) => {
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
                    strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
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

            {/* Pontos de destino */}
            <g>
              {topCountries.map(([country, value]) => {
                const coords = COUNTRY_COORDS[country]
                if (!coords) return null

                const point = projection(coords)
                if (!point) return null

                const isHovered = hoveredCountry === country
                const radius = Math.max(3, Math.min(8, strokeScale(value)))

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
                <span className="text-dark-600">Destino</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded" style={{ backgroundColor: ARC_COLOR }} />
                <span className="text-dark-600">Fluxo de exportacao</span>
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
        <p>Mapa mostra os {topCountries.length} principais destinos das exportacoes do Parana.</p>
        <p className="mt-1">Arcos representam great circles (rotas geodesicas). Espessura proporcional ao valor.</p>
      </div>
    </div>
  )
}
