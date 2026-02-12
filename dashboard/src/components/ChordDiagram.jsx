import { useMemo, useState } from 'react'
import * as d3 from 'd3'

// Colorblind-friendly colors
const MUNICIPALITY_COLOR = '#0072B2'
const COUNTRY_COLOR = '#D55E00'
const HOVER_COLOR = '#E69F00'

export default function ChordDiagram({
  data,
  title = "Relacoes Comerciais: Municipios x Paises",
  width = 700,
  height = 700,
  topN = 8, // Top N municipalities and countries to show
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [hoveredChord, setHoveredChord] = useState(null)

  const chartData = useMemo(() => {
    if (!data?.nodes || !data?.links) return null

    // Separate municipalities and countries
    const municipalities = data.nodes.filter(n => n.type === 'municipio')
    const countries = data.nodes.filter(n => n.type === 'pais')

    // Get top municipalities by total export value
    const munTotals = {}
    data.links.forEach(l => {
      const source = l.source
      if (source.startsWith('mun_')) {
        const name = source.replace('mun_', '')
        munTotals[name] = (munTotals[name] || 0) + l.value
      }
    })

    const topMunicipalities = Object.entries(munTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name)

    // Get top countries by total import value
    const countryTotals = {}
    data.links.forEach(l => {
      const target = l.target
      if (target.startsWith('pais_')) {
        const name = target.replace('pais_', '')
        countryTotals[name] = (countryTotals[name] || 0) + l.value
      }
    })

    const topCountries = Object.entries(countryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name)

    // Create combined names array (municipalities first, then countries)
    const names = [...topMunicipalities, ...topCountries]
    const n = names.length

    // Create matrix
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0))

    // Fill matrix with link values - bidirectional for proper chord visualization
    data.links.forEach(l => {
      const sourceId = l.source.replace('mun_', '')
      const targetId = l.target.replace('pais_', '')

      const sourceIdx = topMunicipalities.indexOf(sourceId)
      const targetIdx = topCountries.indexOf(targetId)

      if (sourceIdx !== -1 && targetIdx !== -1) {
        const matrixSourceIdx = sourceIdx
        const matrixTargetIdx = topMunicipalities.length + targetIdx
        // Add values in both directions for proper chord diagram display
        // This ensures both municipalities and countries have visible arcs
        matrix[matrixSourceIdx][matrixTargetIdx] += l.value
        matrix[matrixTargetIdx][matrixSourceIdx] += l.value
      }
    })

    // Create chord layout
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)

    const chords = chord(matrix)

    // Create arc and ribbon generators
    const innerRadius = Math.min(width, height) * 0.35
    const outerRadius = innerRadius + 20

    return {
      chords,
      names,
      topMunicipalities,
      topCountries,
      innerRadius,
      outerRadius,
      matrix,
    }
  }, [data, topN, width, height])

  if (!chartData) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-dark-700 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-dark-400">
          Sem dados de fluxo comercial disponiveis
        </div>
      </div>
    )
  }

  const { chords, names, topMunicipalities, topCountries, innerRadius, outerRadius, matrix } = chartData
  const centerX = width / 2
  const centerY = height / 2

  // Arc generator for groups
  const arcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

  // Ribbon generator for chords
  const ribbonGenerator = d3.ribbon()
    .radius(innerRadius)

  // Get color for a group
  const getGroupColor = (index) => {
    if (index < topMunicipalities.length) {
      return MUNICIPALITY_COLOR
    }
    return COUNTRY_COLOR
  }

  // Get ribbon color based on source
  const getRibbonColor = (source, target) => {
    if (hoveredChord && (hoveredChord.source === source && hoveredChord.target === target)) {
      return HOVER_COLOR
    }
    return d3.color(MUNICIPALITY_COLOR).copy({ opacity: 0.4 }).toString()
  }

  // Check if group is connected to hovered chord
  const isConnected = (index) => {
    if (hoveredIndex === null) return true
    if (index === hoveredIndex) return true

    // Check if any chord connects this index to hovered index
    return chords.some(chord =>
      (chord.source.index === index && chord.target.index === hoveredIndex) ||
      (chord.target.index === index && chord.source.index === hoveredIndex)
    )
  }

  // Format value
  const formatValue = (v) => {
    if (v >= 1e9) return `US$ ${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `US$ ${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `US$ ${(v / 1e3).toFixed(0)}K`
    return `US$ ${v.toFixed(0)}`
  }

  // Calculate total for a group
  const getGroupTotal = (index) => {
    return matrix[index].reduce((sum, val) => sum + val, 0) +
           matrix.reduce((sum, row) => sum + row[index], 0)
  }

  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-dark-700 mb-4">{title}</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        <svg width={width} height={height} className="mx-auto">
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Groups (arcs) */}
            {chords.groups.map((group, i) => {
              const isHovered = hoveredIndex === i
              const connected = isConnected(i)

              return (
                <g key={`group-${i}`}>
                  <path
                    d={arcGenerator(group)}
                    fill={getGroupColor(i)}
                    stroke="white"
                    strokeWidth={1}
                    opacity={connected ? (isHovered ? 1 : 0.85) : 0.2}
                    className="cursor-pointer transition-opacity duration-200"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <title>
                      {names[i]}
                      {'\n'}Total: {formatValue(getGroupTotal(i))}
                      {'\n'}Tipo: {i < topMunicipalities.length ? 'Municipio' : 'Pais'}
                    </title>
                  </path>

                  {/* Label */}
                  {group.endAngle - group.startAngle > 0.1 && (
                    <text
                      transform={`
                        rotate(${(group.startAngle + group.endAngle) / 2 * 180 / Math.PI - 90})
                        translate(${outerRadius + 10})
                        ${(group.startAngle + group.endAngle) / 2 > Math.PI ? 'rotate(180)' : ''}
                      `}
                      textAnchor={(group.startAngle + group.endAngle) / 2 > Math.PI ? 'end' : 'start'}
                      fontSize={10}
                      fill="#334155"
                      opacity={connected ? 1 : 0.3}
                    >
                      {names[i].length > 15 ? names[i].slice(0, 12) + '...' : names[i]}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Ribbons (chords) */}
            {chords.map((chord, i) => {
              const sourceConnected = hoveredIndex === null || hoveredIndex === chord.source.index || hoveredIndex === chord.target.index
              const isChordHovered = hoveredChord?.source === chord.source.index && hoveredChord?.target === chord.target.index

              return (
                <path
                  key={`chord-${i}`}
                  d={ribbonGenerator(chord)}
                  fill={isChordHovered ? HOVER_COLOR : MUNICIPALITY_COLOR}
                  fillOpacity={sourceConnected ? (isChordHovered ? 0.8 : 0.4) : 0.05}
                  stroke="none"
                  className="cursor-pointer transition-opacity duration-200"
                  onMouseEnter={() => setHoveredChord({ source: chord.source.index, target: chord.target.index })}
                  onMouseLeave={() => setHoveredChord(null)}
                >
                  <title>
                    {names[chord.source.index]} → {names[chord.target.index]}
                    {'\n'}Valor: {formatValue(chord.source.value)}
                  </title>
                </path>
              )
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex flex-col gap-4 min-w-[180px]">
          <div>
            <h4 className="text-sm font-semibold text-dark-600 mb-2">Legenda</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: MUNICIPALITY_COLOR }} />
                <span className="text-xs text-dark-600">Municipios (origem)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COUNTRY_COLOR }} />
                <span className="text-xs text-dark-600">Paises (destino)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark-600 mb-2">Top Municipios</h4>
            <div className="space-y-1">
              {topMunicipalities.slice(0, 5).map((mun, i) => (
                <div
                  key={mun}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-dark-50 px-1 py-0.5 rounded"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="text-dark-700">{i + 1}. {mun}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark-600 mb-2">Top Paises</h4>
            <div className="space-y-1">
              {topCountries.slice(0, 5).map((country, i) => (
                <div
                  key={country}
                  className="flex items-center gap-2 text-xs cursor-pointer hover:bg-dark-50 px-1 py-0.5 rounded"
                  onMouseEnter={() => setHoveredIndex(topMunicipalities.length + i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="text-dark-700">{i + 1}. {country}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hovered info */}
          {hoveredIndex !== null && (
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold text-dark-600 mb-1">
                {names[hoveredIndex]}
              </h4>
              <p className="text-xs text-dark-500">
                {hoveredIndex < topMunicipalities.length ? 'Municipio exportador' : 'Pais de destino'}
              </p>
              <p className="text-sm font-mono text-dark-700 mt-1">
                {formatValue(getGroupTotal(hoveredIndex))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t text-xs text-dark-500">
        <p>Diagrama mostra os {topN} principais municipios e paises por valor de exportacao.</p>
        <p className="mt-1">Passe o mouse sobre os arcos e fitas para ver detalhes.</p>
      </div>
    </div>
  )
}
