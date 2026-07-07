// ATLAS-A11Y-HEX-SWEPT
/**
 * Utilitarios de formatacao para o dashboard ComexStat
 */

/**
 * toFixed com virgula decimal (padrao pt-BR)
 */
function toFixedPtBr(value, decimals) {
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Formata valor como moeda USD
 */
export function formatCurrency(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const absValue = Math.abs(value);
  let formatted;

  if (absValue >= 1e12) {
    formatted = toFixedPtBr(value / 1e12, decimals) + ' tri';
  } else if (absValue >= 1e9) {
    formatted = toFixedPtBr(value / 1e9, decimals) + ' bi';
  } else if (absValue >= 1e6) {
    formatted = toFixedPtBr(value / 1e6, decimals) + ' mi';
  } else if (absValue >= 1e3) {
    formatted = toFixedPtBr(value / 1e3, decimals) + ' mil';
  } else {
    formatted = toFixedPtBr(value, decimals);
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
    return toFixedPtBr(value / 1e12, decimals) + ' tri';
  } else if (absValue >= 1e9) {
    return toFixedPtBr(value / 1e9, decimals) + ' bi';
  } else if (absValue >= 1e6) {
    return toFixedPtBr(value / 1e6, decimals) + ' mi';
  } else if (absValue >= 1e3) {
    return toFixedPtBr(value / 1e3, decimals) + ' mil';
  }

  return toFixedPtBr(value, decimals);
}

/**
 * Formata peso em toneladas
 */
export function formatWeight(kg, decimals = 1) {
  if (kg === null || kg === undefined || isNaN(kg)) return '-';

  const tons = kg / 1000;

  if (tons >= 1e9) {
    return toFixedPtBr(tons / 1e9, decimals) + ' Gt';
  } else if (tons >= 1e6) {
    return toFixedPtBr(tons / 1e6, decimals) + ' Mt';
  } else if (tons >= 1e3) {
    return toFixedPtBr(tons / 1e3, decimals) + ' kt';
  }

  return toFixedPtBr(tons, decimals) + ' t';
}

/**
 * Formata percentual
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const sign = value > 0 ? '+' : '';
  return sign + toFixedPtBr(value, decimals) + '%';
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
  // Par verde/clay (nunca verde+vermelho): daltonic-safe, com setas como redundancia
  if (value > 0) return 'text-primary-600';
  if (value < 0) return 'text-accent-600';
  return 'text-dark-500';
}

/**
 * Retorna classe de badge baseada na variacao
 */
export function getVariationBadge(value) {
  if (value > 0) return 'badge-green';
  if (value < 0) return 'badge-clay';
  return 'badge-yellow';
}

/**
 * Gera cor baseada em string (hash)
 */
export function stringToColor(str) {
  if (!str) return '#6e6453';

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#0072B2', '#005c8e', '#004a72', // Greens
    '#eab308', '#ca8a04', '#a16207', // Yellows
    '#3b82f6', '#2563eb', '#1d4ed8', // Blues
    '#c89b3c', '#a87f2d', '#b45309', // Oranges
    '#CC79A7', '#7c3aed', '#6d28d9', // Purples
    '#ec4899', '#db2777', '#be185d', // Pinks
  ];

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Cores para graficos (padrao VBP)
 */
/**
 * Gradientes para mapas (padrao VBP)
 */
/**
 * Cores para categorias NCM (mapeamento especifico)
 */
export const CATEGORY_COLORS = {
  'Animais vivos': '#0072B2',
  'Carnes e miudezas': '#D55E00',
  'Peixes e crustaceos': '#3d729c',
  'Laticinios e ovos': '#c89b3c',
  'Outros prod. animais': '#84cc16',
  'Plantas e floricultura': '#10b981',
  'Horticolas e raizes': '#14b8a6',
  'Frutas': '#f97316',
  'Cafe, cha e especiarias': '#92400e',
  'Cereais': '#eab308',
  'Produtos de moagem': '#a87f2d',
  'Sementes oleaginosas': '#005c8e',
  'Gomas e resinas': '#6b7280',
  'Mat. para entrancar': '#a3a3a3',
  'Gorduras e oleos': '#e0b850',
  'Prep. carne/peixe': '#a8482c',
  'Acucares': '#ec4899',
  'Cacau e preparacoes': '#78350f',
  'Prep. de cereais': '#ca8a04',
  'Prep. de horticolas': '#059669',
  'Prep. alimenticias': '#CC79A7',
  'Bebidas e vinagres': '#7a4e88',
  'Residuos alimentares': '#6e6453',
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

// ATLAS-PALETTE-V1
// Re-export the shared Atlas Editorial palette (daltonic-safe).
// O re-export NÃO cria binding local: o import abaixo é necessário para
// getCategoryColor(index)/getRainbowColor não lançarem ReferenceError.
import { CHART_COLORS } from './chart-palette.js';
export { CHART_COLORS, MAP_GRADIENTS, ATLAS_CATEGORICAL, ATLAS_FOREST, ATLAS_WATER, ATLAS_CLAY, ATLAS_EARTH, ATLAS_HARVEST, ATLAS_DIVERGING, ATLAS_CHROME, categoricalColor, sequentialColor } from './chart-palette.js';
