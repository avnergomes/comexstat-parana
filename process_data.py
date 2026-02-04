# -*- coding: utf-8 -*-
"""
Script para processamento e filtragem dos dados do ComexStat
Filtra dados para o estado do Parana e produtos agricolas
"""

import os
import sys
import io
import pandas as pd
from pathlib import Path
from typing import Optional
import config

# Fix encoding for Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def carregar_tabela_ncm() -> pd.DataFrame:
    """
    Carrega a tabela de codigos NCM das tabelas auxiliares.

    Returns:
        DataFrame com codigos NCM e descricoes
    """
    arquivo = os.path.join(config.AUXILIARY_DIR, "TABELAS_AUXILIARES.xlsx")

    if not os.path.exists(arquivo):
        raise FileNotFoundError(
            f"Tabelas auxiliares nao encontradas: {arquivo}\n"
            "Execute download_data.py primeiro."
        )

    print("Carregando tabela NCM...")
    # Aba "1" contem o Sistema Harmonizado com NCM
    df_ncm = pd.read_excel(arquivo, sheet_name="1", dtype=str)
    print(f"  {len(df_ncm)} codigos NCM carregados")
    return df_ncm


def carregar_tabela_paises() -> pd.DataFrame:
    """Carrega a tabela de paises das tabelas auxiliares."""
    arquivo = os.path.join(config.AUXILIARY_DIR, "TABELAS_AUXILIARES.xlsx")

    print("Carregando tabela de paises...")
    # Aba "10" contem os paises
    df_paises = pd.read_excel(arquivo, sheet_name="10", dtype=str)
    print(f"  {len(df_paises)} paises carregados")
    return df_paises


def carregar_tabela_vias() -> pd.DataFrame:
    """Carrega a tabela de vias de transporte."""
    arquivo = os.path.join(config.AUXILIARY_DIR, "TABELAS_AUXILIARES.xlsx")

    print("Carregando tabela de vias de transporte...")
    # Aba "14" contem as vias de transporte
    df_vias = pd.read_excel(arquivo, sheet_name="14", dtype=str)
    print(f"  {len(df_vias)} vias carregadas")
    return df_vias


def eh_produto_agricola(ncm: str) -> bool:
    """
    Verifica se um código NCM é de produto agrícola (capítulos 01-24).

    Args:
        ncm: Código NCM (8 dígitos)

    Returns:
        True se for produto agrícola
    """
    try:
        capitulo = int(str(ncm)[:2])
        return capitulo in config.CAPITULOS_AGRICULTURA
    except (ValueError, TypeError):
        return False


def processar_arquivo_exportacao(ano: int) -> Optional[pd.DataFrame]:
    """
    Processa arquivo de exportação, filtrando para Paraná e agricultura.

    Args:
        ano: Ano dos dados

    Returns:
        DataFrame filtrado ou None se arquivo não existe
    """
    arquivo = os.path.join(config.RAW_DIR, f"EXP_{ano}.csv")

    if not os.path.exists(arquivo):
        print(f"Arquivo não encontrado: {arquivo}")
        return None

    print(f"\nProcessando exportações {ano}...")

    # Ler CSV em chunks para economizar memória
    chunks = []
    chunk_size = 500000

    for chunk in pd.read_csv(arquivo, sep=";", dtype=str, chunksize=chunk_size):
        # Filtrar por Paraná
        chunk_pr = chunk[chunk['SG_UF_NCM'] == config.UF_PARANA]

        # Filtrar por produtos agrícolas
        chunk_agro = chunk_pr[chunk_pr['CO_NCM'].apply(eh_produto_agricola)]

        if len(chunk_agro) > 0:
            chunks.append(chunk_agro)

    if not chunks:
        print(f"  Nenhum dado encontrado para Paraná/Agricultura em {ano}")
        return None

    df = pd.concat(chunks, ignore_index=True)

    # Converter colunas numéricas
    colunas_numericas = ['CO_ANO', 'CO_MES', 'QT_ESTAT', 'KG_LIQUIDO', 'VL_FOB']
    for col in colunas_numericas:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    print(f"  {len(df)} registros filtrados")
    return df


def processar_arquivo_importacao(ano: int) -> Optional[pd.DataFrame]:
    """
    Processa arquivo de importação, filtrando para Paraná e agricultura.

    Args:
        ano: Ano dos dados

    Returns:
        DataFrame filtrado ou None se arquivo não existe
    """
    arquivo = os.path.join(config.RAW_DIR, f"IMP_{ano}.csv")

    if not os.path.exists(arquivo):
        print(f"Arquivo não encontrado: {arquivo}")
        return None

    print(f"\nProcessando importações {ano}...")

    chunks = []
    chunk_size = 500000

    for chunk in pd.read_csv(arquivo, sep=";", dtype=str, chunksize=chunk_size):
        # Filtrar por Paraná
        chunk_pr = chunk[chunk['SG_UF_NCM'] == config.UF_PARANA]

        # Filtrar por produtos agrícolas
        chunk_agro = chunk_pr[chunk_pr['CO_NCM'].apply(eh_produto_agricola)]

        if len(chunk_agro) > 0:
            chunks.append(chunk_agro)

    if not chunks:
        print(f"  Nenhum dado encontrado para Paraná/Agricultura em {ano}")
        return None

    df = pd.concat(chunks, ignore_index=True)

    # Converter colunas numéricas
    colunas_numericas = ['CO_ANO', 'CO_MES', 'QT_ESTAT', 'KG_LIQUIDO',
                         'VL_FOB', 'VL_FRETE', 'VL_SEGURO']
    for col in colunas_numericas:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    print(f"  {len(df)} registros filtrados")
    return df


def enriquecer_dados(df: pd.DataFrame, df_ncm: pd.DataFrame,
                     df_paises: pd.DataFrame) -> pd.DataFrame:
    """
    Enriquece os dados com descrições de NCM e países.

    Args:
        df: DataFrame com dados de comércio
        df_ncm: DataFrame com tabela NCM
        df_paises: DataFrame com tabela de países

    Returns:
        DataFrame enriquecido
    """
    print("Enriquecendo dados com descrições...")

    # Adicionar descrição do NCM
    if 'CO_NCM' in df_ncm.columns and 'NO_NCM_POR' in df_ncm.columns:
        df_ncm_map = df_ncm[['CO_NCM', 'NO_NCM_POR']].drop_duplicates()
        df = df.merge(df_ncm_map, on='CO_NCM', how='left')
        df.rename(columns={'NO_NCM_POR': 'DESC_NCM'}, inplace=True)

    # Adicionar nome do país
    if 'CO_PAIS' in df_paises.columns and 'NO_PAIS' in df_paises.columns:
        df_paises_map = df_paises[['CO_PAIS', 'NO_PAIS']].drop_duplicates()
        df = df.merge(df_paises_map, on='CO_PAIS', how='left')
        df.rename(columns={'NO_PAIS': 'PAIS'}, inplace=True)

    # Adicionar capítulo NCM
    df['CAPITULO_NCM'] = df['CO_NCM'].str[:2].astype(int)

    return df


def gerar_estatisticas(df: pd.DataFrame, tipo: str) -> pd.DataFrame:
    """
    Gera estatísticas agregadas dos dados.

    Args:
        df: DataFrame com dados
        tipo: "EXP" ou "IMP"

    Returns:
        DataFrame com estatísticas
    """
    print(f"\nGerando estatísticas de {tipo}...")

    # Agregar por ano, mês e capítulo NCM
    stats = df.groupby(['CO_ANO', 'CO_MES', 'CAPITULO_NCM']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()

    stats.rename(columns={
        'VL_FOB': 'VALOR_FOB_USD',
        'KG_LIQUIDO': 'PESO_KG',
        'CO_NCM': 'QTD_PRODUTOS'
    }, inplace=True)

    return stats


def processar_todos_anos(anos: list = None) -> dict:
    """
    Processa todos os anos configurados.

    Args:
        anos: Lista de anos. Se None, usa config.

    Returns:
        Dicionário com DataFrames processados
    """
    if anos is None:
        anos = list(range(config.ANO_INICIO, config.ANO_FIM + 1))

    print(f"\n{'='*60}")
    print("PROCESSAMENTO DOS DADOS COMEXSTAT - PARANÁ AGRICULTURA")
    print(f"Anos: {anos[0]} a {anos[-1]}")
    print(f"{'='*60}")

    # Carregar tabelas auxiliares
    try:
        df_ncm = carregar_tabela_ncm()
        df_paises = carregar_tabela_paises()
    except FileNotFoundError as e:
        print(f"Erro: {e}")
        return {}

    # Processar exportações
    dfs_exp = []
    for ano in anos:
        df = processar_arquivo_exportacao(ano)
        if df is not None:
            dfs_exp.append(df)

    # Processar importações
    dfs_imp = []
    for ano in anos:
        df = processar_arquivo_importacao(ano)
        if df is not None:
            dfs_imp.append(df)

    resultados = {}

    # Consolidar exportações
    if dfs_exp:
        df_exp = pd.concat(dfs_exp, ignore_index=True)
        df_exp = enriquecer_dados(df_exp, df_ncm, df_paises)
        resultados['exportacoes'] = df_exp

        # Salvar dados processados
        arquivo_exp = os.path.join(config.PROCESSED_DIR, "exportacoes_pr_agro.parquet")
        df_exp.to_parquet(arquivo_exp, index=False)
        print(f"\nExportações salvas: {arquivo_exp}")

        # Gerar e salvar estatísticas
        stats_exp = gerar_estatisticas(df_exp, "exportações")
        arquivo_stats_exp = os.path.join(config.PROCESSED_DIR, "stats_exportacoes_pr_agro.csv")
        stats_exp.to_csv(arquivo_stats_exp, index=False)
        print(f"Estatísticas exportações: {arquivo_stats_exp}")

    # Consolidar importações
    if dfs_imp:
        df_imp = pd.concat(dfs_imp, ignore_index=True)
        df_imp = enriquecer_dados(df_imp, df_ncm, df_paises)
        resultados['importacoes'] = df_imp

        # Salvar dados processados
        arquivo_imp = os.path.join(config.PROCESSED_DIR, "importacoes_pr_agro.parquet")
        df_imp.to_parquet(arquivo_imp, index=False)
        print(f"\nImportações salvas: {arquivo_imp}")

        # Gerar e salvar estatísticas
        stats_imp = gerar_estatisticas(df_imp, "importações")
        arquivo_stats_imp = os.path.join(config.PROCESSED_DIR, "stats_importacoes_pr_agro.csv")
        stats_imp.to_csv(arquivo_stats_imp, index=False)
        print(f"Estatísticas importações: {arquivo_stats_imp}")

    print(f"\n{'='*60}")
    print("PROCESSAMENTO CONCLUÍDO")
    print(f"{'='*60}\n")

    return resultados


if __name__ == "__main__":
    processar_todos_anos()
