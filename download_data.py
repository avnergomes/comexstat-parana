# -*- coding: utf-8 -*-
"""
Script para download dos dados do ComexStat
Fonte: https://www.gov.br/mdic/pt-br/assuntos/comercio-exterior/estatisticas/base-de-dados-bruta
"""

import os
import sys
import io
import requests
from pathlib import Path
from tqdm import tqdm
import config

# Fix encoding for Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def criar_diretorios():
    """Cria a estrutura de diretórios necessária."""
    diretorios = [
        config.DATA_DIR,
        config.RAW_DIR,
        config.PROCESSED_DIR,
        config.AUXILIARY_DIR
    ]
    for diretorio in diretorios:
        Path(diretorio).mkdir(parents=True, exist_ok=True)
        print(f"Diretório criado/verificado: {diretorio}")


def download_arquivo(url: str, destino: str, descricao: str = None) -> bool:
    """
    Faz download de um arquivo com barra de progresso.

    Args:
        url: URL do arquivo
        destino: Caminho de destino local
        descricao: Descrição para a barra de progresso

    Returns:
        True se o download foi bem sucedido, False caso contrário
    """
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    try:
        response = requests.get(url, stream=True, timeout=300, verify=False)
        response.raise_for_status()

        total_size = int(response.headers.get('content-length', 0))

        with open(destino, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True,
                      desc=descricao or os.path.basename(destino)) as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))

        print(f"Download concluído: {destino}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"Erro no download de {url}: {e}")
        return False


def download_tabelas_auxiliares():
    """Baixa as tabelas auxiliares (NCM, países, etc.)."""
    destino = os.path.join(config.AUXILIARY_DIR, "TABELAS_AUXILIARES.xlsx")

    if os.path.exists(destino):
        print(f"Tabelas auxiliares já existem: {destino}")
        return True

    print("\nBaixando tabelas auxiliares...")
    return download_arquivo(
        config.URL_TABELAS_AUXILIARES,
        destino,
        "TABELAS_AUXILIARES.xlsx"
    )


def download_exportacoes(ano: int) -> bool:
    """
    Baixa os dados de exportação de um ano específico.

    Args:
        ano: Ano dos dados (ex: 2023)

    Returns:
        True se o download foi bem sucedido
    """
    nome_arquivo = f"EXP_{ano}.csv"
    url = f"{config.BASE_URL_COMEXSTAT}/{nome_arquivo}"
    destino = os.path.join(config.RAW_DIR, nome_arquivo)

    if os.path.exists(destino):
        print(f"Arquivo já existe: {destino}")
        return True

    return download_arquivo(url, destino, f"Exportações {ano}")


def download_importacoes(ano: int) -> bool:
    """
    Baixa os dados de importação de um ano específico.

    Args:
        ano: Ano dos dados (ex: 2023)

    Returns:
        True se o download foi bem sucedido
    """
    nome_arquivo = f"IMP_{ano}.csv"
    url = f"{config.BASE_URL_COMEXSTAT}/{nome_arquivo}"
    destino = os.path.join(config.RAW_DIR, nome_arquivo)

    if os.path.exists(destino):
        print(f"Arquivo já existe: {destino}")
        return True

    return download_arquivo(url, destino, f"Importações {ano}")


def download_dados_municipios(ano: int, tipo: str = "EXP") -> bool:
    """
    Baixa os dados por município de um ano específico.

    Args:
        ano: Ano dos dados
        tipo: "EXP" para exportação ou "IMP" para importação

    Returns:
        True se o download foi bem sucedido
    """
    nome_arquivo = f"{tipo}_{ano}_MUN.csv"
    url = f"{config.BASE_URL_MUNICIPIOS}/{nome_arquivo}"
    destino = os.path.join(config.RAW_DIR, nome_arquivo)

    if os.path.exists(destino):
        print(f"Arquivo já existe: {destino}")
        return True

    return download_arquivo(url, destino, f"{tipo} Municípios {ano}")


def executar_downloads(anos: list = None, incluir_municipios: bool = False):
    """
    Executa o download de todos os dados necessários.

    Args:
        anos: Lista de anos para download. Se None, usa config.
        incluir_municipios: Se True, baixa também dados por município
    """
    criar_diretorios()

    if anos is None:
        anos = list(range(config.ANO_INICIO, config.ANO_FIM + 1))

    print(f"\n{'='*60}")
    print(f"DOWNLOAD DOS DADOS DO COMEXSTAT")
    print(f"Anos: {anos[0]} a {anos[-1]}")
    print(f"{'='*60}\n")

    # Download das tabelas auxiliares
    download_tabelas_auxiliares()

    # Download dos dados de exportação e importação
    erros = []

    for ano in anos:
        print(f"\n--- Processando ano {ano} ---")

        if not download_exportacoes(ano):
            erros.append(f"EXP_{ano}")

        if not download_importacoes(ano):
            erros.append(f"IMP_{ano}")

        if incluir_municipios:
            if not download_dados_municipios(ano, "EXP"):
                erros.append(f"EXP_{ano}_MUN")
            if not download_dados_municipios(ano, "IMP"):
                erros.append(f"IMP_{ano}_MUN")

    print(f"\n{'='*60}")
    print("DOWNLOAD CONCLUÍDO")
    if erros:
        print(f"Arquivos com erro: {erros}")
    else:
        print("Todos os arquivos baixados com sucesso!")
    print(f"{'='*60}\n")

    return len(erros) == 0


if __name__ == "__main__":
    executar_downloads()
