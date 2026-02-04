import { Ship } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-soft mb-4">
          <Ship className="w-10 h-10 text-primary-600 animate-pulse" />
        </div>
        <h2 className="text-lg font-semibold text-dark-800">Carregando dados...</h2>
        <p className="text-sm text-dark-500 mt-1">ComexStat Parana</p>

        {/* Skeleton cards */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto px-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-dark-200 rounded w-3/4 mb-2" />
              <div className="h-6 bg-dark-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
