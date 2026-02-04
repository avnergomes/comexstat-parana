import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Package, Scale, DollarSign } from 'lucide-react';
import { formatCurrency, formatWeight, formatPercent, getVariationColor, getVariationBadge } from '../utils/format';

function KpiCard({ title, value, subtitle, variation, icon: Icon, type = 'export' }) {
  const cardClass = type === 'export' ? 'stat-card-export' :
                    type === 'import' ? 'stat-card-import' : 'stat-card-balance';

  const valueClass = type === 'export' ? 'kpi-value-export' :
                     type === 'import' ? 'kpi-value-import' : 'kpi-value-balance';

  const iconBgClass = type === 'export' ? 'bg-primary-100 text-primary-600' :
                      type === 'import' ? 'bg-accent-100 text-accent-600' : 'bg-secondary-100 text-secondary-600';

  return (
    <div className={`stat-card ${cardClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-500 font-medium">{title}</p>
          <p className={`kpi-value ${valueClass} mt-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-dark-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconBgClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {variation !== undefined && variation !== null && (
        <div className="mt-3 flex items-center gap-1">
          {variation >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-primary-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${getVariationColor(variation)}`}>
            {formatPercent(variation)}
          </span>
          <span className="text-xs text-dark-400 ml-1">vs ano anterior</span>
        </div>
      )}
    </div>
  );
}

export default function KpiCards({ totals }) {
  if (!totals) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Exportacoes */}
      <KpiCard
        title="Exportacoes (FOB)"
        value={formatCurrency(totals.valorExp, 1)}
        subtitle={formatWeight(totals.pesoExp)}
        variation={totals.variacaoExp}
        icon={TrendingUp}
        type="export"
      />

      {/* Importacoes */}
      <KpiCard
        title="Importacoes (FOB)"
        value={formatCurrency(totals.valorImp, 1)}
        subtitle={formatWeight(totals.pesoImp)}
        variation={totals.variacaoImp}
        icon={TrendingDown}
        type="import"
      />

      {/* Saldo */}
      <KpiCard
        title="Balanca Comercial"
        value={formatCurrency(totals.saldo, 1)}
        subtitle={totals.saldo > 0 ? 'Superavit' : totals.saldo < 0 ? 'Deficit' : 'Equilibrado'}
        icon={Scale}
        type="balance"
      />

      {/* Corrente */}
      <KpiCard
        title="Corrente de Comercio"
        value={formatCurrency(totals.corrente, 1)}
        subtitle="Exp + Imp"
        icon={DollarSign}
        type="balance"
      />
    </div>
  );
}
