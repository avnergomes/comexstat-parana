"""
Script para baixar dados de exportação/importação por município
ComexStat - MDIC
"""

import os
import sys
import io
import requests
import pandas as pd
from pathlib import Path
import urllib3

# Desabilitar avisos de SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configurações
BASE_URL = "https://balanca.economia.gov.br/balanca/bd/comexstat-bd/mun"
RAW_DIR = Path("data/raw_mun")
PROCESSED_DIR = Path("data/processed")
ANO_INICIO = 2020
ANO_FIM = 2025
UF_PARANA = "PR"
CAPITULOS_AGRICULTURA = list(range(1, 25))

# Colunas dos arquivos de exportação por município
COLUNAS_EXP_MUN = [
    "CO_ANO",      # Ano
    "CO_MES",      # Mês
    "SH4",         # Código SH4 (4 dígitos)
    "CO_PAIS",     # Código do país de destino
    "SG_UF_MUN",   # Sigla da UF
    "CO_MUN",      # Código do município
    "KG_LIQUIDO",  # Peso líquido (kg)
    "VL_FOB"       # Valor FOB (US$)
]

# Colunas dos arquivos de importação por município
COLUNAS_IMP_MUN = [
    "CO_ANO",
    "CO_MES",
    "SH4",
    "CO_PAIS",
    "SG_UF_MUN",
    "CO_MUN",
    "KG_LIQUIDO",
    "VL_FOB",
]


def download_file(url, filepath):
    """Baixa arquivo com bypass de SSL"""
    print(f"  Baixando: {url}")
    try:
        response = requests.get(url, verify=False, timeout=120)
        response.raise_for_status()
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"  Salvo: {filepath}")
        return True
    except Exception as e:
        print(f"  Erro: {e}")
        return False


def download_municipal_data():
    """Baixa dados de exportação/importação por município"""
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    for ano in range(ANO_INICIO, ANO_FIM + 1):
        # Exportações por município
        url_exp = f"{BASE_URL}/EXP_{ano}_MUN.csv"
        filepath_exp = RAW_DIR / f"EXP_{ano}_MUN.csv"
        if not filepath_exp.exists():
            download_file(url_exp, filepath_exp)
        else:
            print(f"  Já existe: {filepath_exp}")

        # Importações por município
        url_imp = f"{BASE_URL}/IMP_{ano}_MUN.csv"
        filepath_imp = RAW_DIR / f"IMP_{ano}_MUN.csv"
        if not filepath_imp.exists():
            download_file(url_imp, filepath_imp)
        else:
            print(f"  Já existe: {filepath_imp}")


def load_municipios():
    """Carrega tabela de municípios das tabelas auxiliares"""
    aux_file = Path("data/auxiliary/TABELAS_AUXILIARES.xlsx")
    if aux_file.exists():
        try:
            # Sheet 15 geralmente tem municípios
            df = pd.read_excel(aux_file, sheet_name="15")
            print(f"  Carregados {len(df)} municípios")
            return df
        except:
            try:
                df = pd.read_excel(aux_file, sheet_name="UF_MUN")
                return df
            except:
                pass
    return None


def process_municipal_data():
    """Processa dados por município e cria agregações para Sankey"""
    print("\n=== Processando dados por município ===")

    # Carregar tabela de países
    paises_file = Path("data/auxiliary/TABELAS_AUXILIARES.xlsx")
    paises_df = None
    if paises_file.exists():
        try:
            paises_df = pd.read_excel(paises_file, sheet_name="10")
            paises_df.columns = ['CO_PAIS', 'NO_PAIS', 'NO_PAIS_ING', 'NO_PAIS_ESP']
            print(f"  Carregados {len(paises_df)} países")
        except Exception as e:
            print(f"  Erro ao carregar países: {e}")

    # Carregar municípios - vamos usar a tabela auxiliar
    mun_df = None
    if paises_file.exists():
        try:
            # Tentar diferentes sheets para municípios
            for sheet in ["15", "14", "UF_MUN", "MUNICIPIO"]:
                try:
                    mun_df = pd.read_excel(paises_file, sheet_name=sheet)
                    if 'CO_MUN' in mun_df.columns or len(mun_df.columns) >= 2:
                        # Renomear colunas se necessário
                        cols = mun_df.columns.tolist()
                        if cols[0] != 'CO_MUN':
                            mun_df.columns = ['CO_MUN', 'NO_MUN'] + cols[2:] if len(cols) > 2 else ['CO_MUN', 'NO_MUN']
                        print(f"  Carregados {len(mun_df)} municípios da sheet {sheet}")
                        break
                except:
                    continue
        except Exception as e:
            print(f"  Erro ao carregar municípios: {e}")

    # Processar exportações
    all_exp = []
    for ano in range(ANO_INICIO, ANO_FIM + 1):
        filepath = RAW_DIR / f"EXP_{ano}_MUN.csv"
        if filepath.exists():
            print(f"  Lendo {filepath}...")
            df = pd.read_csv(filepath, sep=';', encoding='latin-1')
            # Filtrar Paraná
            df = df[df['SG_UF_MUN'] == UF_PARANA]
            # Filtrar agricultura (capítulos 01-24) - SH4 começa com 01-24
            df['CAPITULO'] = df['SH4'].astype(str).str.zfill(4).str[:2].astype(int)
            df = df[df['CAPITULO'].isin(CAPITULOS_AGRICULTURA)]
            all_exp.append(df)
            print(f"    {len(df)} registros agrícolas do PR")

    if all_exp:
        exp_df = pd.concat(all_exp, ignore_index=True)
        print(f"\n  Total exportações por município: {len(exp_df)} registros")

        # Agregar por município -> país
        flow_exp = exp_df.groupby(['CO_MUN', 'CO_PAIS']).agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()

        # Adicionar nomes
        if paises_df is not None:
            flow_exp = flow_exp.merge(paises_df[['CO_PAIS', 'NO_PAIS']], on='CO_PAIS', how='left')
            flow_exp['NO_PAIS'] = flow_exp['NO_PAIS'].fillna('Desconhecido')

        if mun_df is not None and 'CO_MUN' in mun_df.columns:
            flow_exp = flow_exp.merge(mun_df[['CO_MUN', 'NO_MUN']], on='CO_MUN', how='left')
            flow_exp['NO_MUN'] = flow_exp['NO_MUN'].fillna(flow_exp['CO_MUN'].astype(str))
        else:
            # Criar dicionário de municípios do Paraná manualmente (principais)
            mun_pr = {
                4106902: "Curitiba",
                4113700: "Londrina",
                4115200: "Maringá",
                4104808: "Cascavel",
                4108304: "Foz do Iguaçu",
                4119905: "Ponta Grossa",
                4109401: "Guarapuava",
                4118204: "Paranaguá",
                4125506: "Toledo",
                4106852: "Curiúva",
                4107702: "Francisco Beltrão",
                4117602: "Palotina",
                4119509: "Pitanga",
                4100400: "Apucarana",
                4102307: "Cafelândia",
                4103107: "Campo Mourão",
                4105508: "Cornélio Procópio",
                4110706: "Irati",
                4126256: "Ubiratã",
                4128104: "União da Vitória"
            }
            flow_exp['NO_MUN'] = flow_exp['CO_MUN'].map(mun_pr).fillna(flow_exp['CO_MUN'].astype(str))

        # Ordenar por valor e pegar top fluxos
        flow_exp = flow_exp.sort_values('VL_FOB', ascending=False)

        # Salvar dados de fluxo
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        flow_exp.to_parquet(PROCESSED_DIR / 'fluxo_municipio_pais.parquet', index=False)
        print(f"\n  Salvo: {PROCESSED_DIR / 'fluxo_municipio_pais.parquet'}")

        # Criar dados agregados para o Sankey (top 15 municípios -> top 15 países)
        top_mun = exp_df.groupby('CO_MUN')['VL_FOB'].sum().nlargest(15).index.tolist()
        top_pais = exp_df.groupby('CO_PAIS')['VL_FOB'].sum().nlargest(15).index.tolist()

        sankey_data = flow_exp[
            (flow_exp['CO_MUN'].isin(top_mun)) &
            (flow_exp['CO_PAIS'].isin(top_pais))
        ].copy()

        print(f"\n  Top 15 municípios exportadores:")
        mun_totals = exp_df.groupby('CO_MUN')['VL_FOB'].sum().nlargest(15)
        for cod, val in mun_totals.items():
            nome = flow_exp[flow_exp['CO_MUN'] == cod]['NO_MUN'].iloc[0] if len(flow_exp[flow_exp['CO_MUN'] == cod]) > 0 else cod
            print(f"    {nome}: US$ {val/1e9:.2f} bi")

        return sankey_data, flow_exp

    return None, None


def create_sankey_json(sankey_data, flow_exp):
    """Cria JSON para o gráfico Sankey"""
    import json
    import numpy as np

    class NumpyEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, (np.integer, np.int64, np.int32)):
                return int(obj)
            if isinstance(obj, (np.floating, np.float64, np.float32)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return super().default(obj)

    if sankey_data is None or len(sankey_data) == 0:
        print("  Sem dados para Sankey")
        return

    # Criar nodes (municípios + países)
    municipios = sankey_data['NO_MUN'].unique().tolist()
    paises = sankey_data['NO_PAIS'].unique().tolist()

    nodes = [{"id": f"mun_{m}", "name": m} for m in municipios]
    nodes += [{"id": f"pais_{p}", "name": p} for p in paises]

    # Criar links
    links = []
    for _, row in sankey_data.iterrows():
        links.append({
            "source": f"mun_{row['NO_MUN']}",
            "target": f"pais_{row['NO_PAIS']}",
            "value": float(row['VL_FOB'])
        })

    # Ordenar links por valor
    links = sorted(links, key=lambda x: x['value'], reverse=True)[:50]  # Top 50 fluxos

    sankey_json = {
        "nodes": nodes,
        "links": links
    }

    output_path = Path("dashboard/public/data/sankey_data.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(sankey_json, f, cls=NumpyEncoder, ensure_ascii=False, indent=2)

    print(f"\n  Salvo: {output_path}")
    print(f"  {len(nodes)} nodes, {len(links)} links")


if __name__ == "__main__":
    print("=== Download de dados por município ===\n")
    download_municipal_data()

    sankey_data, flow_exp = process_municipal_data()

    if sankey_data is not None:
        create_sankey_json(sankey_data, flow_exp)

    print("\n=== Concluído ===")
