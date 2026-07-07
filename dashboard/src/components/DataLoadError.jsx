import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Estado de erro localizado para datasets opcionais que falharam ao carregar.
 * Evita o pior modo de falha: secao vazia ou zeros com aparencia de dado real.
 * O botao refaz o carregamento sem recarregar a pagina.
 */
export default function DataLoadError({ message, onRetry }) {
  return (
    <div className="chart-container min-h-40 flex flex-col items-center justify-center gap-3 text-center py-8" role="alert">
      <AlertTriangle className="w-6 h-6 text-accent-600" aria-hidden="true" />
      <p className="text-sm text-dark-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-600/40 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
