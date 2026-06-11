# -*- coding: utf-8 -*-
"""
Download dos dados MUN do ComexStat com SH4 preservado.

Os arquivos MUN contem tanto CO_MUN quanto SH4, permitindo:
- classificacao por cadeia produtiva (via SH4)
- analise por municipio (via CO_MUN)
- agregacao por pais de destino (via CO_PAIS)
"""

from datetime import date
from pathlib import Path
import io
import sys
import time

import certifi
import pandas as pd
import requests

# Configurar encoding UTF-8 para Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

BASE_URL = "https://balanca.economia.gov.br/balanca/bd/comexstat-bd/mun"
# Anos dinâmicos: antes era uma lista hardcoded até 2025, que congelava o
# pipeline silenciosamente quando o ano virava.
ANOS = list(range(2020, date.today().year + 1))
# O ComexStat revisa dados retroativamente: o ano corrente e o anterior são
# sempre re-baixados, ignorando o skip-if-exists.
ANOS_SEMPRE_ATUALIZAR = set(ANOS[-2:])
OUTPUT_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
AUX_DIR = Path("data/auxiliary")
CAPITULOS_AGRO = list(range(1, 25))
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; GitHubActions/1.0; +https://github.com/avnergomes/comexstat-parana)"
}


def download_file(url, output_path, max_retries=3):
    """Baixa um arquivo com retry (verificacao SSL sempre ativa)."""
    verify = certifi.where()

    for attempt in range(max_retries):
        try:
            print(f"  Baixando: {url}")
            response = requests.get(
                url,
                timeout=120,
                verify=verify,
                headers=REQUEST_HEADERS,
            )
            response.raise_for_status()

            with open(output_path, "wb") as f:
                f.write(response.content)

            size_mb = len(response.content) / 1024 / 1024
            print(f"  Salvo: {output_path} ({size_mb:.1f} MB)")
            return True
        except requests.exceptions.RequestException as e:
            print(f"  Tentativa {attempt + 1}/{max_retries} falhou: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)

    return False


def download_exp_mun():
    print("=== Download Exportacoes MUN ===\n")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    failed = []

    for ano in ANOS:
        filename = f"EXP_{ano}_MUN.csv"
        url = f"{BASE_URL}/{filename}"
        output_path = OUTPUT_DIR / f"exp_mun_{ano}.csv"

        if output_path.exists() and ano not in ANOS_SEMPRE_ATUALIZAR:
            print(f"Arquivo {output_path} ja existe, pulando...")
            continue

        if not download_file(url, output_path):
            print(f"ERRO: nao foi possivel baixar {filename}")
            failed.append(filename)

    return failed


def download_imp_mun():
    print("\n=== Download Importacoes MUN ===\n")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    failed = []

    for ano in ANOS:
        filename = f"IMP_{ano}_MUN.csv"
        url = f"{BASE_URL}/{filename}"
        output_path = OUTPUT_DIR / f"imp_mun_{ano}.csv"

        if output_path.exists() and ano not in ANOS_SEMPRE_ATUALIZAR:
            print(f"Arquivo {output_path} ja existe, pulando...")
            continue

        if not download_file(url, output_path):
            print(f"ERRO: nao foi possivel baixar {filename}")
            failed.append(filename)

    return failed


def download_auxiliary_tables():
    print("\n=== Download Tabelas Auxiliares ===\n")
    AUX_DIR.mkdir(parents=True, exist_ok=True)
    failed = []

    files = [
        ("PAIS.csv", "https://balanca.economia.gov.br/balanca/bd/tabelas/PAIS.csv", AUX_DIR / "pais.csv"),
        ("UF_MUN.csv", "https://balanca.economia.gov.br/balanca/bd/tabelas/UF_MUN.csv", AUX_DIR / "uf_mun.csv"),
    ]

    for label, url, path in files:
        if path.exists():
            print(f"Arquivo {path} ja existe, pulando...")
            continue
        if not download_file(url, path):
            failed.append(label)

    return failed


def load_and_filter_agro(filepath):
    """Carrega um CSV MUN e filtra apenas capitulos agricolas."""
    print(f"\nCarregando {filepath}...")

    try:
        df = pd.read_csv(
            filepath,
            sep=";",
            encoding="latin-1",
            dtype={
                "CO_ANO": int,
                "CO_MES": int,
                "CO_MUN": int,
                "SH4": str,
                "CO_PAIS": int,
                "VL_FOB": float,
                "KG_LIQUIDO": float,
            },
        )
    except Exception as e:
        print(f"  Erro ao carregar: {e}")
        return None

    print(f"  Registros totais: {len(df):,}")

    df["SH4"] = df["SH4"].astype(str).str.zfill(4)
    df["CAPITULO"] = df["SH4"].str[:2].astype(int)
    df_agro = df[df["CAPITULO"].isin(CAPITULOS_AGRO)].copy()
    print(f"  Registros agricolas: {len(df_agro):,}")
    return df_agro


def combine_years():
    """Combina todos os anos baixados e gera os parquets processados."""
    print("\n=== Combinando Anos ===\n")
    outputs = {"exports": False, "imports": False}

    exp_dfs = []
    for ano in ANOS:
        filepath = OUTPUT_DIR / f"exp_mun_{ano}.csv"
        if filepath.exists():
            df = load_and_filter_agro(filepath)
            if df is not None:
                exp_dfs.append(df)

    if exp_dfs:
        df_exp = pd.concat(exp_dfs, ignore_index=True)
        print(f"\nTotal exportacoes: {len(df_exp):,} registros")
        output_exp = PROCESSED_DIR / "exp_mun_agro.parquet"
        output_exp.parent.mkdir(parents=True, exist_ok=True)
        df_exp.to_parquet(output_exp, index=False)
        print(f"Salvo: {output_exp}")
        outputs["exports"] = True

    imp_dfs = []
    for ano in ANOS:
        filepath = OUTPUT_DIR / f"imp_mun_{ano}.csv"
        if filepath.exists():
            df = load_and_filter_agro(filepath)
            if df is not None:
                imp_dfs.append(df)

    if imp_dfs:
        df_imp = pd.concat(imp_dfs, ignore_index=True)
        print(f"\nTotal importacoes: {len(df_imp):,} registros")
        output_imp = PROCESSED_DIR / "imp_mun_agro.parquet"
        output_imp.parent.mkdir(parents=True, exist_ok=True)
        df_imp.to_parquet(output_imp, index=False)
        print(f"Salvo: {output_imp}")
        outputs["imports"] = True

    return outputs


def main():
    print("=" * 60)
    print("DOWNLOAD DADOS MUN COMEXSTAT - AGRICULTURA")
    print("=" * 60)

    failed = []
    failed.extend(download_exp_mun())
    failed.extend(download_imp_mun())
    failed.extend(download_auxiliary_tables())
    outputs = combine_years()

    print("\n" + "=" * 60)
    print("DOWNLOAD CONCLUIDO")
    print("=" * 60)

    if failed:
        print(f"ERRO: arquivos nao baixados: {', '.join(failed)}")
        sys.exit(1)

    if not outputs["exports"]:
        print("ERRO: exportacoes processadas nao foram geradas")
        sys.exit(1)

    if not outputs["imports"]:
        print("ERRO: importacoes processadas nao foram geradas")
        sys.exit(1)


if __name__ == "__main__":
    main()
