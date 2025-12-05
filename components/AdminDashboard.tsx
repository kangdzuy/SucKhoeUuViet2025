
import React, { useState, useEffect } from 'react';
import { SystemConfig, Geography } from '../types';
import { configService } from '../services/configService';
import { Save, RotateCcw, ArrowLeft, Settings, TableProperties, Percent, Info, Globe, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const AGE_GROUPS = ['0 - 10 tuổi', '11 - 17 tuổi', '18 - 50 tuổi', '51 - 65 tuổi', '66 - 70 tuổi'];

const RATE_DEFINITIONS = [
    { key: 'A1_MAIN', label: 'A1. Tử vong/Thương tật toàn bộ vĩnh viễn', sub: 'Tỷ lệ phí cơ bản' },
    { key: 'A2_MAIN', label: 'A2. Thương tật bộ phận vĩnh viễn', sub: 'Tỷ lệ phí cơ bản' },
    
    { key: 'A_ALLOWANCE_3_5', label: 'A3. Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời', sub: 'Gói 3 - 5 tháng' },
    { key: 'A_ALLOWANCE_6_9', label: 'A3. Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời', sub: 'Gói 6 - 9 tháng' },
    { key: 'A_ALLOWANCE_10_12', label: 'A3. Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời', sub: 'Gói 10 - 12 tháng' },
    { key: 'A_MEDICAL_LOW', label: 'A4. Chi phí y tế, chi phí vận chuyển cấp cứu', sub: 'Hạn mức ≤ 40 triệu' },
    { key: 'A_MEDICAL_MID1', label: 'A4. Chi phí y tế, chi phí vận chuyển cấp cứu', sub: 'Hạn mức 40 - 60 triệu' },
    { key: 'A_MEDICAL_MID2', label: 'A4. Chi phí y tế, chi phí vận chuyển cấp cứu', sub: 'Hạn mức 60 - 100 triệu' },
    { key: 'A_MEDICAL_HIGH', label: 'A4. Chi phí y tế, chi phí vận chuyển cấp cứu', sub: 'Hạn mức > 100 triệu' },
    
    // BENEFIT B
    { key: 'B', label: 'B. Chết do ốm đau, bệnh tật', sub: 'Tỷ lệ phí cơ bản' },

    // BENEFIT C - BROKEN DOWN BY BAND
    { key: 'C_BAND1', label: 'C. Chi phí y tế nội trú do ốm đau, bệnh tật (Thấp)', sub: 'Hạn mức 40M - 60M' },
    { key: 'C_BAND2', label: 'C. Chi phí y tế nội trú do ốm đau, bệnh tật (Trung bình)', sub: 'Hạn mức 60M - 100M' },
    { key: 'C_BAND3', label: 'C. Chi phí y tế nội trú do ốm đau, bệnh tật (Cao)', sub: 'Hạn mức 100M - 200M' },
    { key: 'C_BAND4', label: 'C. Chi phí y tế nội trú do ốm đau, bệnh tật (Vip)', sub: 'Hạn mức 200M - 400M' },

    // BENEFIT D - BROKEN DOWN BY BAND
    { key: 'D_BAND1', label: 'D. Thai sản (Thấp)', sub: 'Hạn mức 40M - 60M' },
    { key: 'D_BAND2', label: 'D. Thai sản (TB)', sub: 'Hạn mức 60M - 100M' },
    { key: 'D_BAND3', label: 'D. Thai sản (Cao)', sub: 'Hạn mức 100M - 200M' },
    { key: 'D_BAND4', label: 'D. Thai sản (Vip)', sub: 'Hạn mức 200M - 400M' },

    // BENEFIT E - BROKEN DOWN BY BAND
    { key: 'E_BAND1', label: 'E. Điều trị ngoại trú do ốm đau, bệnh tật (Thấp)', sub: 'Hạn mức 5M - 10M' },
    { key: 'E_BAND2', label: 'E. Điều trị ngoại trú do ốm đau, bệnh tật (TB)', sub: 'Hạn mức 10M - 20M' },
    { key: 'E_BAND3', label: 'E. Điều trị ngoại trú do ốm đau, bệnh tật (Cao)', sub: 'Hạn mức > 20M' },

    // BENEFIT F - BROKEN DOWN BY BAND
    { key: 'F_BAND1', label: 'F. Chăm sóc răng (Thấp)', sub: 'Hạn mức 2M - 5M' },
    { key: 'F_BAND2', label: 'F. Chăm sóc răng (TB)', sub: 'Hạn mức 5M - 10M' },
    { key: 'F_BAND3', label: 'F. Chăm sóc răng (Cao)', sub: 'Hạn mức > 10M' },

    // BENEFIT G - SPLIT
    { key: 'G_MEDICAL', label: 'G.1 Khám chữa bệnh ở nước ngoài (Chi phí y tế)', sub: 'Tỷ lệ phí' },
    { key: 'G_TRANSPORT', label: 'G.2 Khám chữa bệnh ở nước ngoài (Vận chuyển)', sub: 'Tỷ lệ phí' },

    // BENEFIT H - SPLIT
    { key: 'H_HOSPITALIZATION', label: 'H.1 Trợ cấp mất giảm thu nhập (Nằm viện)', sub: 'Tỷ lệ phí cơ bản' },
    { key: 'H_SURGICAL', label: 'H.2 Trợ cấp mất giảm thu nhập (Phẫu thuật)', sub: 'Tỷ lệ phí cơ bản (Tùy chọn)' },

    // BENEFIT I - BROKEN DOWN BY COMPONENT
    { key: 'I_MAIN', label: 'I.1 Tử vong/Thương tật toàn bộ/bộ phận vĩnh viễn (Ngộ độc)', sub: 'Tỷ lệ phí cơ bản' },
    { key: 'I_ALLOWANCE', label: 'I.2 Trợ cấp lương ngày trong thời gian điều trị (Ngộ độc)', sub: 'Tỷ lệ phí cơ bản' },
    { key: 'I_MEDICAL', label: 'I.3 Chi phí y tế, vận chuyển cấp cứu (Ngộ độc)', sub: 'Tỷ lệ phí cơ bản' },
];

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'factors' | 'rates'>('factors');
  const [rateType, setRateType] = useState<'base' | 'min'>('base'); // NEW STATE
  const [selectedGeoScope, setSelectedGeoScope] = useState<Geography>(Geography.VIETNAM);
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load config on mount
    setConfig(configService.getConfig());
  }, []);

  const handleSave = () => {
    if (config) {
      configService.saveConfig(config);
      alert('Đã lưu cấu hình mới thành công! Các thay đổi sẽ áp dụng ngay lập tức.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục về mặc định? Mọi thay đổi sẽ bị mất.')) {
      const def = configService.resetConfig();
      setConfig(def);
    }
  };

  // Handle specific cell change in the Matrix
  const handleMatrixChange = (baseKey: string, index: number, valStr: string) => {
      if (!config) return;
      
      let val = 0;
      // Convert "N/A" or "-1" to -1
      if (valStr.trim().toUpperCase() === 'N/A' || valStr.trim() === '-1') {
          val = -1;
      } else {
          val = parseFloat(valStr);
          if (isNaN(val) && valStr !== '') return;
          if (valStr === '') val = 0;
      }

      // Determine Suffix based on current Tab
      let suffix = '_VN';
      if (selectedGeoScope === Geography.CHAU_A) suffix = '_ASIA';
      if (selectedGeoScope === Geography.TOAN_CAU) suffix = '_GLOBAL';

      const fullKey = `${baseKey}${suffix}`;

      // Pick source based on rateType
      const targetTable = rateType === 'base' ? config.baseRates : config.minRates;
      
      const currentArray = [...(targetTable as any)[fullKey]];
      currentArray[index] = val;
      
      // Save back to correct key in config
      if (rateType === 'base') {
          setConfig({ ...config, baseRates: { ...config.baseRates, [fullKey]: currentArray } });
      } else {
          setConfig({ ...config, minRates: { ...config.minRates, [fullKey]: currentArray } });
      }
  };

  const handleFactorChange = (category: 'durationFactors' | 'copayDiscounts' | 'geoFactors', key: string, val: number) => {
    if (!config) return;
    const newCat = { ...config[category], [key]: val };
    setConfig({ ...config, [category]: newCat });
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-in zoom-in-95 duration-200">
                  <div className="flex justify-center mb-4">
                      <div className="bg-phuhung-blue p-3 rounded-full">
                        <Settings className="w-8 h-8 text-white" />
                      </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-center text-gray-800">Quản Trị Hệ Thống</h2>
                  <p className="text-sm text-gray-500 text-center mb-6">Khu vực dành cho chuyên gia tính phí</p>
                  
                  <input 
                    type="password" 
                    placeholder="Nhập mã PIN (Gợi ý: 2025)"
                    className="w-full p-3 border border-gray-300 rounded mb-4 text-center tracking-widest text-lg font-bold"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button onClick={onBack} className="w-1/3 p-3 bg-white border border-gray-300 rounded font-medium text-gray-600 hover:bg-gray-50">Thoát</button>
                    <button 
                        onClick={() => {
                            if(passcode === '2025') setIsAuthenticated(true);
                            else alert('Mã PIN không đúng');
                        }} 
                        className="w-2/3 p-3 bg-phuhung-blue text-white rounded font-bold hover:bg-phuhung-blueHover shadow-md"
                    >
                        Đăng Nhập
                    </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!config) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
             </button>
             <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <Settings className="w-5 h-5 text-phuhung-blue" /> Cấu Hình Biểu Phí
             </h1>
          </div>
          <div className="flex gap-3">
             <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors">
                <RotateCcw className="w-4 h-4" /> Khôi phục gốc
             </button>
             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-phuhung-blue hover:bg-phuhung-blueHover rounded shadow-sm transition-colors">
                <Save className="w-4 h-4" /> Lưu Thay Đổi
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
         {/* Tabs */}
         <div className="flex gap-6 mb-6 border-b border-gray-200">
             <button 
                onClick={() => setActiveTab('factors')}
                className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'factors' ? 'border-phuhung-blue text-phuhung-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
                <Percent className="w-4 h-4" /> Hệ Số Điều Chỉnh
             </button>
             <button 
                onClick={() => setActiveTab('rates')}
                className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rates' ? 'border-phuhung-blue text-phuhung-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
             >
                <TableProperties className="w-4 h-4" /> Bảng Tỷ Lệ Phí
             </button>
         </div>

         {activeTab === 'factors' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
                 {/* Duration Factors */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                        <span className="w-1 h-6 bg-phuhung-blue rounded-r"></span>
                        Hệ Số Thời Hạn (Ngắn hạn)
                     </h3>
                     <div className="space-y-4">
                        {Object.entries(config.durationFactors).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700">{key}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Hệ số nhân:</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        value={val} 
                                        onChange={(e) => handleFactorChange('durationFactors', key, parseFloat(e.target.value))}
                                        className="w-24 p-2 border border-gray-300 rounded text-right font-mono text-sm focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue"
                                    />
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>

                 {/* Copay Discounts */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                        <span className="w-1 h-6 bg-phuhung-orange rounded-r"></span>
                        Giảm Giá Đồng Chi Trả (Co-pay)
                     </h3>
                     <div className="space-y-4">
                        {Object.entries(config.copayDiscounts).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700">{key}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Giảm:</span>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            value={val} 
                                            onChange={(e) => handleFactorChange('copayDiscounts', key, parseFloat(e.target.value))}
                                            className="w-24 p-2 border border-gray-300 rounded text-right font-mono text-sm focus:ring-1 focus:ring-phuhung-orange focus:border-phuhung-orange"
                                        />
                                        <span className="absolute right-8 top-2 text-gray-400 text-xs">%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>

                 {/* Geographic Factors */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                     <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-r"></span>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-600" />
                            Phạm Vi Địa Lý
                        </div>
                     </h3>
                     <p className="text-xs text-gray-500 mb-3 bg-yellow-50 p-2 rounded border border-yellow-200">
                         <strong>Lưu ý:</strong> Hệ số này chỉ còn áp dụng cho quyền lợi E (nếu tính theo bảng cũ). <br/>
                         Các quyền lợi A, B, C, D, F, G, H, I hiện đã có bảng tỷ lệ phí chi tiết theo khu vực ở Tab bên cạnh.
                     </p>
                     <div className="space-y-4">
                        {Object.entries(config.geoFactors).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-700">{key}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">Hệ số nhân:</span>
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        value={val} 
                                        onChange={(e) => handleFactorChange('geoFactors', key, parseFloat(e.target.value))}
                                        className="w-24 p-2 border border-gray-300 rounded text-right font-mono text-sm focus:ring-1 focus:ring-green-600 focus:border-green-600"
                                    />
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'rates' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                 
                 {/* 1. MATRIX RATES (AGE DEPENDENT) */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <h3 className="font-bold text-gray-800">Tỷ Lệ Phí Theo Độ Tuổi & Khu Vực</h3>
                            <p className="text-xs text-gray-500 mt-1">Chọn phạm vi địa lý để cấu hình bảng tỷ lệ (Áp dụng cho tất cả quyền lợi).</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-orange-700 bg-orange-50 w-fit px-2 py-1 rounded border border-orange-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>Nhập <strong>-1</strong> hoặc <strong>N/A</strong> để đánh dấu là <strong>Không áp dụng</strong></span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            {/* Toggle Rate Type */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setRateType('base')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-2 ${rateType === 'base' ? 'bg-white shadow text-phuhung-blue' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <TableProperties className="w-3.5 h-3.5" /> Phí Cơ Bản
                                </button>
                                <button 
                                    onClick={() => setRateType('min')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-2 ${rateType === 'min' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:bg-gray-200'}`}
                                >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Phí Thuần (Min)
                                </button>
                            </div>

                             <div className="h-6 w-px bg-gray-300 mx-2"></div>

                             <div className="flex gap-2">
                                {[
                                    { id: Geography.VIETNAM, label: 'Việt Nam' }, 
                                    { id: Geography.CHAU_A, label: 'Châu Á' }, 
                                    { id: Geography.TOAN_CAU, label: 'Toàn Cầu' }
                                ].map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGeoScope(g.id)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
                                            selectedGeoScope === g.id 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                             </div>
                         </div>
                     </div>

                     <div className={`p-2 text-center text-xs border-b border-blue-100 transition-colors ${rateType === 'base' ? 'bg-blue-50/50 text-blue-700' : 'bg-green-50/50 text-green-700'}`}>
                         Đang hiển thị bảng <strong>{rateType === 'base' ? 'TỶ LỆ PHÍ CƠ BẢN' : 'TỶ LỆ PHÍ THUẦN (MIN)'}</strong> cho khu vực: <strong>{selectedGeoScope === Geography.VIETNAM ? 'Việt Nam' : selectedGeoScope === Geography.CHAU_A ? 'Châu Á' : 'Toàn Cầu'}</strong>
                     </div>
                     
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold w-1/4">Quyền Lợi</th>
                                    {AGE_GROUPS.map((age, idx) => (
                                        <th key={idx} className="px-4 py-4 text-center min-w-[100px] border-l border-gray-200">
                                            {age}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {RATE_DEFINITIONS.map((def) => {
                                    // Construct key: e.g., A_MAIN_VN
                                    let suffix = '_VN';
                                    if (selectedGeoScope === Geography.CHAU_A) suffix = '_ASIA';
                                    if (selectedGeoScope === Geography.TOAN_CAU) suffix = '_GLOBAL';
                                    
                                    const fullKey = `${def.key}${suffix}`;
                                    
                                    // SELECT SOURCE BASED ON RATE TYPE
                                    const sourceTable = rateType === 'base' ? config.baseRates : config.minRates;
                                    const dataRow = (sourceTable as any)[fullKey] || [0,0,0,0,0];

                                    return (
                                        <tr key={def.key} className={`transition-colors group ${rateType === 'base' ? 'hover:bg-blue-50/50' : 'hover:bg-green-50/50'}`}>
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                <div>{def.label}</div>
                                                <div className="text-xs text-gray-400 font-normal">{def.sub}</div>
                                            </td>
                                            {dataRow.map((rate: number, idx: number) => (
                                                <td key={idx} className="px-2 py-3 border-l border-gray-100 text-center">
                                                    <input 
                                                        type="text"
                                                        value={rate === -1 ? 'N/A' : rate}
                                                        onChange={(e) => handleMatrixChange(def.key, idx, e.target.value)}
                                                        className={`w-full text-center p-2 rounded border border-transparent focus:bg-white focus:ring-1 transition-all font-mono text-gray-700 
                                                          ${rate === -1 ? 'bg-gray-200 text-gray-400 italic font-bold' : 'bg-gray-50 group-hover:bg-white group-hover:border-gray-300'}
                                                          ${rateType === 'base' ? 'focus:border-phuhung-blue focus:ring-phuhung-blue' : 'focus:border-green-600 focus:ring-green-600'}
                                                        `}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                 </div>
             </div>
         )}
      </main>
    </div>
  );
};

export default AdminDashboard;
