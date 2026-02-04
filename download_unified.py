# -*- coding: utf-8 -*-
"""
Download de dados MUN (Município) do ComexStat com SH4 preservado.

Os arquivos MUN contêm tanto CO_MUN quanto SH4, permitindo:
- Classificação por cadeia produtiva (via SH4)
- Análise por município (via CO_MUN)
- Agregação por país de destino (via CO_PAIS)

URL Base: https://balanca.economia.gov.br/balanca/bd/comexstat-bd/mun/
Arquivos: EXP_YYYY_MUN.csv, IMP_YYYY_MUN.csv
"""

import requests
import pandas as pd
from pathlib import Path
import sys
import io
import time
import urllib3

# Desabilitar avisos de SSL para sites governamentais com certificados problemáticos
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configurações
BASE_URL = "https://balanca.economia.gov.br/balanca/bd/comexstat-bd/mun"
ANOS = [2020, 2021, 2022, 2023, 2024, 2025]
OUTPUT_DIR = Path("data/raw")
CAPITULOS_AGRO = list(range(1, 25))  # Capítulos 01-24 são agrícolas

def download_file(url, output_path, max_retries=3):
    """Download de arquivo com retry."""
    for attempt in range(max_retries):
        try:
            print(f"  Baixando: {url}")
            # verify=False para lidar com certificados SSL problemáticos do governo
            response = requests.get(url, timeout=120, verify=False)
            response.raise_for_status()

            with open(output_path, 'wb') as f:
                f.write(response.content)

            print(f"  Salvo: {output_path} ({len(response.content) / 1024 / 1024:.1f} MB)")
            return True

        except requests.exceptions.RequestException as e:
            print(f"  Tentativa {attempt + 1}/{max_retries} falhou: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)

    return False

def download_exp_mun():
    """Download dos arquivos de exportação MUN."""
    print("=== Download Exportações MUN ===\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for ano in ANOS:
        filename = f"EXP_{ano}_MUN.csv"
        url = f"{BASE_URL}/{filename}"
        output_path = OUTPUT_DIR / f"exp_mun_{ano}.csv"

        if output_path.exists():
            print(f"Arquivo {output_path} já existe, pulando...")
            continue

        if not download_file(url, output_path):
            print(f"ERRO: Não foi possível baixar {filename}")

def download_imp_mun():
    """Download dos arquivos de importação MUN."""
    print("\n=== Download Importações MUN ===\n")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for ano in ANOS:
        filename = f"IMP_{ano}_MUN.csv"
        url = f"{BASE_URL}/{filename}"
        output_path = OUTPUT_DIR / f"imp_mun_{ano}.csv"

        if output_path.exists():
            print(f"Arquivo {output_path} já existe, pulando...")
            continue

        if not download_file(url, output_path):
            print(f"ERRO: Não foi possível baixar {filename}")

def download_auxiliary_tables():
    """Download das tabelas auxiliares para nomes de países e municípios."""
    print("\n=== Download Tabelas Auxiliares ===\n")

    aux_dir = Path("data/auxiliary")
    aux_dir.mkdir(parents=True, exist_ok=True)

    # Tabela de países
    pais_url = "https://balanca.economia.gov.br/balanca/bd/tabelas/PAIS.csv"
    pais_path = aux_dir / "pais.csv"
    if not pais_path.exists():
        download_file(pais_url, pais_path)

    # Tabela de UF-Município
    mun_url = "https://balanca.economia.gov.br/balanca/bd/tabelas/UF_MUN.csv"
    mun_path = aux_dir / "uf_mun.csv"
    if not mun_path.exists():
        download_file(mun_url, mun_path)

def load_and_filter_agro(filepath, tipo='exp'):
    """
    Carrega arquivo CSV e filtra apenas capítulos agrícolas.

    O SH4 permite identificar o capítulo pelos 2 primeiros dígitos.
    """
    print(f"\nCarregando {filepath}...")

    # Colunas esperadas nos arquivos MUN
    # EXP: CO_ANO;CO_MES;CO_MUN;SH4;CO_PAIS;VL_FOB;KG_LIQUIDO
    # IMP: CO_ANO;CO_MES;CO_MUN;SH4;CO_PAIS;VL_FOB;VL_FRETE;VL_SEGURO;KG_LIQUIDO

    try:
        df = pd.read_csv(filepath, sep=';', encoding='latin-1', dtype={
            'CO_ANO': int,
            'CO_MES': int,
            'CO_MUN': int,
            'SH4': str,
            'CO_PAIS': int,
            'VL_FOB': float,
            'KG_LIQUIDO': float
        })
    except Exception as e:
        print(f"  Erro ao carregar: {e}")
        return None

    print(f"  Registros totais: {len(df):,}")

    # Extrair capítulo do SH4 (2 primeiros dígitos)
    df['SH4'] = df['SH4'].astype(str).str.zfill(4)
    df['CAPITULO'] = df['SH4'].str[:2].astype(int)

    # Filtrar apenas capítulos agrícolas (01-24)
    df_agro = df[df['CAPITULO'].isin(CAPITULOS_AGRO)].copy()
    print(f"  Registros agrícolas: {len(df_agro):,}")

    return df_agro

def combine_years():
    """Combina todos os anos em um único DataFrame."""
    print("\n=== Combinando Anos ===\n")

    # Exportações
    exp_dfs = []
    for ano in ANOS:
        filepath = OUTPUT_DIR / f"exp_mun_{ano}.csv"
        if filepath.exists():
            df = load_and_filter_agro(filepath, 'exp')
            if df is not None:
                exp_dfs.append(df)

    if exp_dfs:
        df_exp = pd.concat(exp_dfs, ignore_index=True)
        print(f"\nTotal exportações: {len(df_exp):,} registros")

        # Salvar parquet
        output_exp = Path("data/processed/exp_mun_agro.parquet")
        output_exp.parent.mkdir(parents=True, exist_ok=True)
        df_exp.to_parquet(output_exp, index=False)
        print(f"Salvo: {output_exp}")

    # Importações
    imp_dfs = []
    for ano in ANOS:
        filepath = OUTPUT_DIR / f"imp_mun_{ano}.csv"
        if filepath.exists():
            df = load_and_filter_agro(filepath, 'imp')
            if df is not None:
                imp_dfs.append(df)

    if imp_dfs:
        df_imp = pd.concat(imp_dfs, ignore_index=True)
        print(f"\nTotal importações: {len(df_imp):,} registros")

        # Salvar parquet
        output_imp = Path("data/processed/imp_mun_agro.parquet")
        df_imp.to_parquet(output_imp, index=False)
        print(f"Salvo: {output_imp}")

def main():
    """Função principal."""
    print("=" * 60)
    print("DOWNLOAD DADOS MUN COMEXSTAT - AGRICULTURA")
    print("=" * 60)

    # 1. Download exportações
    download_exp_mun()

    # 2. Download importações
    download_imp_mun()

    # 3. Download tabelas auxiliares
    download_auxiliary_tables()

    # 4. Combinar e filtrar
    combine_years()

    print("\n" + "=" * 60)
    print("DOWNLOAD CONCLUÍDO")
    print("=" * 60)

if __name__ == "__main__":
    main()
