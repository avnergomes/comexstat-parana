# -*- coding: utf-8 -*-
"""
Pipeline Principal - ComexStat Parana Agricultura
Executa todo o fluxo de download, processamento e geracao de relatorios.

Uso:
    python pipeline.py                    # Executa pipeline completa
    python pipeline.py --download-only    # Apenas download
    python pipeline.py --process-only     # Apenas processamento
    python pipeline.py --anos 2023 2024   # Anos especificos
"""

import argparse
import sys
import io
from datetime import datetime

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import config
from download_data import executar_downloads
from process_data import processar_todos_anos


def imprimir_cabecalho():
    """Imprime cabeçalho da pipeline."""
    print("""
╔══════════════════════════════════════════════════════════════════╗
║     PIPELINE COMEXSTAT - PARANÁ AGRICULTURA                      ║
║     Dados de Comércio Exterior - Produtos Agrícolas              ║
╚══════════════════════════════════════════════════════════════════╝
    """)
    print(f"Execução iniciada em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Estado: {config.UF_PARANA}")
    print(f"Capítulos NCM (Agricultura): 01-24")
    print()


def imprimir_resumo(resultados: dict):
    """Imprime resumo dos dados processados."""
    print("\n" + "="*60)
    print("RESUMO DOS DADOS PROCESSADOS")
    print("="*60)

    if 'exportacoes' in resultados:
        df_exp = resultados['exportacoes']
        print(f"\nEXPORTAÇÕES:")
        print(f"  Total de registros: {len(df_exp):,}")
        print(f"  Valor FOB total: US$ {df_exp['VL_FOB'].sum():,.2f}")
        print(f"  Peso total: {df_exp['KG_LIQUIDO'].sum()/1e6:,.2f} mil toneladas")
        print(f"  Produtos únicos (NCM): {df_exp['CO_NCM'].nunique()}")
        print(f"  Países de destino: {df_exp['CO_PAIS'].nunique()}")

        # Top 5 produtos por valor
        top_produtos = df_exp.groupby('CO_NCM')['VL_FOB'].sum().nlargest(5)
        print(f"\n  Top 5 produtos exportados (por valor FOB):")
        for ncm, valor in top_produtos.items():
            desc = df_exp[df_exp['CO_NCM'] == ncm]['DESC_NCM'].iloc[0] if 'DESC_NCM' in df_exp.columns else ncm
            desc = str(desc)[:50] + "..." if len(str(desc)) > 50 else desc
            print(f"    - {ncm}: US$ {valor:,.2f} ({desc})")

    if 'importacoes' in resultados:
        df_imp = resultados['importacoes']
        print(f"\nIMPORTAÇÕES:")
        print(f"  Total de registros: {len(df_imp):,}")
        print(f"  Valor FOB total: US$ {df_imp['VL_FOB'].sum():,.2f}")
        print(f"  Peso total: {df_imp['KG_LIQUIDO'].sum()/1e6:,.2f} mil toneladas")
        print(f"  Produtos únicos (NCM): {df_imp['CO_NCM'].nunique()}")
        print(f"  Países de origem: {df_imp['CO_PAIS'].nunique()}")

    print("\n" + "="*60)


def executar_pipeline(anos: list = None, download: bool = True,
                      processar: bool = True, incluir_municipios: bool = False):
    """
    Executa a pipeline completa ou parcial.

    Args:
        anos: Lista de anos para processar
        download: Se True, executa o download dos dados
        processar: Se True, executa o processamento
        incluir_municipios: Se True, baixa também dados por município
    """
    imprimir_cabecalho()

    if anos is None:
        anos = list(range(config.ANO_INICIO, config.ANO_FIM + 1))

    print(f"Anos selecionados: {anos}")
    print()

    # Etapa 1: Download
    if download:
        print("\n" + "="*60)
        print("ETAPA 1: DOWNLOAD DOS DADOS")
        print("="*60)
        sucesso_download = executar_downloads(anos, incluir_municipios)
        if not sucesso_download:
            print("AVISO: Alguns downloads falharam. Continuando com arquivos disponíveis...")

    # Etapa 2: Processamento
    resultados = {}
    if processar:
        print("\n" + "="*60)
        print("ETAPA 2: PROCESSAMENTO E FILTRAGEM")
        print("="*60)
        resultados = processar_todos_anos(anos)

        if resultados:
            imprimir_resumo(resultados)

    print(f"\nPipeline finalizada em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\nArquivos gerados em: {config.PROCESSED_DIR}/")
    print("  - exportacoes_pr_agro.parquet")
    print("  - importacoes_pr_agro.parquet")
    print("  - stats_exportacoes_pr_agro.csv")
    print("  - stats_importacoes_pr_agro.csv")

    return resultados


def main():
    """Função principal com parsing de argumentos."""
    parser = argparse.ArgumentParser(
        description="Pipeline ComexStat - Paraná Agricultura",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python pipeline.py                      # Pipeline completa (2020-2025)
  python pipeline.py --anos 2023 2024     # Anos específicos
  python pipeline.py --download-only      # Apenas download
  python pipeline.py --process-only       # Apenas processamento
  python pipeline.py --com-municipios     # Incluir dados por município
        """
    )

    parser.add_argument(
        '--anos',
        nargs='+',
        type=int,
        help='Anos para processar (ex: 2023 2024)'
    )

    parser.add_argument(
        '--download-only',
        action='store_true',
        help='Executa apenas o download dos dados'
    )

    parser.add_argument(
        '--process-only',
        action='store_true',
        help='Executa apenas o processamento (dados já baixados)'
    )

    parser.add_argument(
        '--com-municipios',
        action='store_true',
        help='Inclui download de dados por município'
    )

    args = parser.parse_args()

    # Determinar o que executar
    download = True
    processar = True

    if args.download_only:
        processar = False
    elif args.process_only:
        download = False

    # Executar pipeline
    try:
        executar_pipeline(
            anos=args.anos,
            download=download,
            processar=processar,
            incluir_municipios=args.com_municipios
        )
    except KeyboardInterrupt:
        print("\n\nPipeline interrompida pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\nErro na execução da pipeline: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
