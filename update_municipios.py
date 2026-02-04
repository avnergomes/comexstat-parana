"""
Script para atualizar dados de municípios com nomes corretos
e preparar dados para mapa e Sankey (com suporte a filtro por cadeia)
"""

import json
import pandas as pd
from pathlib import Path
import numpy as np
import sys
import io

# Importar mapeamento de cadeia
try:
    from ncm_cadeias_map import get_cadeia_from_sh4, CADEIAS, CADEIA_CORES
except ImportError:
    CADEIAS = {}
    CADEIA_CORES = {}
    def get_cadeia_from_sh4(sh4):
        return "outros", "Outros"

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

def load_municipios_from_geojson():
    """Carrega municípios do arquivo GeoJSON"""
    geojson_file = Path("assets/mun_PR.json")
    if not geojson_file.exists():
        print(f"Arquivo {geojson_file} não encontrado")
        return {}

    with open(geojson_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    mun_dict = {}
    if isinstance(data, dict) and 'features' in data:
        for feat in data['features']:
            props = feat.get('properties', {})
            code = props.get('CodIbge')
            name = props.get('Municipio')
            if code and name:
                mun_dict[int(code)] = name

    print(f"Carregados {len(mun_dict)} municípios do GeoJSON")
    return mun_dict

def create_all_data():
    """Cria todos os dados necessários para Sankey e mapa"""
    print("=== Atualizando dados de municípios ===")

    # Carregar dicionário de municípios do GeoJSON
    MUNICIPIOS_PR = load_municipios_from_geojson()
    if not MUNICIPIOS_PR:
        print("Erro: não foi possível carregar municípios")
        return

    # Carregar dados de fluxo
    flow_file = Path("data/processed/fluxo_municipio_pais.parquet")
    if not flow_file.exists():
        print("Arquivo de fluxo não encontrado")
        return

    flow_df = pd.read_parquet(flow_file)
    print(f"Carregados {len(flow_df)} registros de fluxo")

    # Carregar dados de fluxo por cadeia (para filtros)
    flow_cadeia_file = Path("data/processed/fluxo_municipio_pais_cadeia.parquet")
    flow_cadeia_df = None
    if flow_cadeia_file.exists():
        flow_cadeia_df = pd.read_parquet(flow_cadeia_file)
        print(f"Carregados {len(flow_cadeia_df)} registros de fluxo por cadeia")

    # Atualizar nomes de municípios
    flow_df['NO_MUN'] = flow_df['CO_MUN'].map(MUNICIPIOS_PR).fillna(
        flow_df['CO_MUN'].astype(str)
    )

    # --- Criar dados para Sankey ---
    print("\n1. Criando dados para Sankey...")

    # Top 12 municípios e top 12 países por valor
    top_mun = flow_df.groupby('CO_MUN')['VL_FOB'].sum().nlargest(12).index.tolist()
    top_pais = flow_df.groupby('CO_PAIS')['VL_FOB'].sum().nlargest(12).index.tolist()

    sankey_flows = flow_df[
        (flow_df['CO_MUN'].isin(top_mun)) &
        (flow_df['CO_PAIS'].isin(top_pais))
    ].copy()

    # Agregar por município-país
    sankey_agg = sankey_flows.groupby(['NO_MUN', 'NO_PAIS']).agg({
        'VL_FOB': 'sum'
    }).reset_index()

    # Criar nodes
    municipios = sankey_agg['NO_MUN'].unique().tolist()
    paises = sankey_agg['NO_PAIS'].unique().tolist()

    nodes = []
    for m in municipios:
        nodes.append({
            'id': f"mun_{m}",
            'name': m,
            'type': 'municipio'
        })
    for p in paises:
        nodes.append({
            'id': f"pais_{p}",
            'name': p,
            'type': 'pais'
        })

    # Criar links (top 60 fluxos)
    links = []
    for _, row in sankey_agg.nlargest(60, 'VL_FOB').iterrows():
        links.append({
            'source': f"mun_{row['NO_MUN']}",
            'target': f"pais_{row['NO_PAIS']}",
            'value': float(row['VL_FOB'])
        })

    # Criar linksByCadeia se temos dados por cadeia
    links_by_cadeia = []
    if flow_cadeia_df is not None:
        # Atualizar nomes de municípios no flow_cadeia_df
        flow_cadeia_df['NO_MUN'] = flow_cadeia_df['CO_MUN'].map(MUNICIPIOS_PR).fillna(
            flow_cadeia_df['CO_MUN'].astype(str)
        )

        # Filtrar pelos top municípios e países
        sankey_flows_cadeia = flow_cadeia_df[
            (flow_cadeia_df['CO_MUN'].isin(top_mun)) &
            (flow_cadeia_df['CO_PAIS'].isin(top_pais))
        ].copy()

        # Agregar por município-país-cadeia
        sankey_agg_cadeia = sankey_flows_cadeia.groupby(['NO_MUN', 'NO_PAIS', 'CADEIA']).agg({
            'VL_FOB': 'sum'
        }).reset_index()

        # Criar links por cadeia
        for _, row in sankey_agg_cadeia.iterrows():
            links_by_cadeia.append({
                'source': f"mun_{row['NO_MUN']}",
                'target': f"pais_{row['NO_PAIS']}",
                'value': float(row['VL_FOB']),
                'cadeia': row['CADEIA']
            })
        print(f"   Criados {len(links_by_cadeia)} links por cadeia")

    sankey_data = {'nodes': nodes, 'links': links, 'linksByCadeia': links_by_cadeia}

    sankey_file = Path("dashboard/public/data/sankey_data.json")
    with open(sankey_file, 'w', encoding='utf-8') as f:
        json.dump(sankey_data, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)
    print(f"   Salvo: {sankey_file} ({len(nodes)} nodes, {len(links)} links, {len(links_by_cadeia)} linksByCadeia)")

    # --- Criar dados para mapa de municípios ---
    print("\n2. Criando dados para mapa de municípios...")

    mun_totals = flow_df.groupby('CO_MUN').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'NO_MUN': 'first'
    }).reset_index()

    mun_totals = mun_totals.sort_values('VL_FOB', ascending=False)
    total_valor = mun_totals['VL_FOB'].sum()

    map_data = []
    for _, row in mun_totals.head(50).iterrows():
        map_data.append({
            'codigo': int(row['CO_MUN']),
            'nome': row['NO_MUN'],
            'valor': float(row['VL_FOB']),
            'peso': float(row['KG_LIQUIDO']),
            'percentual': float(row['VL_FOB'] / total_valor * 100)
        })

    # Criar municipiosByCadeia se temos dados por cadeia
    municipios_by_cadeia = []
    if flow_cadeia_df is not None:
        # Agregar por município e cadeia
        mun_cadeia_totals = flow_cadeia_df.groupby(['CO_MUN', 'NO_MUN', 'CADEIA']).agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()

        for _, row in mun_cadeia_totals.iterrows():
            municipios_by_cadeia.append({
                'codigo': int(row['CO_MUN']),
                'nome': row['NO_MUN'],
                'cadeia': row['CADEIA'],
                'valor': float(row['VL_FOB']),
                'peso': float(row['KG_LIQUIDO'])
            })
        print(f"   Criados {len(municipios_by_cadeia)} registros municipio-cadeia")

    output = {
        'totalValor': float(total_valor),
        'totalPeso': float(mun_totals['KG_LIQUIDO'].sum()),
        'municipios': map_data,
        'municipiosByCadeia': municipios_by_cadeia
    }

    mun_file = Path("dashboard/public/data/municipios_data.json")
    with open(mun_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)
    print(f"   Salvo: {mun_file} ({len(map_data)} municípios, {len(municipios_by_cadeia)} por cadeia)")

    # --- Mostrar resumo ---
    print("\n=== Top 10 Municípios Exportadores ===")
    for i, m in enumerate(map_data[:10], 1):
        print(f"{i:2}. {m['nome']:25} US$ {m['valor']/1e9:6.2f} bi ({m['percentual']:5.1f}%)")

    print("\n=== Concluído ===")

if __name__ == "__main__":
    create_all_data()
