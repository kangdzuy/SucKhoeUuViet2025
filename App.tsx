import React, { useState, useEffect } from 'react';
import GeneralInfoForm from './components/GeneralInfoForm';
import InsuredList from './components/InsuredList';
import ResultsSummary from './components/ResultsSummary';
import { GeneralInfo, InsuranceGroup, ContractType, Geography, Duration, CoPay, CalculationResult } from './types';
import { calculatePremium } from './services/calculationService';
import { ShieldCheck, FileSpreadsheet, User, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    tenKhachHang: '',
    loaiHopDong: ContractType.CAN_HAN,
    phamViDiaLy: Geography.VIETNAM,
    thoiHanBaoHiem: Duration.TREN_9_THANG,
    mucDongChiTra: CoPay.MUC_0,
    tyLeBoiThuongNamTruoc: 0
  });

  // State now holds Groups (where an Individual is just a Group of 1)
  const [groups, setGroups] = useState<InsuranceGroup[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Auto-calculate whenever data changes
  useEffect(() => {
    const res = calculatePremium(generalInfo, groups);
    setResult(res);
  }, [generalInfo, groups]);

  return (
    <div className="min-h-screen bg-phuhung-bg pb-20 font-sans text-phuhung-text">
      {/* Brand Header */}
      <header className="bg-phuhung-blue text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/20">
               <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wide uppercase leading-tight">Phú Hưng Assurance</span>
              <span className="text-[11px] text-blue-100 font-light tracking-wider">Bảo hiểm sức khỏe Ưu Việt</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors">
              <User className="w-4 h-4" />
              Đăng nhập
            </button>
            <button className="p-2 hover:bg-phuhung-blueHover rounded-md transition-colors">
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
             <h1 className="text-2xl sm:text-3xl font-bold text-phuhung-text">Tính Phí Bảo Hiểm</h1>
             <p className="text-phuhung-textSec mt-1">Hệ thống tính phí tự động phiên bản 2025</p>
          </div>
          
          <button className="flex items-center justify-center gap-2 text-sm bg-white border border-phuhung-border text-phuhung-blue hover:bg-blue-50 hover:border-phuhung-blue px-5 py-2.5 rounded-md transition-all shadow-sm font-medium">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span>Xuất Excel</span>
          </button>
        </div>
        
        {/* Section 1: General Info */}
        <section>
          <GeneralInfoForm info={generalInfo} onChange={setGeneralInfo} />
        </section>

        {/* Section 2: Group/Individual List */}
        <section>
          <InsuredList 
            groups={groups} 
            contractType={generalInfo.loaiHopDong}
            onChange={setGroups} 
          />
        </section>

        {/* Section 3: Results */}
        <section>
          {result && <ResultsSummary result={result} />}
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] mx-auto px-4 text-center border-t border-phuhung-border pt-8 pb-12 mt-12">
        <p className="text-phuhung-textSec text-sm">© 2025 Phu Hung Assurance. Internal Use Only.</p>
        <p className="text-xs text-gray-400 mt-2">Designed for performance and accuracy.</p>
      </footer>
    </div>
  );
};

export default App;