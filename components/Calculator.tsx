import React, { useState, useEffect } from 'react';
import GeneralInfoForm from './GeneralInfoForm';
import InsuredList from './InsuredList';
import ResultsSummary from './ResultsSummary';
import { GeneralInfo, InsuranceGroup, ContractType, Geography, Duration, CoPay, CalculationResult, RenewalStatus } from '../types';
import { calculatePremium } from '../services/calculationService';
import { exportToExcel } from '../services/excelExport';
import { ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
  userEmail: string;
}

const Calculator: React.FC<Props> = ({ onBack, userEmail }) => {
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    tenKhachHang: '',
    loaiHopDong: ContractType.CAN_HAN,
    phamViDiaLy: Geography.VIETNAM,
    thoiHanBaoHiem: Duration.TREN_9_THANG,
    mucDongChiTra: CoPay.MUC_0,
    renewalStatus: RenewalStatus.NON_CONTINUOUS,
    tyLeBoiThuongNamTruoc: 0
  });

  const [groups, setGroups] = useState<InsuranceGroup[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const res = calculatePremium(generalInfo, groups);
    setResult(res);
  }, [generalInfo, groups]);

  const handleExportExcel = () => {
    if (result && groups.length > 0) {
      exportToExcel(generalInfo, groups, result);
    } else {
      alert("Vui lòng nhập thông tin để xuất báo giá.");
    }
  };

  return (
    <div className="min-h-screen bg-phuhung-bg pb-20 font-sans text-phuhung-text">
      {/* Header */}
      <header className="bg-phuhung-blue text-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                title="Quay lại danh sách sản phẩm"
             >
                <ArrowLeft className="w-5 h-5 text-white" />
             </button>
            <div className="bg-white px-3 py-1.5 rounded-md shadow-sm h-10 flex items-center">
               <img 
                  src="https://www.baohiemphuhung.vn/assets/pac-logo-vn-BrmkJGw6.png" 
                  alt="Phu Hung Assurance" 
                  className="h-full w-auto object-contain"
               />
            </div>
            <div className="hidden md:flex flex-col border-l border-blue-400/30 pl-4 h-10 justify-center">
              <span className="font-bold text-lg leading-none">Ưu Việt 2025</span>
              <span className="text-[11px] text-blue-100 font-light opacity-80 uppercase tracking-wide">Công cụ tính phí</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
             <span className="hidden sm:block text-blue-200">Xin chào, {userEmail}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        
        <div className="mb-6">
           <h1 className="text-2xl font-bold text-phuhung-text">Bảo Hiểm Sức Khỏe Ưu Việt</h1>
           <p className="text-phuhung-textSec mt-1 text-sm">Nhập thông tin chi tiết bên dưới, phí bảo hiểm sẽ được tính toán tự động ở cột bên phải.</p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Column: Inputs (Take 8/12 space on large screens) */}
            <div className="xl:col-span-8 space-y-8">
                <section>
                    <GeneralInfoForm info={generalInfo} onChange={setGeneralInfo} />
                </section>

                <section>
                    <InsuredList 
                        groups={groups} 
                        contractType={generalInfo.loaiHopDong}
                        onChange={setGroups} 
                    />
                </section>
            </div>

            {/* Right Column: Sticky Results (Take 4/12 space) */}
            <div className="xl:col-span-4 sticky top-[88px] z-30">
                {result && (
                    <ResultsSummary 
                        result={result} 
                        onExport={handleExportExcel}
                    />
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Calculator;