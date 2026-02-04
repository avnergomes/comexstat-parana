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

# Mapeamento SH4 para descrições de produtos (português)
SH4_DESCRICAO = {
    # Capítulo 01 - Animais vivos
    "0101": "Cavalos, asininos e muares vivos",
    "0102": "Bovinos vivos",
    "0103": "Suínos vivos",
    "0104": "Ovinos e caprinos vivos",
    "0105": "Aves domésticas vivas",

    # Capítulo 02 - Carnes
    "0201": "Carne bovina fresca ou refrigerada",
    "0202": "Carne bovina congelada",
    "0203": "Carne suína fresca, refrigerada ou congelada",
    "0204": "Carne ovina ou caprina",
    "0205": "Carne de cavalo, asinino ou muar",
    "0206": "Miudezas comestíveis",
    "0207": "Carne e miudezas de aves",
    "0208": "Outras carnes e miudezas",
    "0209": "Toucinho e gordura de porco",
    "0210": "Carnes salgadas, secas ou defumadas",

    # Capítulo 03 - Peixes e crustáceos
    "0301": "Peixes vivos",
    "0302": "Peixes frescos ou refrigerados",
    "0303": "Peixes congelados",
    "0304": "Filés de peixe e outras carnes de peixe",
    "0305": "Peixes secos, salgados ou defumados",
    "0306": "Crustáceos",
    "0307": "Moluscos",
    "0308": "Invertebrados aquáticos",

    # Capítulo 04 - Laticínios e ovos
    "0401": "Leite e creme de leite",
    "0402": "Leite concentrado ou adoçado",
    "0403": "Iogurte e leite fermentado",
    "0404": "Soro de leite",
    "0405": "Manteiga e gorduras lácteas",
    "0406": "Queijos e requeijão",
    "0407": "Ovos de aves com casca",
    "0408": "Ovos sem casca e gemas",
    "0409": "Mel natural",
    "0410": "Produtos comestíveis de origem animal",

    # Capítulo 06 - Plantas vivas
    "0601": "Bulbos, tubérculos e rizomas",
    "0602": "Plantas vivas e mudas",
    "0603": "Flores e botões de flores cortados",
    "0604": "Folhagem e ramos para ornamentação",

    # Capítulo 07 - Hortícolas
    "0701": "Batatas frescas ou refrigeradas",
    "0702": "Tomates frescos ou refrigerados",
    "0703": "Cebolas, alhos e alhos-porros",
    "0704": "Couves, couve-flor e repolhos",
    "0705": "Alfaces e chicórias",
    "0706": "Cenouras, nabos e raízes comestíveis",
    "0707": "Pepinos e pepininhos",
    "0708": "Leguminosas (ervilhas e feijões)",
    "0709": "Outros produtos hortícolas frescos",
    "0710": "Produtos hortícolas congelados",
    "0711": "Produtos hortícolas conservados",
    "0712": "Produtos hortícolas secos",
    "0713": "Legumes de vagem secos",
    "0714": "Mandioca e raízes amiláceas",

    # Capítulo 08 - Frutas
    "0801": "Cocos, castanhas e nozes",
    "0802": "Outras frutas de casca rija",
    "0803": "Bananas frescas ou secas",
    "0804": "Tâmaras, figos, abacates e mangas",
    "0805": "Frutas cítricas (laranjas, limões)",
    "0806": "Uvas frescas ou secas",
    "0807": "Melões e melancias",
    "0808": "Maçãs, peras e marmelos",
    "0809": "Damascos, cerejas e pêssegos",
    "0810": "Outras frutas frescas",
    "0811": "Frutas congeladas",
    "0812": "Frutas conservadas provisoriamente",
    "0813": "Frutas secas",
    "0814": "Cascas de frutas cítricas",

    # Capítulo 09 - Café, chá e especiarias
    "0901": "Café (grão ou torrado)",
    "0902": "Chá",
    "0903": "Mate (erva-mate)",
    "0904": "Pimenta e pimentão",
    "0905": "Baunilha",
    "0906": "Canela",
    "0907": "Cravo-da-índia",
    "0908": "Noz-moscada e cardamomo",
    "0909": "Sementes de anis, cominho e funcho",
    "0910": "Gengibre e outras especiarias",

    # Capítulo 10 - Cereais
    "1001": "Trigo e mistura de trigo com centeio",
    "1002": "Centeio",
    "1003": "Cevada",
    "1004": "Aveia",
    "1005": "Milho",
    "1006": "Arroz",
    "1007": "Sorgo de grão",
    "1008": "Trigo mourisco e outros cereais",

    # Capítulo 11 - Produtos de moagem
    "1101": "Farinhas de trigo",
    "1102": "Farinhas de outros cereais",
    "1103": "Grumos, sêmolas e pellets de cereais",
    "1104": "Grãos de cereais trabalhados",
    "1105": "Farinha e flocos de batata",
    "1106": "Farinhas de leguminosas",
    "1107": "Malte",
    "1108": "Amidos e féculas",
    "1109": "Glúten de trigo",

    # Capítulo 12 - Sementes e oleaginosas
    "1201": "Soja em grãos",
    "1202": "Amendoim",
    "1203": "Copra",
    "1204": "Sementes de linhaça",
    "1205": "Sementes de colza ou canola",
    "1206": "Sementes de girassol",
    "1207": "Outras sementes oleaginosas",
    "1208": "Farinhas de sementes oleaginosas",
    "1209": "Sementes para semeadura",
    "1210": "Cones de lúpulo",
    "1211": "Plantas aromáticas e medicinais",
    "1212": "Alfarroba e algas",
    "1213": "Palhas e cascas de cereais",
    "1214": "Nabo forrageiro e feno",

    # Capítulo 13 - Gomas e resinas
    "1301": "Goma-laca e resinas naturais",
    "1302": "Sucos e extratos vegetais",

    # Capítulo 14 - Matérias para entrançar
    "1401": "Matérias vegetais para entrançar",
    "1404": "Produtos vegetais diversos",

    # Capítulo 15 - Gorduras e óleos
    "1501": "Gordura de porco e de aves",
    "1502": "Gorduras de bovinos, ovinos ou caprinos",
    "1503": "Estearina e óleo de banha",
    "1504": "Gorduras e óleos de peixes",
    "1505": "Suarda e gorduras derivadas",
    "1506": "Outras gorduras animais",
    "1507": "Óleo de soja",
    "1508": "Óleo de amendoim",
    "1509": "Azeite de oliva",
    "1510": "Outros óleos de oliva",
    "1511": "Óleo de dendê (palma)",
    "1512": "Óleos de girassol, cártamo ou algodão",
    "1513": "Óleos de coco ou palmiste",
    "1514": "Óleos de colza, mostarda ou canola",
    "1515": "Outras gorduras e óleos vegetais",
    "1516": "Gorduras e óleos hidrogenados",
    "1517": "Margarina e misturas",
    "1518": "Gorduras e óleos modificados",
    "1520": "Glicerol em bruto",
    "1521": "Ceras vegetais e de abelhas",
    "1522": "Dégras e resíduos de gorduras",

    # Capítulo 16 - Preparações de carnes
    "1601": "Enchidos e produtos semelhantes de carne",
    "1602": "Outras preparações de carne",
    "1603": "Extratos e sucos de carne",
    "1604": "Preparações de peixes",
    "1605": "Preparações de crustáceos e moluscos",

    # Capítulo 17 - Açúcares
    "1701": "Açúcar de cana ou beterraba",
    "1702": "Outros açúcares (lactose, glicose)",
    "1703": "Melaços",
    "1704": "Produtos de confeitaria sem cacau",

    # Capítulo 18 - Cacau e preparações
    "1801": "Cacau em grãos",
    "1802": "Cascas e resíduos de cacau",
    "1803": "Pasta de cacau",
    "1804": "Manteiga e gordura de cacau",
    "1805": "Cacau em pó sem açúcar",
    "1806": "Chocolate e preparações com cacau",

    # Capítulo 19 - Preparações de cereais
    "1901": "Extratos de malte e preparações lácteas",
    "1902": "Massas alimentícias",
    "1903": "Tapioca e seus sucedâneos",
    "1904": "Cereais expandidos ou em flocos",
    "1905": "Pães, bolachas e produtos de padaria",

    # Capítulo 20 - Preparações de hortícolas e frutas
    "2001": "Hortícolas e frutas em vinagre",
    "2002": "Tomates preparados ou conservados",
    "2003": "Cogumelos e trufas preparados",
    "2004": "Outros hortícolas congelados",
    "2005": "Outros hortícolas preparados",
    "2006": "Hortícolas e frutas cristalizados",
    "2007": "Doces, geleias e purês de frutas",
    "2008": "Frutas e partes de plantas preparadas",
    "2009": "Sucos de frutas ou hortícolas",

    # Capítulo 21 - Preparações alimentícias diversas
    "2101": "Extratos de café, chá e mate",
    "2102": "Leveduras e fermentos",
    "2103": "Molhos e condimentos",
    "2104": "Preparações para sopas",
    "2105": "Sorvetes",
    "2106": "Outras preparações alimentícias",

    # Capítulo 22 - Bebidas
    "2201": "Águas (mineral e gaseificada)",
    "2202": "Águas e bebidas não alcoólicas",
    "2203": "Cervejas de malte",
    "2204": "Vinhos de uvas frescas",
    "2205": "Vermutes e vinhos aromatizados",
    "2206": "Outras bebidas fermentadas",
    "2207": "Álcool etílico não desnaturado",
    "2208": "Álcool etílico e aguardentes",
    "2209": "Vinagres",

    # Capítulo 23 - Resíduos alimentares
    "2301": "Farinhas de carnes e peixes",
    "2302": "Farelos e resíduos de cereais",
    "2303": "Resíduos de amido e açúcar",
    "2304": "Farelo e torta de soja",
    "2305": "Farelo e torta de amendoim",
    "2306": "Farelos de outras oleaginosas",
    "2307": "Borras de vinho e tártaro",
    "2308": "Matérias vegetais para ração",
    "2309": "Preparações para alimentação animal",

    # Capítulo 24 - Tabaco
    "2401": "Tabaco não manufaturado",
    "2402": "Charutos e cigarros",
    "2403": "Outros produtos de tabaco",
}


def get_descricao_sh4(sh4_code):
    """
    Retorna a descrição do produto pelo código SH4.

    Args:
        sh4_code: Código SH4 (string de 4 dígitos)

    Returns:
        str: Descrição do produto ou o próprio código se não encontrado
    """
    sh4_str = str(sh4_code).zfill(4)
    return SH4_DESCRICAO.get(sh4_str, f"Produto {sh4_str}")
