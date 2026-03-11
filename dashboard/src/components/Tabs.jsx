import { useRef, useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, PieChart, Globe, MapPin, Package, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const iconMap = {
  'LayoutDashboard': LayoutDashboard,
  'PieChart': PieChart,
  'Globe': Globe,
  'MapPin': MapPin,
  'Package': Package,
  'TrendingUp': TrendingUp,
};

export default function Tabs({ tabs, activeTab, onChange }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 150, behavior: 'smooth' });
  };

  return (
    <div className="relative" role="tablist" aria-label="Navegacao do dashboard">
      {/* Mobile scroll indicators */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 shadow-md rounded-full text-dark-600 hover:text-primary-600 sm:hidden transition-colors"
          aria-label="Rolar para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 shadow-md rounded-full text-dark-600 hover:text-primary-600 sm:hidden transition-colors"
          aria-label="Rolar para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-dark-100 overflow-x-auto scrollbar-thin sm:flex-wrap sm:overflow-visible"
      >
        {tabs.map(tab => {
          const Icon = iconMap[tab.icon] || LayoutDashboard;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0
                ${isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 scale-[1.02]'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-800'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
