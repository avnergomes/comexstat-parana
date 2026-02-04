"""
Script de Análise - ComexStat Paraná Agricultura
Gera relatórios e análises dos dados processados.
"""

import os
import pandas as pd
import config

# Mapeamento dos capítulos NCM para categorias de agricultura
CATEGORIAS_AGRICULTURA = {
    1: "Animais vivos",
    2: "Carnes e miudezas",
    3: "Peixes e crustáceos",
    4: "Laticínios, ovos e mel",
    5: "Outros produtos animais",
    6: "Plantas vivas e floricultura",
    7: "Hortícolas e raízes",
    8: "Frutas",
    9: "Café, chá e especiarias",
    10: "Cereais",
    11: "Produtos de moagem",
    12: "Sementes oleaginosas (soja)",
    13: "Gomas e resinas",
    14: "Matérias para entrançar",
    15: "Gorduras e óleos",
    16: "Preparações de carne/peixe",
    17: "Açúcares e confeitaria",
    18: "Cacau e preparações",
    19: "Preparações de cereais",
    20: "Preparações de hortícolas",
    21: "Preparações alimentícias",
    22: "Bebidas e vinagres",
    23: "Resíduos alimentares (ração)",
    24: "Tabaco"
}


def carregar_dados_processados():
    """Carrega os dados processados."""
    dados = {}

    arquivo_exp = os.path.join(config.PROCESSED_DIR, "exportacoes_pr_agro.parquet")
    arquivo_imp = os.path.join(config.PROCESSED_DIR, "importacoes_pr_agro.parquet")

    if os.path.exists(arquivo_exp):
        dados['exportacoes'] = pd.read_parquet(arquivo_exp)
        print(f"Exportações carregadas: {len(dados['exportacoes']):,} registros")

    if os.path.exists(arquivo_imp):
        dados['importacoes'] = pd.read_parquet(arquivo_imp)
        print(f"Importações carregadas: {len(dados['importacoes']):,} registros")

    return dados


def analise_por_categoria(df: pd.DataFrame, tipo: str) -> pd.DataFrame:
    """
    Análise agregada por categoria de produto agrícola.

    Args:
        df: DataFrame com dados
        tipo: "exportações" ou "importações"

    Returns:
        DataFrame com análise por categoria
    """
    df['CATEGORIA'] = df['CAPITULO_NCM'].map(CATEGORIAS_AGRICULTURA)

    analise = df.groupby('CATEGORIA').agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()

    analise.rename(columns={
        'VL_FOB': 'VALOR_FOB_USD',
        'KG_LIQUIDO': 'PESO_KG',
        'CO_NCM': 'QTD_PRODUTOS'
    }, inplace=True)

    analise['PARTICIPACAO_%'] = (analise['VALOR_FOB_USD'] /
                                  analise['VALOR_FOB_USD'].sum() * 100).round(2)

    analise = analise.sort_values('VALOR_FOB_USD', ascending=False)

    return analise


def analise_temporal(df: pd.DataFrame) -> pd.DataFrame:
    """Análise temporal mensal."""
    df['DATA'] = pd.to_datetime(
        df['CO_ANO'].astype(str) + '-' + df['CO_MES'].astype(str).str.zfill(2) + '-01'
    )

    analise = df.groupby(['CO_ANO', 'CO_MES']).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum'
    }).reset_index()

    analise.rename(columns={
        'VL_FOB': 'VALOR_FOB_USD',
        'KG_LIQUIDO': 'PESO_KG'
    }, inplace=True)

    return analise


def analise_por_pais(df: pd.DataFrame, top_n: int = 20) -> pd.DataFrame:
    """Análise por país de destino/origem."""
    col_pais = 'PAIS' if 'PAIS' in df.columns else 'CO_PAIS'

    analise = df.groupby(col_pais).agg({
        'VL_FOB': 'sum',
        'KG_LIQUIDO': 'sum',
        'CO_NCM': 'nunique'
    }).reset_index()

    analise.rename(columns={
        'VL_FOB': 'VALOR_FOB_USD',
        'KG_LIQUIDO': 'PESO_KG',
        'CO_NCM': 'QTD_PRODUTOS'
    }, inplace=True)

    analise['PARTICIPACAO_%'] = (analise['VALOR_FOB_USD'] /
                                  analise['VALOR_FOB_USD'].sum() * 100).round(2)

    analise = analise.sort_values('VALOR_FOB_USD', ascending=False).head(top_n)

    return analise


def gerar_balanca_comercial(dados: dict) -> pd.DataFrame:
    """Gera balança comercial agrícola do Paraná."""
    resultados = []

    if 'exportacoes' in dados:
        exp_ano = dados['exportacoes'].groupby('CO_ANO').agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()
        exp_ano.rename(columns={
            'VL_FOB': 'EXPORTACAO_USD',
            'KG_LIQUIDO': 'EXPORTACAO_KG'
        }, inplace=True)
        resultados.append(exp_ano)

    if 'importacoes' in dados:
        imp_ano = dados['importacoes'].groupby('CO_ANO').agg({
            'VL_FOB': 'sum',
            'KG_LIQUIDO': 'sum'
        }).reset_index()
        imp_ano.rename(columns={
            'VL_FOB': 'IMPORTACAO_USD',
            'KG_LIQUIDO': 'IMPORTACAO_KG'
        }, inplace=True)
        resultados.append(imp_ano)

    if len(resultados) == 2:
        balanca = resultados[0].merge(resultados[1], on='CO_ANO', how='outer')
        balanca.fillna(0, inplace=True)
        balanca['SALDO_USD'] = balanca['EXPORTACAO_USD'] - balanca['IMPORTACAO_USD']
        balanca['CORRENTE_COMERCIO_USD'] = balanca['EXPORTACAO_USD'] + balanca['IMPORTACAO_USD']
        return balanca

    return pd.DataFrame()


def executar_analises():
    """Executa todas as análises e salva relatórios."""
    print("\n" + "="*60)
    print("ANÁLISE DOS DADOS - PARANÁ AGRICULTURA")
    print("="*60 + "\n")

    dados = carregar_dados_processados()

    if not dados:
        print("Nenhum dado processado encontrado. Execute pipeline.py primeiro.")
        return

    relatorios_dir = os.path.join(config.PROCESSED_DIR, "relatorios")
    os.makedirs(relatorios_dir, exist_ok=True)

    # Análise por categoria - Exportações
    if 'exportacoes' in dados:
        print("\n--- EXPORTAÇÕES POR CATEGORIA ---")
        cat_exp = analise_por_categoria(dados['exportacoes'], 'exportações')
        print(cat_exp.to_string(index=False))
        cat_exp.to_csv(os.path.join(relatorios_dir, "exp_por_categoria.csv"), index=False)

        print("\n--- TOP 20 PAÍSES DESTINO ---")
        paises_exp = analise_por_pais(dados['exportacoes'])
        print(paises_exp.to_string(index=False))
        paises_exp.to_csv(os.path.join(relatorios_dir, "exp_por_pais.csv"), index=False)

    # Análise por categoria - Importações
    if 'importacoes' in dados:
        print("\n--- IMPORTAÇÕES POR CATEGORIA ---")
        cat_imp = analise_por_categoria(dados['importacoes'], 'importações')
        print(cat_imp.to_string(index=False))
        cat_imp.to_csv(os.path.join(relatorios_dir, "imp_por_categoria.csv"), index=False)

        print("\n--- TOP 20 PAÍSES ORIGEM ---")
        paises_imp = analise_por_pais(dados['importacoes'])
        print(paises_imp.to_string(index=False))
        paises_imp.to_csv(os.path.join(relatorios_dir, "imp_por_pais.csv"), index=False)

    # Balança comercial
    print("\n--- BALANÇA COMERCIAL AGRÍCOLA DO PARANÁ ---")
    balanca = gerar_balanca_comercial(dados)
    if not balanca.empty:
        print(balanca.to_string(index=False))
        balanca.to_csv(os.path.join(relatorios_dir, "balanca_comercial.csv"), index=False)

    print(f"\nRelatórios salvos em: {relatorios_dir}/")


if __name__ == "__main__":
    executar_analises()
