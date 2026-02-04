# -*- coding: utf-8 -*-
"""
Mapeamento de produtos NCM para Cadeias produtivas (estilo VBP)
"""

# Cadeias principais (baseadas no VBP)
CADEIAS = {
    "sojicultura": "Sojicultura",
    "avicultura": "Avicultura",
    "bovinocultura": "Bovinocultura",
    "suinocultura": "Suinocultura",
    "cafeicultura": "Cafeicultura",
    "cerealicultura": "Cerealicultura",
    "canavicultura": "Canavicultura",
    "fruticultura": "Fruticultura",
    "olericultura": "Olericultura",
    "aquicultura": "Aquicultura",
    "florestal": "Florestal",
    "floricultura": "Floricultura",
    "apicultura": "Apicultura",
    "laticinios": "Laticínios",
    "oleaginosas": "Oleaginosas",
    "agroind_carnes": "Agroind. Carnes",
    "agroind_graos": "Agroind. Grãos",
    "bebidas": "Bebidas",
    "tabaco": "Tabaco",
    "outros": "Outros",
}

# Mapeamento por capítulo NCM (default)
CAPITULO_TO_CADEIA = {
    1: "outros",        # Animais vivos - será refinado por descrição
    2: "outros",        # Carnes - será refinado por descrição
    3: "aquicultura",   # Peixes e crustáceos
    4: "laticinios",    # Laticínios e ovos
    5: "outros",        # Outros prod. animais
    6: "floricultura",  # Plantas e floricultura
    7: "olericultura",  # Hortícolas e raízes
    8: "fruticultura",  # Frutas
    9: "cafeicultura",  # Café, chá e especiarias
    10: "cerealicultura", # Cereais
    11: "agroind_graos",  # Produtos de moagem
    12: "sojicultura",    # Sementes oleaginosas
    13: "florestal",      # Gomas e resinas
    14: "florestal",      # Mat. para entrançar
    15: "oleaginosas",    # Gorduras e óleos
    16: "agroind_carnes", # Prep. carne/peixe
    17: "canavicultura",  # Açúcares
    18: "agroind_graos",  # Cacau e preparações
    19: "agroind_graos",  # Prep. de cereais
    20: "fruticultura",   # Prep. de hortícolas
    21: "agroind_graos",  # Prep. alimentícias
    22: "bebidas",        # Bebidas e vinagres
    23: "sojicultura",    # Resíduos alimentares (farelo)
    24: "tabaco",         # Tabaco
}

# Palavras-chave para refinamento por descrição
KEYWORDS_CADEIA = {
    # Avicultura
    "avicultura": [
        "galo", "galinha", "frango", "peru", "pato", "ganso", "aves",
        "pintinho", "pintainho", "ovos de aves", "domesticus",
    ],
    # Bovinocultura
    "bovinocultura": [
        "bovino", "boi", "vaca", "búfalo", "vitela", "novilho",
        "leite de vaca", "sebo bovino", "couro bovino",
    ],
    # Suinocultura
    "suinocultura": [
        "suíno", "porco", "leitão", "presunto", "bacon", "toucinho",
    ],
    # Sojicultura
    "sojicultura": [
        "soja", "bagaço de soja", "farelo de soja", "óleo de soja",
    ],
    # Cerealicultura
    "cerealicultura": [
        "milho", "trigo", "arroz", "cevada", "aveia", "sorgo", "centeio",
        "cereal", "farinha de trigo", "farinha de milho",
    ],
    # Cafeicultura
    "cafeicultura": [
        "café", "coffee",
    ],
    # Canavicultura
    "canavicultura": [
        "açúcar", "cana", "sacarose", "melaço", "etanol", "álcool etílico",
    ],
    # Fruticultura
    "fruticultura": [
        "laranja", "limão", "lima", "tangerina", "pomelo", "uva",
        "maçã", "pera", "pêssego", "ameixa", "damasco", "cereja",
        "banana", "manga", "abacate", "mamão", "melão", "melancia",
        "morango", "framboesa", "amora", "mirtilo", "kiwi",
        "abacaxi", "coco", "castanha", "noz", "amêndoa",
        "suco de laranja", "suco de uva", "vinho",
    ],
    # Olericultura
    "olericultura": [
        "batata", "tomate", "cebola", "alho", "cenoura", "beterraba",
        "repolho", "couve", "alface", "espinafre", "brócolis",
        "pepino", "abobrinha", "abóbora", "berinjela", "pimentão",
        "feijão", "ervilha", "lentilha", "grão-de-bico", "fava",
        "mandioca", "inhame", "azeitona",
    ],
    # Aquicultura
    "aquicultura": [
        "peixe", "tilápia", "salmão", "atum", "sardinha", "bacalhau",
        "camarão", "lagosta", "caranguejo", "lula", "polvo",
        "molusco", "crustáceo", "pescado",
    ],
    # Florestal
    "florestal": [
        "madeira", "celulose", "papel", "resina", "goma",
        "bambu", "vime", "palha",
    ],
    # Apicultura
    "apicultura": [
        "mel", "própolis", "cera de abelha", "geleia real",
    ],
    # Oleaginosas (não-soja)
    "oleaginosas": [
        "óleo de palma", "óleo de palmiste", "óleo de girassol",
        "óleo de milho", "óleo de canola", "óleo de amendoim",
        "azeite de oliva", "óleo de coco", "margarina",
        "gordura vegetal", "gordura animal",
    ],
}

# Mapeamento específico por código NCM (8 dígitos) - casos especiais
NCM_ESPECIFICO = {
    # Soja
    "12019000": "sojicultura",  # Soja, mesmo triturada
    "23040090": "sojicultura",  # Bagaço e resíduos de soja
    "23040010": "sojicultura",  # Farinha de soja
    "15071000": "sojicultura",  # Óleo de soja bruto
    "15079011": "sojicultura",  # Óleo de soja refinado
    "15079019": "sojicultura",  # Óleo de soja refinado

    # Avicultura
    "02071400": "avicultura",  # Pedaços de frango congelados
    "02071200": "avicultura",  # Frango inteiro congelado
    "02071220": "avicultura",  # Frango congelado sem miudezas
    "02071422": "avicultura",  # Peito de frango
    "02071423": "avicultura",  # Coxa de frango
    "02071413": "avicultura",  # Asas de frango
    "02071421": "avicultura",  # Peito/coxa desossados
    "02071424": "avicultura",  # Carne mec. separada
    "02071412": "avicultura",  # Coxa com sobrecoxa
    "02109911": "avicultura",  # Carnes de galos e galinhas
    "02071434": "avicultura",  # Pés de galinha
    "02072700": "avicultura",  # Peru em pedaços
    "04071100": "avicultura",  # Ovos férteis de galinha
    "01051190": "avicultura",  # Pintos vivos

    # Suinocultura
    "02032900": "suinocultura",  # Carnes de suíno congeladas
    "02032200": "suinocultura",  # Pernas de suíno
    "02064900": "suinocultura",  # Miudezas de suíno

    # Bovinocultura
    "02023000": "bovinocultura",  # Carne bovina desossada congelada
    "02013000": "bovinocultura",  # Carne bovina desossada fresca
    "02062990": "bovinocultura",  # Miudezas de bovino
    "01022990": "bovinocultura",  # Bovinos vivos
    "04051000": "laticinios",     # Manteiga
    "15021012": "bovinocultura",  # Sebo bovino

    # Açúcar/Cana
    "17011400": "canavicultura",  # Açúcar de cana
    "17019900": "canavicultura",  # Outros açúcares
    "22071090": "canavicultura",  # Álcool etílico
    "22071010": "canavicultura",  # Álcool etílico 80%

    # Café
    "09011110": "cafeicultura",  # Café em grão
    "21011110": "cafeicultura",  # Café solúvel
    "21011190": "cafeicultura",  # Extratos de café
    "21011200": "cafeicultura",  # Preparações de café

    # Milho
    "10059010": "cerealicultura",  # Milho em grão
    "10051000": "cerealicultura",  # Milho para semeadura
    "11022000": "cerealicultura",  # Farinha de milho
    "11081200": "cerealicultura",  # Amido de milho
    "11031300": "cerealicultura",  # Grumos de milho

    # Trigo
    "10019900": "cerealicultura",  # Trigo
    "11010010": "cerealicultura",  # Farinha de trigo

    # Mate/Erva-mate
    "09030090": "florestal",  # Mate
    "09030010": "florestal",  # Mate cancheado

    # Frutas processadas
    "20091900": "fruticultura",  # Suco de laranja
    "20091100": "fruticultura",  # Suco de laranja congelado
}


def classificar_cadeia(ncm, descricao, capitulo):
    """
    Classifica um produto NCM em uma cadeia produtiva.

    Args:
        ncm: Código NCM (8 dígitos)
        descricao: Descrição do produto
        capitulo: Capítulo NCM (1-24)

    Returns:
        tuple: (codigo_cadeia, nome_cadeia)
    """
    ncm_str = str(ncm).zfill(8)
    descricao_lower = descricao.lower() if descricao else ""

    # 1. Verificar mapeamento específico por NCM
    if ncm_str in NCM_ESPECIFICO:
        cadeia_key = NCM_ESPECIFICO[ncm_str]
        return cadeia_key, CADEIAS[cadeia_key]

    # 2. Verificar por palavras-chave na descrição
    for cadeia_key, keywords in KEYWORDS_CADEIA.items():
        for keyword in keywords:
            if keyword.lower() in descricao_lower:
                return cadeia_key, CADEIAS[cadeia_key]

    # 3. Usar mapeamento por capítulo como fallback
    cadeia_key = CAPITULO_TO_CADEIA.get(capitulo, "outros")
    return cadeia_key, CADEIAS[cadeia_key]


def get_all_cadeias():
    """Retorna lista de todas as cadeias disponíveis."""
    return list(CADEIAS.values())


# Mapeamento SH4 para cadeias (baseado nos 4 primeiros dígitos do NCM)
# SH4 permite classificar produtos sem precisar da descrição
SH4_TO_CADEIA = {
    # Capítulo 01 - Animais vivos
    "0101": "outros",           # Cavalos
    "0102": "bovinocultura",    # Bovinos
    "0103": "suinocultura",     # Suínos
    "0104": "outros",           # Ovinos/caprinos
    "0105": "avicultura",       # Aves domésticas

    # Capítulo 02 - Carnes
    "0201": "bovinocultura",    # Carne bovina fresca
    "0202": "bovinocultura",    # Carne bovina congelada
    "0203": "suinocultura",     # Carne suína
    "0204": "outros",           # Carne ovina/caprina
    "0205": "outros",           # Carne equina
    "0206": "agroind_carnes",   # Miudezas
    "0207": "avicultura",       # Carne de aves
    "0208": "outros",           # Outras carnes
    "0209": "suinocultura",     # Toucinho/gordura suína
    "0210": "agroind_carnes",   # Carnes salgadas/defumadas

    # Capítulo 03 - Peixes/Crustáceos
    "0301": "aquicultura",
    "0302": "aquicultura",
    "0303": "aquicultura",
    "0304": "aquicultura",
    "0305": "aquicultura",
    "0306": "aquicultura",
    "0307": "aquicultura",
    "0308": "aquicultura",

    # Capítulo 04 - Laticínios
    "0401": "laticinios",
    "0402": "laticinios",
    "0403": "laticinios",
    "0404": "laticinios",
    "0405": "laticinios",
    "0406": "laticinios",
    "0407": "avicultura",       # Ovos
    "0408": "avicultura",       # Ovos sem casca
    "0409": "apicultura",       # Mel
    "0410": "outros",

    # Capítulo 05 - Outros produtos animais
    "0501": "outros",
    "0502": "outros",
    "0503": "outros",
    "0504": "outros",
    "0505": "outros",
    "0506": "outros",
    "0507": "outros",
    "0508": "outros",
    "0509": "outros",
    "0510": "outros",
    "0511": "outros",

    # Capítulo 06 - Plantas vivas/Floricultura
    "0601": "floricultura",
    "0602": "floricultura",
    "0603": "floricultura",
    "0604": "floricultura",

    # Capítulo 07 - Hortícolas
    "0701": "olericultura",     # Batata
    "0702": "olericultura",     # Tomate
    "0703": "olericultura",     # Cebola/alho
    "0704": "olericultura",     # Couve/repolho
    "0705": "olericultura",     # Alface
    "0706": "olericultura",     # Cenoura
    "0707": "olericultura",     # Pepino
    "0708": "olericultura",     # Leguminosas (ervilha, feijão)
    "0709": "olericultura",     # Outros hortícolas
    "0710": "olericultura",     # Congelados
    "0711": "olericultura",     # Conservados
    "0712": "olericultura",     # Secos
    "0713": "olericultura",     # Legumes secos
    "0714": "olericultura",     # Mandioca

    # Capítulo 08 - Frutas
    "0801": "fruticultura",     # Coco
    "0802": "fruticultura",     # Nozes
    "0803": "fruticultura",     # Banana
    "0804": "fruticultura",     # Tâmara/abacate/manga
    "0805": "fruticultura",     # Citros
    "0806": "fruticultura",     # Uva
    "0807": "fruticultura",     # Melão
    "0808": "fruticultura",     # Maçã/pera
    "0809": "fruticultura",     # Damasco/cereja
    "0810": "fruticultura",     # Outras frutas
    "0811": "fruticultura",     # Congeladas
    "0812": "fruticultura",     # Conservadas
    "0813": "fruticultura",     # Secas
    "0814": "fruticultura",     # Cascas

    # Capítulo 09 - Café/Chá/Especiarias
    "0901": "cafeicultura",     # Café
    "0902": "outros",           # Chá
    "0903": "florestal",        # Mate
    "0904": "outros",           # Pimenta
    "0905": "outros",           # Baunilha
    "0906": "outros",           # Canela
    "0907": "outros",           # Cravo
    "0908": "outros",           # Noz-moscada
    "0909": "outros",           # Anis/cominho
    "0910": "outros",           # Gengibre

    # Capítulo 10 - Cereais
    "1001": "cerealicultura",   # Trigo
    "1002": "cerealicultura",   # Centeio
    "1003": "cerealicultura",   # Cevada
    "1004": "cerealicultura",   # Aveia
    "1005": "cerealicultura",   # Milho
    "1006": "cerealicultura",   # Arroz
    "1007": "cerealicultura",   # Sorgo
    "1008": "cerealicultura",   # Outros cereais

    # Capítulo 11 - Produtos de moagem
    "1101": "agroind_graos",    # Farinha de trigo
    "1102": "agroind_graos",    # Outras farinhas
    "1103": "agroind_graos",    # Grumos
    "1104": "agroind_graos",    # Grãos trabalhados
    "1105": "agroind_graos",    # Farinha de batata
    "1106": "agroind_graos",    # Farinha de legumes
    "1107": "agroind_graos",    # Malte
    "1108": "agroind_graos",    # Amidos
    "1109": "agroind_graos",    # Glúten

    # Capítulo 12 - Sementes oleaginosas
    "1201": "sojicultura",      # SOJA
    "1202": "oleaginosas",      # Amendoim
    "1203": "oleaginosas",      # Copra
    "1204": "oleaginosas",      # Linhaça
    "1205": "oleaginosas",      # Colza/canola
    "1206": "oleaginosas",      # Girassol
    "1207": "oleaginosas",      # Outras oleaginosas
    "1208": "oleaginosas",      # Farinhas de oleaginosas
    "1209": "outros",           # Sementes para semeadura
    "1210": "outros",           # Lúpulo
    "1211": "outros",           # Plantas aromáticas
    "1212": "outros",           # Algas
    "1213": "outros",           # Palha
    "1214": "outros",           # Forragens

    # Capítulo 13 - Gomas e resinas
    "1301": "florestal",
    "1302": "florestal",

    # Capítulo 14 - Matérias para entrançar
    "1401": "florestal",
    "1402": "florestal",
    "1403": "florestal",
    "1404": "florestal",

    # Capítulo 15 - Gorduras e óleos
    "1501": "oleaginosas",      # Gordura suína
    "1502": "bovinocultura",    # Sebo bovino
    "1503": "oleaginosas",      # Estearina
    "1504": "aquicultura",      # Óleo de peixe
    "1505": "outros",           # Lanolina
    "1506": "outros",           # Outras gorduras animais
    "1507": "sojicultura",      # ÓLEO DE SOJA
    "1508": "oleaginosas",      # Óleo de amendoim
    "1509": "oleaginosas",      # Azeite de oliva
    "1510": "oleaginosas",      # Outros óleos de oliva
    "1511": "oleaginosas",      # Óleo de palma
    "1512": "oleaginosas",      # Óleo de girassol
    "1513": "oleaginosas",      # Óleo de coco
    "1514": "oleaginosas",      # Óleo de colza
    "1515": "oleaginosas",      # Outras gorduras vegetais
    "1516": "oleaginosas",      # Gorduras hidrogenadas
    "1517": "oleaginosas",      # Margarina
    "1518": "oleaginosas",      # Gorduras preparadas
    "1519": "outros",           # Ácidos graxos
    "1520": "outros",           # Glicerol
    "1521": "outros",           # Ceras vegetais
    "1522": "outros",           # Dégras

    # Capítulo 16 - Preparações de carne/peixe
    "1601": "agroind_carnes",   # Embutidos
    "1602": "agroind_carnes",   # Preparações de carne
    "1603": "agroind_carnes",   # Extratos
    "1604": "aquicultura",      # Preparações de peixe
    "1605": "aquicultura",      # Crustáceos preparados

    # Capítulo 17 - Açúcares
    "1701": "canavicultura",    # AÇÚCAR
    "1702": "canavicultura",    # Outros açúcares
    "1703": "canavicultura",    # Melaço
    "1704": "agroind_graos",    # Confeitaria

    # Capítulo 18 - Cacau
    "1801": "agroind_graos",
    "1802": "agroind_graos",
    "1803": "agroind_graos",
    "1804": "agroind_graos",
    "1805": "agroind_graos",
    "1806": "agroind_graos",

    # Capítulo 19 - Preparações de cereais
    "1901": "agroind_graos",
    "1902": "agroind_graos",    # Massas
    "1903": "agroind_graos",    # Tapioca
    "1904": "agroind_graos",    # Cereais expandidos
    "1905": "agroind_graos",    # Pães e biscoitos

    # Capítulo 20 - Preparações de hortícolas/frutas
    "2001": "fruticultura",     # Conservas vinagre
    "2002": "olericultura",     # Tomates preparados
    "2003": "olericultura",     # Cogumelos
    "2004": "olericultura",     # Hortícolas congelados
    "2005": "olericultura",     # Hortícolas conservados
    "2006": "fruticultura",     # Frutas cristalizadas
    "2007": "fruticultura",     # Geleias/compotas
    "2008": "fruticultura",     # Frutas preparadas
    "2009": "fruticultura",     # Sucos de frutas

    # Capítulo 21 - Preparações alimentícias diversas
    "2101": "cafeicultura",     # Extratos de café
    "2102": "bebidas",          # Leveduras
    "2103": "agroind_graos",    # Molhos
    "2104": "agroind_graos",    # Sopas
    "2105": "laticinios",       # Sorvetes
    "2106": "agroind_graos",    # Outras preparações

    # Capítulo 22 - Bebidas
    "2201": "bebidas",          # Água
    "2202": "bebidas",          # Refrigerantes
    "2203": "bebidas",          # Cerveja
    "2204": "bebidas",          # Vinho
    "2205": "bebidas",          # Vermute
    "2206": "bebidas",          # Sidra
    "2207": "canavicultura",    # ÁLCOOL ETÍLICO
    "2208": "bebidas",          # Destilados
    "2209": "bebidas",          # Vinagre

    # Capítulo 23 - Resíduos alimentares/Rações
    "2301": "aquicultura",      # Farinhas de peixe
    "2302": "agroind_graos",    # Farelos de cereais
    "2303": "agroind_graos",    # Resíduos de amido
    "2304": "sojicultura",      # FARELO DE SOJA
    "2305": "oleaginosas",      # Farelo de amendoim
    "2306": "oleaginosas",      # Farelos de outras oleaginosas
    "2307": "bebidas",          # Borras de vinho
    "2308": "outros",           # Mat. vegetais para ração
    "2309": "agroind_graos",    # Preparações para animais

    # Capítulo 24 - Tabaco
    "2401": "tabaco",
    "2402": "tabaco",
    "2403": "tabaco",
}


def classificar_cadeia_sh4(sh4_code):
    """
    Classifica cadeia produtiva usando código SH4 (4 dígitos).

    Args:
        sh4_code: Código SH4 (string de 4 dígitos)

    Returns:
        tuple: (codigo_cadeia, nome_cadeia)
    """
    sh4_str = str(sh4_code).zfill(4)

    # Verificar mapeamento direto
    if sh4_str in SH4_TO_CADEIA:
        cadeia_key = SH4_TO_CADEIA[sh4_str]
        return cadeia_key, CADEIAS[cadeia_key]

    # Fallback: usar capítulo (2 primeiros dígitos)
    try:
        capitulo = int(sh4_str[:2])
        cadeia_key = CAPITULO_TO_CADEIA.get(capitulo, "outros")
        return cadeia_key, CADEIAS[cadeia_key]
    except:
        return "outros", CADEIAS["outros"]


# Cores para cadeias (seguindo padrão rainbow do VBP)
CADEIA_CORES = {
    "Sojicultura": "#22c55e",      # Green
    "Avicultura": "#0ea5e9",        # Sky blue
    "Bovinocultura": "#f59e0b",     # Amber
    "Suinocultura": "#ef4444",      # Red
    "Cafeicultura": "#78350f",      # Brown
    "Cerealicultura": "#eab308",    # Yellow
    "Canavicultura": "#84cc16",     # Lime
    "Fruticultura": "#f97316",      # Orange
    "Olericultura": "#14b8a6",      # Teal
    "Aquicultura": "#06b6d4",       # Cyan
    "Florestal": "#15803d",         # Dark green
    "Floricultura": "#ec4899",      # Pink
    "Apicultura": "#fbbf24",        # Amber light
    "Laticínios": "#e0f2fe",        # Light blue
    "Oleaginosas": "#fcd34d",       # Yellow light
    "Agroind. Carnes": "#dc2626",   # Red dark
    "Agroind. Grãos": "#ca8a04",    # Yellow dark
    "Bebidas": "#8b5cf6",           # Purple
    "Tabaco": "#78716c",            # Gray
    "Outros": "#64748b",            # Slate
}
