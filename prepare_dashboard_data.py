# -*- coding: utf-8 -*-
"""
Script para preparar dados do dashboard ComexStat Parana
Converte parquet para JSON otimizado e shapefile para GeoJSON
"""

import os
import sys
import io
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Fix encoding for Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Diretorios
DATA_DIR = "data/processed"
OUTPUT_DIR = "dashboard/public/data"
SHAPEFILE_PATH = "assets/mapa_mundi/level4.shp"

# Mapeamento de capitulos NCM para categorias (legado)
CATEGORIAS_NCM = {
    1: "Animais vivos",
    2: "Carnes e miudezas",
    3: "Peixes e crustaceos",
    4: "Laticinios e ovos",
    5: "Outros prod. animais",
    6: "Plantas e floricultura",
    7: "Horticolas e raizes",
    8: "Frutas",
    9: "Cafe, cha e especiarias",
    10: "Cereais",
    11: "Produtos de moagem",
    12: "Sementes oleaginosas",
    13: "Gomas e resinas",
    14: "Mat. para entrancar",
    15: "Gorduras e oleos",
    16: "Prep. carne/peixe",
    17: "Acucares",
    18: "Cacau e preparacoes",
    19: "Prep. de cereais",
    20: "Prep. de horticolas",
    21: "Prep. alimenticias",
    22: "Bebidas e vinagres",
    23: "Residuos alimentares",
    24: "Tabaco",
    # Insumos agrícolas
    31: "Fertilizantes",
    38: "Defensivos Agricolas",
}

# Mapeamento de cadeias para tipo (produto agrícola vs insumo)
TIPO_CADEIA = {
    # Produtos agrícolas (outputs - exportação)
    "Sojicultura": "produto",
    "Avicultura": "produto",
    "Bovinocultura": "produto",
    "Suinocultura": "produto",
    "Cafeicultura": "produto",
    "Cerealicultura": "produto",
    "Canavicultura": "produto",
    "Fruticultura": "produto",
    "Olericultura": "produto",
    "Aquicultura": "produto",
    "Florestal": "produto",
    "Floricultura": "produto",
    "Apicultura": "produto",
    "Laticínios": "produto",
    "Oleaginosas": "produto",
    "Agroind. Carnes": "produto",
    "Agroind. Grãos": "produto",
    "Bebidas": "produto",
    "Tabaco": "produto",
    "Outros": "produto",
    # Insumos agrícolas (inputs - importação)
    "Fertilizantes": "insumo",
    "Herbicidas": "insumo",
    "Fungicidas": "insumo",
    "Inseticidas": "insumo",
    "Outros Insumos": "insumo",
}

# Importar mapeamento de cadeias e descrições
from ncm_cadeias_map import classificar_cadeia, CADEIAS, CADEIA_CORES, SH4_DESCRICAO


def carregar_dados():
    """Carrega dados de exportacao e importacao."""
    print("Carregando dados...")

    # Tentar primeiro os dados unificados (nova pipeline)
    unified_exp_path = os.path.join(DATA_DIR, "unified_exp_pr.parquet")
    unified_imp_path = os.path.join(DATA_DIR, "unified_imp_pr.parquet")

    # Fallback para dados originais
    exp_path = os.path.join(DATA_DIR, "exportacoes_pr_agro.parquet")
    imp_path = os.path.join(DATA_DIR, "importacoes_pr_agro.parquet")

    # Verificar qual fonte de dados usar
    if os.path.exists(unified_exp_path):
        print("  Usando dados unificados (nova pipeline)...")
        df_exp = pd.read_parquet(unified_exp_path)
        df_imp = pd.read_parquet(unified_imp_path) if os.path.exists(unified_imp_path) else None

        # Dados unificados já têm CADEIA classificada
        if 'CADEIA' not in df_exp.columns:
            from ncm_cadeias_map import classificar_cadeia_sh4
            print("  Classificando por cadeia (SH4)...")
            cadeias = df_exp['SH4'].apply(lambda x: classificar_cadeia_sh4(x))
            df_exp['CADEIA'] = cadeias.apply(lambda x: x[1])

        # Criar colunas compatíveis com formato antigo se necessário
        if 'CO_NCM' not in df_exp.columns and 'SH4' in df_exp.columns:
            df_exp['CO_NCM'] = df_exp['SH4']
        if 'CAPITULO_NCM' not in df_exp.columns and 'CAPITULO' in df_exp.columns:
            df_exp['CAPITULO_NCM'] = df_exp['CAPITULO']
        if 'CO_ANO' not in df_exp.columns and 'ano' in df_exp.columns:
            df_exp['CO_ANO'] = df_exp['ano']
        if 'PAIS' not in df_exp.columns and 'NO_PAIS' in df_exp.columns:
            df_exp['PAIS'] = df_exp['NO_PAIS']
        if 'DESC_NCM' not in df_exp.columns:
            # Usar o dicionário de descrições SH4
            df_exp['DESC_NCM'] = df_exp['SH4'].apply(lambda x: SH4_DESCRICAO.get(str(x), str(x)))

        if df_imp is not None:
            if 'CADEIA' not in df_imp.columns:
                from ncm_cadeias_map import classificar_cadeia_sh4
                cadeias = df_imp['SH4'].apply(lambda x: classificar_cadeia_sh4(x))
                df_imp['CADEIA'] = cadeias.apply(lambda x: x[1])

            if 'CO_NCM' not in df_imp.columns and 'SH4' in df_imp.columns:
                df_imp['CO_NCM'] = df_imp['SH4']
            if 'CAPITULO_NCM' not in df_imp.columns and 'CAPITULO' in df_imp.columns:
                df_imp['CAPITULO_NCM'] = df_imp['CAPITULO']
            if 'CO_ANO' not in df_imp.columns and 'ano' in df_imp.columns:
                df_imp['CO_ANO'] = df_imp['ano']
            if 'PAIS' not in df_imp.columns and 'NO_PAIS' in df_imp.columns:
                df_imp['PAIS'] = df_imp['NO_PAIS']
            if 'DESC_NCM' not in df_imp.columns:
                # Usar o dicionário de descrições SH4
                df_imp['DESC_NCM'] = df_imp['SH4'].apply(lambda x: SH4_DESCRICAO.get(str(x), str(x)))
        else:
            # Criar DataFrame vazio para importações se não existir
            df_imp = pd.DataFrame(columns=df_exp.columns)

    else:
        print("  Usando dados originais (pipeline legada)...")
        df_exp = pd.read_parquet(exp_path)
        df_imp = pd.read_parquet(imp_path)

        # Classificar por cadeia produtiva
        print("  Classificando por cadeia produtiva...")

        def aplicar_cadeia(row):
            _, nome = classificar_cadeia(row['CO_NCM'], row.get('DESC_NCM', ''), row['CAPITULO_NCM'])
            return nome

        df_exp['CADEIA'] = df_exp.apply(aplicar_cadeia, axis=1)
        df_imp['CADEIA'] = df_imp.apply(aplicar_cadeia, axis=1)

    print(f"  Exportacoes: {len(df_exp):,} registros")
    print(f"  Importacoes: {len(df_imp):,} registros")

    # Mostrar distribuição por cadeia
    print(f"  Cadeias (exp): {df_exp['CADEIA'].nunique()} cadeias")
    if len(df_imp) > 0:
        print(f"  Cadeias (imp): {df_imp['CADEIA'].nunique()} cadeias")

    return df_exp, df_imp


def preparar_aggregated(df_exp, df_imp):
    """Prepara dados agregados para o dashboard."""
    print("Preparando dados agregados...")

    # Metadados
    metadata = {
        "anoMin": int(min(df_exp['CO_ANO'].min(), df_imp['CO_ANO'].min())),
        "anoMax": int(max(df_exp['CO_ANO'].max(), df_imp['CO_ANO'].max())),
        "anos": sorted(list(set(df_exp['CO_ANO'].unique()) | set(df_imp['CO_ANO'].unique()))),
        "totalExportacoes": int(len(df_exp)),
        "totalImportacoes": int(len(df_imp)),
        "produtosExp": int(df_exp['CO_NCM'].nunique()),
        "produtosImp": int(df_imp['CO_NCM'].nunique()),
        "paisesDestino": int(df_exp['CO_PAIS'].nunique()),
        "paisesOrigem": int(df_imp['CO_PAIS'].nunique()),
        "valorTotalExp": float(df_exp['VL_FOB'].sum()),
        "valorTotalImp": float(df_imp['VL_FOB'].sum()),
        "pesoTotalExp": float(df_exp['KG_LIQUIDO'].sum()),
        "pesoTotalImp": float(df_imp['KG_LIQUIDO'].sum()),
    }

    # Filtros disponiveis
    capitulos = sorted(list(set(df_exp['CAPITULO_NCM'].unique()) | set(df_imp['CAPITULO_NCM'].unique())))
    cadeias = sorted(list(set(df_exp['CADEIA'].unique()) | set(df_imp['CADEIA'].unique())))
    filters = {
        "capitulos": [{"codigo": int(c), "nome": CATEGORIAS_NCM.get(c, f"Cap. {c}")} for c in capitulos],
        "cadeias": [
            {
                "nome": c,
                "cor": CADEIA_CORES.get(c, "#64748b"),
                "tipo": TIPO_CADEIA.get(c, "produto")  # produto ou insumo
            }
            for c in cadeias
        ],
        "paisesExp": sorted(df_exp['PAIS'].dropna().unique().tolist()),
        "paisesImp": sorted(df_imp['PAIS'].dropna().unique().tolist()),
    }

    # Serie temporal por ano
    exp_ano = df_exp.groupby('CO_ANO').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    exp_ano.columns = ['ano', 'valorExp', 'pesoExp', 'produtosExp']

    imp_ano = df_imp.groupby('CO_ANO').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    imp_ano.columns = ['ano', 'valorImp', 'pesoImp', 'produtosImp']

    timeseries = exp_ano.merge(imp_ano, on='ano', how='outer').fillna(0)
    timeseries['saldo'] = timeseries['valorExp'] - timeseries['valorImp']
    timeseries['corrente'] = timeseries['valorExp'] + timeseries['valorImp']
    timeseries = timeseries.to_dict('records')

    # Serie temporal por ano E por cadeia (para filtros)
    # Verificar se existe arquivo pré-processado
    timeseries_cadeia_path = os.path.join(DATA_DIR, "timeseries_by_cadeia.json")
    if os.path.exists(timeseries_cadeia_path):
        print("  Usando timeseriesByCadeia do processo unificado...")
        with open(timeseries_cadeia_path, 'r', encoding='utf-8') as f:
            timeseries_by_cadeia = json.load(f)
    else:
        exp_ano_cadeia = df_exp.groupby(['CO_ANO', 'CADEIA']).agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()
        exp_ano_cadeia.columns = ['ano', 'cadeia', 'valorExp', 'pesoExp']

        if len(df_imp) > 0:
            imp_ano_cadeia = df_imp.groupby(['CO_ANO', 'CADEIA']).agg({
                'VL_FOB': 'sum',
                'KG_LIQUIDO': 'sum'
            }).reset_index()
            imp_ano_cadeia.columns = ['ano', 'cadeia', 'valorImp', 'pesoImp']

            timeseries_by_cadeia = exp_ano_cadeia.merge(
                imp_ano_cadeia,
                on=['ano', 'cadeia'],
                how='outer'
            ).fillna(0)
        else:
            timeseries_by_cadeia = exp_ano_cadeia.copy()
            timeseries_by_cadeia['valorImp'] = 0
            timeseries_by_cadeia['pesoImp'] = 0

        timeseries_by_cadeia = timeseries_by_cadeia.to_dict('records')

    # Por cadeia produtiva (estilo VBP)
    exp_cadeia = df_exp.groupby('CADEIA').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    exp_cadeia = exp_cadeia.rename(columns={'CADEIA': 'categoria', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso', 'CO_NCM': 'produtos'})
    exp_cadeia['cor'] = exp_cadeia['categoria'].map(CADEIA_CORES)

    imp_cadeia = df_imp.groupby('CADEIA').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    imp_cadeia = imp_cadeia.rename(columns={'CADEIA': 'categoria', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso', 'CO_NCM': 'produtos'})
    imp_cadeia['cor'] = imp_cadeia['categoria'].map(CADEIA_CORES)

    # Por capitulo NCM (legado)
    exp_cap = df_exp.groupby('CAPITULO_NCM').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    exp_cap['categoria'] = exp_cap['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    exp_cap = exp_cap.rename(columns={'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso', 'CO_NCM': 'produtos'})

    imp_cap = df_imp.groupby('CAPITULO_NCM').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()
    imp_cap['categoria'] = imp_cap['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    imp_cap = imp_cap.rename(columns={'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso', 'CO_NCM': 'produtos'})

    byCategoria = {
        "exportacoes": exp_cadeia.sort_values('valor', ascending=False).to_dict('records'),
        "importacoes": imp_cadeia.sort_values('valor', ascending=False).to_dict('records')
    }

    byCapitulo = {
        "exportacoes": exp_cap.sort_values('valor', ascending=False).to_dict('records'),
        "importacoes": imp_cap.sort_values('valor', ascending=False).to_dict('records')
    }

    # Por pais (agregado - sem cadeia, para compatibilidade)
    exp_pais = df_exp.groupby(['CO_PAIS', 'PAIS']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_pais = exp_pais.rename(columns={'CO_PAIS': 'codigo', 'PAIS': 'pais', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    imp_pais = df_imp.groupby(['CO_PAIS', 'PAIS']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_pais = imp_pais.rename(columns={'CO_PAIS': 'codigo', 'PAIS': 'pais', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    byPais = {
        "exportacoes": exp_pais.sort_values('valor', ascending=False).head(50).to_dict('records'),
        "importacoes": imp_pais.sort_values('valor', ascending=False).head(50).to_dict('records')
    }

    # Por país E cadeia (para filtros por cadeia funcionarem)
    exp_pais_cadeia = df_exp.groupby(['CO_PAIS', 'PAIS', 'CADEIA']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_pais_cadeia = exp_pais_cadeia.rename(columns={
        'CO_PAIS': 'codigo', 'PAIS': 'pais', 'CADEIA': 'cadeia',
        'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'
    })

    imp_pais_cadeia = df_imp.groupby(['CO_PAIS', 'PAIS', 'CADEIA']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_pais_cadeia = imp_pais_cadeia.rename(columns={
        'CO_PAIS': 'codigo', 'PAIS': 'pais', 'CADEIA': 'cadeia',
        'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'
    })

    byPaisByCadeia = {
        "exportacoes": exp_pais_cadeia.to_dict('records'),
        "importacoes": imp_pais_cadeia.to_dict('records')
    }

    # Top produtos
    exp_prod = df_exp.groupby(['CO_NCM', 'DESC_NCM', 'CAPITULO_NCM', 'CADEIA']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_prod['capitulo'] = exp_prod['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    exp_prod = exp_prod.rename(columns={'CO_NCM': 'ncm', 'DESC_NCM': 'descricao', 'CADEIA': 'cadeia', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    imp_prod = df_imp.groupby(['CO_NCM', 'DESC_NCM', 'CAPITULO_NCM', 'CADEIA']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_prod['capitulo'] = imp_prod['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    imp_prod = imp_prod.rename(columns={'CO_NCM': 'ncm', 'DESC_NCM': 'descricao', 'CADEIA': 'cadeia', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    topProdutos = {
        "exportacoes": exp_prod.sort_values('valor', ascending=False).head(100).to_dict('records'),
        "importacoes": imp_prod.sort_values('valor', ascending=False).head(100).to_dict('records')
    }

    return {
        "metadata": metadata,
        "filters": filters,
        "timeseries": timeseries,
        "timeseriesByCadeia": timeseries_by_cadeia,
        "byCategoria": byCategoria,
        "byCapitulo": byCapitulo,
        "byPais": byPais,
        "byPaisByCadeia": byPaisByCadeia,
        "topProdutos": topProdutos
    }


def preparar_detailed(df_exp, df_imp):
    """Prepara dados detalhados por periodo para graficos."""
    print("Preparando dados detalhados...")

    # Exportacoes por ano/mes
    exp_periodo = df_exp.groupby(['CO_ANO', 'CO_MES', 'CAPITULO_NCM']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_periodo['periodo'] = exp_periodo['CO_ANO'].astype(str) + '-' + exp_periodo['CO_MES'].astype(str).str.zfill(2)
    exp_periodo['categoria'] = exp_periodo['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    exp_periodo = exp_periodo.rename(columns={'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    # Importacoes por ano/mes
    imp_periodo = df_imp.groupby(['CO_ANO', 'CO_MES', 'CAPITULO_NCM']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_periodo['periodo'] = imp_periodo['CO_ANO'].astype(str) + '-' + imp_periodo['CO_MES'].astype(str).str.zfill(2)
    imp_periodo['categoria'] = imp_periodo['CAPITULO_NCM'].map(CATEGORIAS_NCM)
    imp_periodo = imp_periodo.rename(columns={'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})

    # Serie temporal mensal agregada
    exp_mensal = df_exp.groupby(['CO_ANO', 'CO_MES']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_mensal['periodo'] = exp_mensal['CO_ANO'].astype(str) + '-' + exp_mensal['CO_MES'].astype(str).str.zfill(2)

    imp_mensal = df_imp.groupby(['CO_ANO', 'CO_MES']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_mensal['periodo'] = imp_mensal['CO_ANO'].astype(str) + '-' + imp_mensal['CO_MES'].astype(str).str.zfill(2)

    mensal = exp_mensal[['periodo', 'VL_FOB', 'KG_LIQUIDO']].merge(
        imp_mensal[['periodo', 'VL_FOB', 'KG_LIQUIDO']],
        on='periodo',
        how='outer',
        suffixes=('_exp', '_imp')
    ).fillna(0)
    mensal = mensal.rename(columns={
        'VL_FOB_exp': 'valorExp',
        'KG_LIQUIDO_exp': 'pesoExp',
        'VL_FOB_imp': 'valorImp',
        'KG_LIQUIDO_imp': 'pesoImp'
    })
    mensal['saldo'] = mensal['valorExp'] - mensal['valorImp']
    mensal = mensal.sort_values('periodo')

    return {
        "exportacoesPorPeriodo": exp_periodo[['periodo', 'categoria', 'valor', 'peso']].to_dict('records'),
        "importacoesPorPeriodo": imp_periodo[['periodo', 'categoria', 'valor', 'peso']].to_dict('records'),
        "timeseriesMensal": mensal.to_dict('records')
    }


def preparar_forecasts(df_exp, df_imp):
    """Prepara previsoes - usa arquivo gerado pelo forecasting.py se disponível."""
    print("Preparando previsoes...")

    # Verificar se existe arquivo de previsões gerado pelo forecasting.py
    forecasts_path = os.path.join(OUTPUT_DIR, "forecasts.json")
    if os.path.exists(forecasts_path):
        print("  Usando previsoes do forecasting.py...")
        with open(forecasts_path, 'r', encoding='utf-8') as f:
            forecasts_data = json.load(f)

        # Converter para formato esperado pelo frontend
        result = {
            "previsoes": forecasts_data.get('previsoes', {}),
            "modelo": forecasts_data.get('modelo', 'LinearTrend'),
            "geradoEm": forecasts_data.get('geradoEm', '')
        }

        # Também criar formato legado para compatibilidade
        exp_previsoes = []
        imp_previsoes = []

        # Histórico
        for item in forecasts_data.get('historico', {}).get('exportacoes', []):
            exp_previsoes.append({
                "ano": item['ano'],
                "valor": item['valor'],
                "tipo": "historico"
            })

        for item in forecasts_data.get('historico', {}).get('importacoes', []):
            imp_previsoes.append({
                "ano": item['ano'],
                "valor": item['valor'],
                "tipo": "historico"
            })

        # Previsões
        for item in forecasts_data.get('previsoes', {}).get('exportacoes', []):
            exp_previsoes.append({
                "ano": item['ano'],
                "valor": item['valor'],
                "valorMin": item.get('valorLower', item['valor'] * 0.85),
                "valorMax": item.get('valorUpper', item['valor'] * 1.15),
                "tipo": "previsao"
            })

        for item in forecasts_data.get('previsoes', {}).get('importacoes', []):
            imp_previsoes.append({
                "ano": item['ano'],
                "valor": item['valor'],
                "valorMin": item.get('valorLower', item['valor'] * 0.85),
                "valorMax": item.get('valorUpper', item['valor'] * 1.15),
                "tipo": "previsao"
            })

        return {
            "exportacoes": sorted(exp_previsoes, key=lambda x: x['ano']),
            "importacoes": sorted(imp_previsoes, key=lambda x: x['ano'])
        }

    # Fallback: gerar previsões simples
    print("  Gerando previsoes simples (fallback)...")

    # Agregacao anual
    exp_ano = df_exp.groupby('CO_ANO')['VL_FOB'].sum().reset_index()
    exp_ano.columns = ['ano', 'valor']

    imp_ano = df_imp.groupby('CO_ANO')['VL_FOB'].sum().reset_index() if len(df_imp) > 0 else pd.DataFrame({'ano': [], 'valor': []})
    imp_ano.columns = ['ano', 'valor']

    # Previsao simples: media movel + tendencia linear
    def forecast_simple(df, n_years=2):
        if len(df) < 2:
            return []

        anos = df['ano'].values
        valores = df['valor'].values

        # Regressao linear
        z = np.polyfit(anos, valores, 1)
        p = np.poly1d(z)

        # Previsoes
        anos_futuros = [int(anos[-1]) + i + 1 for i in range(n_years)]
        previsoes = []

        for ano in anos_futuros:
            valor_prev = p(ano)
            # Intervalo de confianca (simplificado: +/- 15%)
            previsoes.append({
                "ano": ano,
                "valor": float(valor_prev),
                "valorMin": float(valor_prev * 0.85),
                "valorMax": float(valor_prev * 1.15),
                "tipo": "previsao"
            })

        # Dados historicos
        historico = [{"ano": int(row['ano']), "valor": float(row['valor']), "tipo": "historico"}
                     for _, row in df.iterrows()]

        return historico + previsoes

    return {
        "exportacoes": forecast_simple(exp_ano),
        "importacoes": forecast_simple(imp_ano)
    }


def preparar_mapa_paises(df_exp, df_imp):
    """Prepara dados para o mapa de paises."""
    print("Preparando dados do mapa...")

    # Exportacoes por pais
    exp_pais = df_exp.groupby(['CO_PAIS', 'PAIS']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    exp_pais = exp_pais.rename(columns={'CO_PAIS': 'codigo', 'PAIS': 'pais', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})
    exp_pais['percentual'] = (exp_pais['valor'] / exp_pais['valor'].sum() * 100).round(2)

    # Importacoes por pais
    imp_pais = df_imp.groupby(['CO_PAIS', 'PAIS']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()
    imp_pais = imp_pais.rename(columns={'CO_PAIS': 'codigo', 'PAIS': 'pais', 'VL_FOB': 'valor', 'KG_LIQUIDO': 'peso'})
    imp_pais['percentual'] = (imp_pais['valor'] / imp_pais['valor'].sum() * 100).round(2)

    return {
        "exportacoes": exp_pais.to_dict('records'),
        "importacoes": imp_pais.to_dict('records')
    }


def converter_shapefile_geojson():
    """Converte o shapefile do mapa mundi para GeoJSON."""
    print("Convertendo shapefile para GeoJSON...")

    try:
        import geopandas as gpd

        gdf = gpd.read_file(SHAPEFILE_PATH)

        # Simplificar geometria para reduzir tamanho
        gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.5, preserve_topology=True)

        # Converter para GeoJSON
        geojson_path = os.path.join(OUTPUT_DIR, "countries.geojson")
        gdf.to_file(geojson_path, driver='GeoJSON')

        print(f"  GeoJSON salvo: {geojson_path}")
        print(f"  Paises: {len(gdf)}")

        return True

    except ImportError:
        print("  AVISO: geopandas nao instalado. Shapefile nao convertido.")
        print("  Execute: pip install geopandas")
        return False
    except Exception as e:
        print(f"  ERRO ao converter shapefile: {e}")
        return False


class NumpyEncoder(json.JSONEncoder):
    """Encoder para converter tipos numpy para tipos nativos Python."""
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super().default(obj)


def salvar_json(data, filename):
    """Salva dados como JSON compacto."""
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'), cls=NumpyEncoder)

    size_kb = os.path.getsize(filepath) / 1024
    print(f"  {filename}: {size_kb:.1f} KB")


def main():
    """Executa preparacao completa dos dados."""
    print("\n" + "="*60)
    print("PREPARACAO DE DADOS PARA O DASHBOARD")
    print("="*60 + "\n")

    # Criar diretorio de saida
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

    # Carregar dados
    df_exp, df_imp = carregar_dados()

    # Preparar e salvar dados
    print("\nPreparando arquivos JSON...")

    aggregated = preparar_aggregated(df_exp, df_imp)
    salvar_json(aggregated, "aggregated.json")

    detailed = preparar_detailed(df_exp, df_imp)
    salvar_json(detailed, "detailed.json")

    forecasts = preparar_forecasts(df_exp, df_imp)
    salvar_json(forecasts, "forecasts.json")

    mapData = preparar_mapa_paises(df_exp, df_imp)
    salvar_json(mapData, "map_data.json")

    # Converter shapefile
    print()
    converter_shapefile_geojson()

    print("\n" + "="*60)
    print("PREPARACAO CONCLUIDA!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
