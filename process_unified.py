# -*- coding: utf-8 -*-
"""
Processamento unificado dos dados MUN do ComexStat.

Este script:
1. Carrega os dados MUN (com CO_MUN e SH4)
2. Classifica cada registro por cadeia produtiva (via SH4)
3. Adiciona nomes de países e municípios
4. Gera agregações para o dashboard
5. Salva dados processados para uso no dashboard
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
import sys
import io

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from ncm_cadeias_map import classificar_cadeia_sh4, CADEIA_CORES, get_all_cadeias

# Paths
INPUT_DIR = Path("data/processed")
OUTPUT_DIR = Path("data/processed")
AUX_DIR = Path("data/auxiliary")

# Municípios do Paraná (código IBGE começa com 41)
PARANA_CODE = 41


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)


def load_auxiliary_tables():
    """Carrega tabelas auxiliares de países e municípios."""
    print("Carregando tabelas auxiliares...")

    # Países
    pais_path = AUX_DIR / "pais.csv"
    if pais_path.exists():
        df_pais = pd.read_csv(pais_path, sep=';', encoding='latin-1')
        pais_dict = dict(zip(df_pais['CO_PAIS'], df_pais['NO_PAIS']))
        print(f"  Países: {len(pais_dict)}")
    else:
        pais_dict = {}
        print("  AVISO: Tabela de países não encontrada")

    # Municípios
    mun_path = AUX_DIR / "uf_mun.csv"
    if mun_path.exists():
        df_mun = pd.read_csv(mun_path, sep=';', encoding='latin-1')
        # Filtrar Paraná (SG_UF = 'PR')
        df_mun_pr = df_mun[df_mun['SG_UF'] == 'PR']
        mun_dict = dict(zip(df_mun_pr['CO_MUN_GEO'], df_mun_pr['NO_MUN_MIN']))
        print(f"  Municípios PR: {len(mun_dict)}")
    else:
        mun_dict = {}
        print("  AVISO: Tabela de municípios não encontrada")

    return pais_dict, mun_dict


def load_municipios_from_geojson():
    """Carrega municípios do arquivo GeoJSON (fallback)."""
    geojson_file = Path("assets/mun_PR.json")
    if not geojson_file.exists():
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

    return mun_dict


def process_exports():
    """Processa dados de exportação."""
    print("\n=== Processando Exportações ===\n")

    exp_file = INPUT_DIR / "exp_mun_agro.parquet"
    if not exp_file.exists():
        print(f"Arquivo {exp_file} não encontrado!")
        return None

    df = pd.read_parquet(exp_file)
    print(f"Registros carregados: {len(df):,}")

    # Filtrar apenas Paraná (municípios que começam com 41)
    df['UF'] = df['CO_MUN'] // 100000
    df = df[df['UF'] == PARANA_CODE].copy()
    print(f"Registros do Paraná: {len(df):,}")

    # Classificar por cadeia
    print("Classificando por cadeia produtiva...")
    df['SH4'] = df['SH4'].astype(str).str.zfill(4)

    cadeias = df['SH4'].apply(lambda x: classificar_cadeia_sh4(x))
    df['CADEIA_KEY'] = cadeias.apply(lambda x: x[0])
    df['CADEIA'] = cadeias.apply(lambda x: x[1])

    # Estatísticas
    print(f"\nDistribuição por cadeia:")
    cadeia_stats = df.groupby('CADEIA')['VL_FOB'].sum().sort_values(ascending=False)
    for cadeia, valor in cadeia_stats.head(10).items():
        print(f"  {cadeia}: US$ {valor/1e9:.2f} bi")

    return df


def process_imports():
    """Processa dados de importação."""
    print("\n=== Processando Importações ===\n")

    imp_file = INPUT_DIR / "imp_mun_agro.parquet"
    if not imp_file.exists():
        print(f"Arquivo {imp_file} não encontrado!")
        return None

    df = pd.read_parquet(imp_file)
    print(f"Registros carregados: {len(df):,}")

    # Filtrar apenas Paraná
    df['UF'] = df['CO_MUN'] // 100000
    df = df[df['UF'] == PARANA_CODE].copy()
    print(f"Registros do Paraná: {len(df):,}")

    # Classificar por cadeia
    print("Classificando por cadeia produtiva...")
    df['SH4'] = df['SH4'].astype(str).str.zfill(4)

    cadeias = df['SH4'].apply(lambda x: classificar_cadeia_sh4(x))
    df['CADEIA_KEY'] = cadeias.apply(lambda x: x[0])
    df['CADEIA'] = cadeias.apply(lambda x: x[1])

    return df


def generate_sankey_data(df_exp, pais_dict, mun_dict):
    """Gera dados para o gráfico Sankey com suporte a filtro por cadeia."""
    print("\n=== Gerando dados para Sankey ===\n")

    # Adicionar nomes
    df_exp['NO_PAIS'] = df_exp['CO_PAIS'].map(pais_dict).fillna('Desconhecido')
    df_exp['NO_MUN'] = df_exp['CO_MUN'].map(mun_dict).fillna(df_exp['CO_MUN'].astype(str))

    # Top 12 municípios e países por valor TOTAL (para visão geral)
    top_mun = df_exp.groupby('CO_MUN')['VL_FOB'].sum().nlargest(12).index.tolist()
    top_pais = df_exp.groupby('CO_PAIS')['VL_FOB'].sum().nlargest(12).index.tolist()

    # Filtrar para visão geral
    df_filtered = df_exp[
        (df_exp['CO_MUN'].isin(top_mun)) &
        (df_exp['CO_PAIS'].isin(top_pais))
    ].copy()

    print(f"Registros para Sankey (visão geral): {len(df_filtered):,}")

    # === Links por cadeia: incluir top fluxos de CADA cadeia ===
    # Isso garante que todas as cadeias tenham representação
    print("Gerando links por cadeia (todas as cadeias)...")

    all_cadeias = df_exp['CADEIA'].unique().tolist()
    links_by_cadeia = []
    all_mun_ids = set()
    all_pais_ids = set()

    for cadeia in all_cadeias:
        df_cadeia = df_exp[df_exp['CADEIA'] == cadeia]

        if len(df_cadeia) == 0:
            continue

        # Para cada cadeia, pegar top 5 municípios e top 5 países
        top_mun_cadeia = df_cadeia.groupby('CO_MUN')['VL_FOB'].sum().nlargest(5).index.tolist()
        top_pais_cadeia = df_cadeia.groupby('CO_PAIS')['VL_FOB'].sum().nlargest(5).index.tolist()

        # Filtrar e agregar
        df_cadeia_filtered = df_cadeia[
            (df_cadeia['CO_MUN'].isin(top_mun_cadeia)) &
            (df_cadeia['CO_PAIS'].isin(top_pais_cadeia))
        ]

        if len(df_cadeia_filtered) == 0:
            continue

        cadeia_agg = df_cadeia_filtered.groupby(['NO_MUN', 'NO_PAIS']).agg({
            'VL_FOB': 'sum'
        }).reset_index()

        # Top 10 fluxos por cadeia
        for _, row in cadeia_agg.nlargest(10, 'VL_FOB').iterrows():
            links_by_cadeia.append({
                'source': f"mun_{row['NO_MUN']}",
                'target': f"pais_{row['NO_PAIS']}",
                'value': float(row['VL_FOB']),
                'cadeia': cadeia
            })
            all_mun_ids.add(row['NO_MUN'])
            all_pais_ids.add(row['NO_PAIS'])

    print(f"  Links por cadeia: {len(links_by_cadeia)} de {len(all_cadeias)} cadeias")

    # === Links totais para visão geral (sem filtro de cadeia) ===
    sankey_total = df_filtered.groupby(['NO_MUN', 'NO_PAIS']).agg({
        'VL_FOB': 'sum'
    }).reset_index()

    links_total = []
    for _, row in sankey_total.nlargest(80, 'VL_FOB').iterrows():
        links_total.append({
            'source': f"mun_{row['NO_MUN']}",
            'target': f"pais_{row['NO_PAIS']}",
            'value': float(row['VL_FOB'])
        })
        all_mun_ids.add(row['NO_MUN'])
        all_pais_ids.add(row['NO_PAIS'])

    # === Criar nodes incluindo todos os usados ===
    nodes = []
    for m in sorted(all_mun_ids):
        nodes.append({
            'id': f"mun_{m}",
            'name': m,
            'type': 'municipio'
        })
    for p in sorted(all_pais_ids):
        nodes.append({
            'id': f"pais_{p}",
            'name': p,
            'type': 'pais'
        })

    cadeias_list = sorted(all_cadeias)

    sankey_data = {
        'nodes': nodes,
        'links': links_total,
        'linksByCadeia': links_by_cadeia,
        'cadeias': cadeias_list
    }

    print(f"  Nodes: {len(nodes)} ({len(all_mun_ids)} mun + {len(all_pais_ids)} países)")
    print(f"  Links (total): {len(links_total)}")
    print(f"  Links (por cadeia): {len(links_by_cadeia)}")
    print(f"  Cadeias: {len(cadeias_list)}")

    # Verificar cobertura de cadeias
    cadeias_com_links = set(l['cadeia'] for l in links_by_cadeia)
    cadeias_sem_links = set(cadeias_list) - cadeias_com_links
    if cadeias_sem_links:
        print(f"  AVISO: Cadeias sem links: {cadeias_sem_links}")

    return sankey_data


def generate_timeseries_by_cadeia(df_exp, df_imp):
    """Gera série temporal por ano e cadeia."""
    print("\n=== Gerando série temporal por cadeia ===\n")

    # Exportações por ano-cadeia
    exp_by_cadeia = df_exp.groupby(['CO_ANO', 'CADEIA']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_by_cadeia.columns = ['ano', 'cadeia', 'valorExp', 'pesoExp']

    # Importações por ano-cadeia
    if df_imp is not None and len(df_imp) > 0:
        imp_by_cadeia = df_imp.groupby(['CO_ANO', 'CADEIA']).agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()
        imp_by_cadeia.columns = ['ano', 'cadeia', 'valorImp', 'pesoImp']

        # Merge
        timeseries_cadeia = pd.merge(
            exp_by_cadeia,
            imp_by_cadeia,
            on=['ano', 'cadeia'],
            how='outer'
        ).fillna(0)
    else:
        timeseries_cadeia = exp_by_cadeia.copy()
        timeseries_cadeia['valorImp'] = 0
        timeseries_cadeia['pesoImp'] = 0

    timeseries_cadeia = timeseries_cadeia.sort_values(['ano', 'cadeia'])

    print(f"Registros: {len(timeseries_cadeia)}")
    print(f"Anos: {timeseries_cadeia['ano'].min()} - {timeseries_cadeia['ano'].max()}")
    print(f"Cadeias: {timeseries_cadeia['cadeia'].nunique()}")

    return timeseries_cadeia.to_dict('records')


def save_unified_data(df_exp, df_imp, sankey_data, timeseries_by_cadeia):
    """Salva todos os dados processados."""
    print("\n=== Salvando dados ===\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Sankey data
    sankey_path = Path("dashboard/public/data/sankey_data.json")
    sankey_path.parent.mkdir(parents=True, exist_ok=True)
    with open(sankey_path, 'w', encoding='utf-8') as f:
        json.dump(sankey_data, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)
    print(f"Salvo: {sankey_path}")

    # 2. Timeseries by cadeia (para integrar no aggregated.json)
    timeseries_path = OUTPUT_DIR / "timeseries_by_cadeia.json"
    with open(timeseries_path, 'w', encoding='utf-8') as f:
        json.dump(timeseries_by_cadeia, f, cls=NumpyEncoder, ensure_ascii=False)
    print(f"Salvo: {timeseries_path}")

    # 3. Dados unificados completos (parquet)
    unified_exp_path = OUTPUT_DIR / "unified_exp_pr.parquet"
    df_exp.to_parquet(unified_exp_path, index=False)
    print(f"Salvo: {unified_exp_path}")

    if df_imp is not None:
        unified_imp_path = OUTPUT_DIR / "unified_imp_pr.parquet"
        df_imp.to_parquet(unified_imp_path, index=False)
        print(f"Salvo: {unified_imp_path}")


def main():
    """Função principal."""
    print("=" * 60)
    print("PROCESSAMENTO UNIFICADO - COMEXSTAT PARANÁ")
    print("=" * 60)

    # 1. Carregar tabelas auxiliares
    pais_dict, mun_dict = load_auxiliary_tables()

    # Fallback para municípios do GeoJSON
    if not mun_dict:
        mun_dict = load_municipios_from_geojson()
        print(f"  Municípios (GeoJSON): {len(mun_dict)}")

    # 2. Processar exportações
    df_exp = process_exports()
    if df_exp is None:
        print("ERRO: Não foi possível processar exportações")
        return

    # 3. Processar importações
    df_imp = process_imports()

    # 4. Adicionar nomes
    df_exp['NO_PAIS'] = df_exp['CO_PAIS'].map(pais_dict).fillna('Desconhecido')
    df_exp['NO_MUN'] = df_exp['CO_MUN'].map(mun_dict).fillna(df_exp['CO_MUN'].astype(str))

    if df_imp is not None:
        df_imp['NO_PAIS'] = df_imp['CO_PAIS'].map(pais_dict).fillna('Desconhecido')
        df_imp['NO_MUN'] = df_imp['CO_MUN'].map(mun_dict).fillna(df_imp['CO_MUN'].astype(str))

    # 5. Gerar dados para Sankey
    sankey_data = generate_sankey_data(df_exp, pais_dict, mun_dict)

    # 6. Gerar série temporal por cadeia
    timeseries_by_cadeia = generate_timeseries_by_cadeia(df_exp, df_imp)

    # 7. Salvar
    save_unified_data(df_exp, df_imp, sankey_data, timeseries_by_cadeia)

    print("\n" + "=" * 60)
    print("PROCESSAMENTO CONCLUÍDO")
    print("=" * 60)


if __name__ == "__main__":
    main()
