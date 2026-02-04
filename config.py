"""
Configurações da Pipeline ComexStat - Paraná Agricultura
"""

# URLs base para download dos dados
BASE_URL_COMEXSTAT = "https://balanca.economia.gov.br/balanca/bd/comexstat-bd/ncm"
BASE_URL_MUNICIPIOS = "https://balanca.economia.gov.br/balanca/bd/comexstat-bd/mun"
URL_TABELAS_AUXILIARES = "https://balanca.economia.gov.br/balanca/bd/tabelas/TABELAS_AUXILIARES.xlsx"

# Diretórios
DATA_DIR = "data"
RAW_DIR = f"{DATA_DIR}/raw"
PROCESSED_DIR = f"{DATA_DIR}/processed"
AUXILIARY_DIR = f"{DATA_DIR}/auxiliary"

# Filtros para Paraná
UF_PARANA = "PR"

# Capítulos NCM relacionados à agricultura (01-24)
# Capítulo 01: Animais vivos
# Capítulo 02: Carnes e miudezas comestíveis
# Capítulo 03: Peixes, crustáceos, moluscos
# Capítulo 04: Leite e laticínios, ovos, mel
# Capítulo 05: Outros produtos de origem animal
# Capítulo 06: Plantas vivas e produtos de floricultura
# Capítulo 07: Produtos hortícolas, plantas, raízes
# Capítulo 08: Frutas, cascas de cítricos e melões
# Capítulo 09: Café, chá, mate e especiarias
# Capítulo 10: Cereais
# Capítulo 11: Produtos da indústria de moagem
# Capítulo 12: Sementes e frutos oleaginosos (SOJA)
# Capítulo 13: Gomas, resinas e outros sucos
# Capítulo 14: Matérias para entrançar
# Capítulo 15: Gorduras e óleos animais ou vegetais
# Capítulo 16: Preparações de carne, peixes
# Capítulo 17: Açúcares e produtos de confeitaria
# Capítulo 18: Cacau e suas preparações
# Capítulo 19: Preparações à base de cereais
# Capítulo 20: Preparações de produtos hortícolas
# Capítulo 21: Preparações alimentícias diversas
# Capítulo 22: Bebidas, líquidos alcoólicos e vinagres
# Capítulo 23: Resíduos da indústria alimentar (ração)
# Capítulo 24: Tabaco e seus sucedâneos
CAPITULOS_AGRICULTURA = list(range(1, 25))

# Anos para download (ajuste conforme necessário)
ANO_INICIO = 2020
ANO_FIM = 2025

# Colunas dos arquivos de exportação
COLUNAS_EXPORTACAO = [
    "CO_ANO",      # Ano
    "CO_MES",      # Mês
    "CO_NCM",      # Código NCM (8 dígitos)
    "CO_UNID",     # Unidade estatística
    "CO_PAIS",     # Código do país de destino
    "SG_UF_NCM",   # Sigla da UF do exportador
    "CO_VIA",      # Via de transporte
    "CO_URF",      # Unidade da Receita Federal
    "QT_ESTAT",    # Quantidade estatística
    "KG_LIQUIDO",  # Peso líquido (kg)
    "VL_FOB"       # Valor FOB (US$)
]

# Colunas dos arquivos de importação
COLUNAS_IMPORTACAO = [
    "CO_ANO",
    "CO_MES",
    "CO_NCM",
    "CO_UNID",
    "CO_PAIS",
    "SG_UF_NCM",
    "CO_VIA",
    "CO_URF",
    "QT_ESTAT",
    "KG_LIQUIDO",
    "VL_FOB",
    "VL_FRETE",    # Valor do frete (US$)
    "VL_SEGURO"   # Valor do seguro (US$)
]
