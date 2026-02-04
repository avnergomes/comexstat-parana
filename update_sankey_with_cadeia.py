"""
Script para gerar dados de Sankey com suporte a filtro por cadeia
"""

import json
import pandas as pd
from pathlib import Path
import numpy as np
import sys
import io

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from ncm_cadeias_map import classificar_cadeia, CADEIA_CORES

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

def create_sankey_with_cadeia():
    """Cria dados de Sankey com informação de cadeia"""
    print("=== Gerando Sankey com suporte a Cadeia ===\n")

    # Carregar dicionário de municípios
    MUNICIPIOS_PR = load_municipios_from_geojson()
    if not MUNICIPIOS_PR:
        print("Erro: não foi possível carregar municípios")
        return

    # Carregar dados de exportação brutos
    exp_file = Path("data/processed/exportacoes_pr_agro.parquet")
    if not exp_file.exists():
        print("Arquivo de exportações não encontrado")
        return

    df = pd.read_parquet(exp_file)
    print(f"Carregados {len(df)} registros de exportação")

    # Verificar se tem coluna de município
    if 'CO_MUN' not in df.columns:
        print("Coluna CO_MUN não encontrada. Colunas disponíveis:", df.columns.tolist())
        return

    # Classificar por cadeia
    print("Classificando por cadeia produtiva...")
    def aplicar_cadeia(row):
        _, nome = classificar_cadeia(row['CO_NCM'], row.get('DESC_NCM', ''), row['CAPITULO_NCM'])
        return nome

    df['CADEIA'] = df.apply(aplicar_cadeia, axis=1)

    # Atualizar nomes de municípios
    df['NO_MUN'] = df['CO_MUN'].map(MUNICIPIOS_PR).fillna(df['CO_MUN'].astype(str))

    # --- Criar dados para Sankey por cadeia ---
    print("\nAgregando por Município x País x Cadeia...")

    # Top municípios e países por valor total
    top_mun = df.groupby('CO_MUN')['VL_FOB'].sum().nlargest(12).index.tolist()
    top_pais = df.groupby('CO_PAIS')['VL_FOB'].sum().nlargest(12).index.tolist()

    # Filtrar para top municípios e países
    sankey_df = df[
        (df['CO_MUN'].isin(top_mun)) &
        (df['CO_PAIS'].isin(top_pais))
    ].copy()

    # Agregar por município-país-cadeia
    sankey_agg = sankey_df.groupby(['NO_MUN', 'PAIS', 'CADEIA']).agg({
        'VL_FOB': 'sum'
    }).reset_index()

    print(f"Total de fluxos (com cadeia): {len(sankey_agg)}")

    # Criar nodes
    municipios = sankey_agg['NO_MUN'].unique().tolist()
    paises = sankey_agg['PAIS'].unique().tolist()
    cadeias_list = sankey_agg['CADEIA'].unique().tolist()

    print(f"Municípios: {len(municipios)}, Países: {len(paises)}, Cadeias: {len(cadeias_list)}")

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

    # Criar links com informação de cadeia (top 100 fluxos)
    links = []
    for _, row in sankey_agg.nlargest(100, 'VL_FOB').iterrows():
        links.append({
            'source': f"mun_{row['NO_MUN']}",
            'target': f"pais_{row['PAIS']}",
            'value': float(row['VL_FOB']),
            'cadeia': row['CADEIA']
        })

    # Também criar versão agregada (sem cadeia) para o total
    sankey_total = sankey_df.groupby(['NO_MUN', 'PAIS']).agg({
        'VL_FOB': 'sum'
    }).reset_index()

    links_total = []
    for _, row in sankey_total.nlargest(60, 'VL_FOB').iterrows():
        links_total.append({
            'source': f"mun_{row['NO_MUN']}",
            'target': f"pais_{row['PAIS']}",
            'value': float(row['VL_FOB'])
        })

    sankey_data = {
        'nodes': nodes,
        'links': links_total,  # Links agregados (total)
        'linksByCadeia': links,  # Links com informação de cadeia
        'cadeias': cadeias_list
    }

    # Salvar
    sankey_file = Path("dashboard/public/data/sankey_data.json")
    with open(sankey_file, 'w', encoding='utf-8') as f:
        json.dump(sankey_data, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)

    print(f"\nSalvo: {sankey_file}")
    print(f"  - {len(nodes)} nodes")
    print(f"  - {len(links_total)} links totais")
    print(f"  - {len(links)} links por cadeia")
    print(f"  - {len(cadeias_list)} cadeias")

    print("\n=== Concluído ===")

if __name__ == "__main__":
    create_sankey_with_cadeia()
