import {
  LayoutDashboard, PieChart, Globe, MapPin, Package, TrendingUp
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
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-dark-100">
      {tabs.map(tab => {
        const Icon = iconMap[tab.icon] || LayoutDashboard;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
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
  );
}
