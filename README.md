# ComexStat Paraná — Comércio Exterior Agrícola

Dashboard de comércio exterior agrícola do Paraná (2020–2025), com dados do ComexStat/MDIC. Visualiza fluxos comerciais com 221 países, cadeias produtivas via diagrama Sankey, municípios exportadores e previsões de curto prazo.

**🔗 [Acessar dashboard](https://avnergomes.github.io/comexstat-parana/)**

Parte do ecossistema **[Datageo Paraná](https://datageoparana.github.io)**.

## Sobre

O Paraná é um dos estados com maior participação nas exportações agrícolas brasileiras. Este dashboard consolida os dados de exportações e importações do ComexStat (MDIC) para o agronegócio paranaense, cobrindo 221 países parceiros e 187 produtos no período 2020–2025.

A ferramenta oferece um conjunto amplo de visualizações: mapa-múndi de fluxos comerciais, diagrama Sankey de cadeias produtivas, chord diagram de relações entre produtos e destinos, heatmap sazonal e comparação year-over-year. O mapa de municípios exportadores permite identificar a distribuição geográfica das exportações dentro do estado.

Os dados são baixados diretamente da API do ComexStat e processados por um pipeline Python com múltiplos scripts de transformação e agregação.

## Fonte de Dados

- **ComexStat/MDIC** — Ministério do Desenvolvimento, Indústria, Comércio e Serviços
- Período: 2020–2025
- Atualização: workflow automatizado (`update-data.yml`)

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Gráficos | Recharts, D3.js, Nivo (Sankey) |
| Mapas | Leaflet, React-Leaflet |
| Pipeline | Python (Pandas) |
| Deploy | GitHub Pages via GitHub Actions |
| Tracking | LGPD-compliant (19 métricas anônimas) |

## Estrutura do Projeto

```
comexstat-parana/
├── dashboard/          # Aplicação React
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/ # 22 componentes
│   │   └── hooks/      # useData.js
│   ├── public/
│   │   └── data/       # JSONs processados
│   └── index.html
├── scripts/            # Pipeline de dados (Python)
│   ├── download_data.py
│   ├── process_data.py
│   ├── pipeline.py
│   ├── prepare_dashboard_data.py
│   └── (outros scripts)
├── .github/workflows/  # CI/CD
│   ├── deploy.yml
│   └── update-data.yml
└── README.md
```

## Funcionalidades

- Mapa-múndi de fluxos comerciais com 221 países parceiros
- Diagrama Sankey de cadeias produtivas exportadas
- Chord diagram de relações produto–destino
- Mapa de municípios exportadores do Paraná
- Heatmap de sazonalidade das exportações
- Comparação year-over-year de exportações e importações
- Previsões de curto prazo
- Cobertura de 187 produtos agrícolas
- KPIs de exportações FOB, importações FOB, balança comercial e corrente de comércio

## Desenvolvimento Local

```bash
# Clone
git clone https://github.com/avnergomes/comexstat-parana.git
cd comexstat-parana/dashboard

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Pipeline de Dados

O pipeline na raiz do repositório segue as etapas: `download_data.py` coleta os dados brutos da API do ComexStat, `process_data.py` e `pipeline.py` realizam a limpeza e transformação, e `prepare_dashboard_data.py` gera os JSONs finais em `dashboard/public/data/` (`aggregated.json`, `detailed.json`, `forecasts.json`, `map_data.json`, `municipios_data.json`, `sankey_data.json`). O workflow `update-data.yml` atualiza os dados automaticamente e `deploy.yml` publica no GitHub Pages.

## Licença

Dados públicos. Dashboard desenvolvido por [Avner Gomes](https://avnergomes.github.io/portfolio/).
