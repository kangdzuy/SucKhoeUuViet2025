
import React from 'react';
import { Car, Heart, Briefcase, PlusCircle, LogOut, Settings } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../services/languageService';

interface Props {
  onSelectProduct: (productId: string) => void;
  onLogout: () => void;
  userEmail: string;
}

const ProductDashboard: React.FC<Props> = ({ onSelectProduct, onLogout, userEmail }) => {
  const { t } = useLanguage();
  
  const products = [
    {
      id: 'uv2025',
      title: t('dashboard.p_uv2025'),
      desc: t('dashboard.p_uv2025_desc'),
      icon: <Heart className="w-8 h-8 text-white" />,
      color: 'bg-phuhung-blue',
      active: true
    },
    {
      id: 'car',
      title: t('dashboard.p_car'),
      desc: t('dashboard.p_car_desc'),
      icon: <Car className="w-8 h-8 text-white" />,
      color: 'bg-green-600',
      active: false
    },
    {
      id: 'property',
      title: t('dashboard.p_property'),
      desc: t('dashboard.p_property_desc'),
      icon: <Briefcase className="w-8 h-8 text-white" />,
      color: 'bg-purple-600',
      active: false
    },
  ];

  return (
    <div className="min-h-screen bg-phuhung-bg font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-30 animate-enter">
        <div className="flex items-center gap-3">
            <img 
               src="https://www.baohiemphuhung.vn/assets/pac-logo-vn-BrmkJGw6.png" 
               alt="Phu Hung Assurance" 
               className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-gray-400 text-lg border-l border-gray-300 pl-3 h-6 flex items-center">Portal</span>
        </div>
        <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="bg-phuhung-blue p-1 rounded-lg">
                <LanguageSwitcher />
            </div>

            <span className="text-sm text-gray-600 hidden sm:block">{t('common.welcome')}, <b>{userEmail}</b></span>
            
            <button 
                onClick={() => onSelectProduct('admin')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-phuhung-blue hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors"
                title={t('common.settings')}
            >
                <Settings className="w-4 h-4" />
            </button>

            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors font-medium"
                title={t('common.logout')}
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
         <h1 className="text-2xl font-bold text-phuhung-text mb-2 animate-enter" style={{ animationDelay: '100ms' }}>{t('dashboard.title')}</h1>
         <p className="text-gray-500 mb-8 animate-enter" style={{ animationDelay: '150ms' }}>{t('dashboard.subtitle')}</p>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, idx) => (
                <div 
                    key={p.id}
                    onClick={() => p.active && onSelectProduct(p.id)}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group transition-all duration-300 animate-enter ${p.active ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale-[0.5]'}`}
                    style={{ animationDelay: `${200 + (idx * 100)}ms` }}
                >
                    <div className={`${p.color} p-6 flex items-center justify-between`}>
                        {p.icon}
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                            {p.active ? t('dashboard.ready') : t('dashboard.soon')}
                        </span>
                    </div>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-phuhung-blue transition-colors">
                            {p.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">
                            {p.desc}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-phuhung-blue">
                             {p.active ? t('dashboard.createQuote') : t('dashboard.dev')}
                        </div>
                    </div>
                </div>
            ))}

            {/* Placeholder for new product */}
            <div 
                className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 text-gray-400 min-h-[240px] animate-enter"
                style={{ animationDelay: `${200 + (products.length * 100)}ms` }}
            >
                <PlusCircle className="w-10 h-10 mb-3 opacity-50" />
                <span className="text-sm font-medium">{t('dashboard.other')}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
