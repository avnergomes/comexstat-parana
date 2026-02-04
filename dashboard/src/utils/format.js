/**
 * Utilitarios de formatacao para o dashboard ComexStat
 */

/**
 * Formata valor como moeda USD
 */
export function formatCurrency(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const absValue = Math.abs(value);
  let formatted;

  if (absValue >= 1e12) {
    formatted = (value / 1e12).toFixed(decimals) + ' tri';
  } else if (absValue >= 1e9) {
    formatted = (value / 1e9).toFixed(decimals) + ' bi';
  } else if (absValue >= 1e6) {
    formatted = (value / 1e6).toFixed(decimals) + ' mi';
  } else if (absValue >= 1e3) {
    formatted = (value / 1e3).toFixed(decimals) + ' mil';
  } else {
    formatted = value.toFixed(decimals);
  }

  return 'US$ ' + formatted;
}

/**
 * Formata valor como moeda USD completo
 */
export function formatCurrencyFull(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formata numero com separadores
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formata numero grande (milhoes, bilhoes, etc)
 */
export function formatLargeNumber(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const absValue = Math.abs(value);

  if (absValue >= 1e12) {
    return (value / 1e12).toFixed(decimals) + ' tri';
  } else if (absValue >= 1e9) {
    return (value / 1e9).toFixed(decimals) + ' bi';
  } else if (absValue >= 1e6) {
    return (value / 1e6).toFixed(decimals) + ' mi';
  } else if (absValue >= 1e3) {
    return (value / 1e3).toFixed(decimals) + ' mil';
  }

  return value.toFixed(decimals);
}

/**
 * Formata peso em toneladas
 */
export function formatWeight(kg, decimals = 1) {
  if (kg === null || kg === undefined || isNaN(kg)) return '-';

  const tons = kg / 1000;

  if (tons >= 1e9) {
    return (tons / 1e9).toFixed(decimals) + ' Gt';
  } else if (tons >= 1e6) {
    return (tons / 1e6).toFixed(decimals) + ' Mt';
  } else if (tons >= 1e3) {
    return (tons / 1e3).toFixed(decimals) + ' kt';
  }

  return tons.toFixed(decimals) + ' t';
}

/**
 * Formata percentual
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}

/**
 * Formata periodo (YYYY-MM) para exibicao
 */
export function formatPeriod(periodo) {
  if (!periodo) return '-';

  const [year, month] = periodo.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return `${months[parseInt(month) - 1]}/${year.slice(2)}`;
}

/**
 * Formata periodo completo
 */
export function formatPeriodFull(periodo) {
  if (!periodo) return '-';

  const [year, month] = periodo.split('-');
  const months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return `${months[parseInt(month) - 1]} de ${year}`;
}

/**
 * Retorna cor baseada na variacao
 */
export function getVariationColor(value) {
  if (value > 0) return 'text-primary-600';
  if (value < 0) return 'text-red-600';
  return 'text-dark-500';
}

/**
 * Retorna classe de badge baseada na variacao
 */
export function getVariationBadge(value) {
  if (value > 0) return 'badge-green';
  if (value < 0) return 'badge-red';
  return 'badge-yellow';
}

/**
 * Gera cor baseada em string (hash)
 */
export function stringToColor(str) {
  if (!str) return '#64748b';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#22c55e', '#16a34a', '#15803d', // Greens
    '#eab308', '#ca8a04', '#a16207', // Yellows
    '#3b82f6', '#2563eb', '#1d4ed8', // Blues
    '#f59e0b', '#d97706', '#b45309', // Oranges
    '#8b5cf6', '#7c3aed', '#6d28d9', // Purples
    '#ec4899', '#db2777', '#be185d', // Pinks
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Cores para graficos (padrao VBP)
 */
export const CHART_COLORS = {
  primary: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'],
  secondary: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  accent: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  rainbow: [
    '#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#06b6d4', '#a855f7', '#10b981', '#eab308', '#64748b'
  ],
};

/**
 * Gradientes para mapas (padrao VBP)
 */
export const MAP_GRADIENTS = {
  green: ['#dcfce7', '#86efac', '#22c55e', '#15803d', '#14532d'],
  blue: ['#e0f2fe', '#7dd3fc', '#0ea5e9', '#0369a1', '#0c4a6e'],
  yellow: ['#fef3c7', '#fcd34d', '#f59e0b', '#b45309', '#78350f'],
};

/**
 * Cores para categorias NCM (mapeamento especifico)
 */
export const CATEGORY_COLORS = {
  'Animais vivos': '#22c55e',
  'Carnes e miudezas': '#ef4444',
  'Peixes e crustaceos': '#0ea5e9',
  'Laticinios e ovos': '#f59e0b',
  'Outros prod. animais': '#84cc16',
  'Plantas e floricultura': '#10b981',
  'Horticolas e raizes': '#14b8a6',
  'Frutas': '#f97316',
  'Cafe, cha e especiarias': '#92400e',
  'Cereais': '#eab308',
  'Produtos de moagem': '#d97706',
  'Sementes oleaginosas': '#16a34a',
  'Gomas e resinas': '#6b7280',
  'Mat. para entrancar': '#a3a3a3',
  'Gorduras e oleos': '#fbbf24',
  'Prep. carne/peixe': '#dc2626',
  'Acucares': '#ec4899',
  'Cacau e preparacoes': '#78350f',
  'Prep. de cereais': '#ca8a04',
  'Prep. de horticolas': '#059669',
  'Prep. alimenticias': '#8b5cf6',
  'Bebidas e vinagres': '#6366f1',
  'Residuos alimentares': '#64748b',
  'Tabaco': '#78716c',
};

/**
 * Retorna cor da categoria (por indice para consistencia)
 */
export function getCategoryColor(categoria, index = null) {
  if (index !== null) {
    return CHART_COLORS.rainbow[index % CHART_COLORS.rainbow.length];
  }
  return CATEGORY_COLORS[categoria] || stringToColor(categoria);
}

/**
 * Retorna cor do rainbow por indice
 */
export function getRainbowColor(index) {
  return CHART_COLORS.rainbow[index % CHART_COLORS.rainbow.length];
}
