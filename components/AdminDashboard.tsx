
import React, { useState, useEffect } from 'react';
import { SystemConfig, Geography } from '../types';
import { configService } from '../services/configService';
import { Save, RotateCcw, ArrowLeft, Settings, TableProperties, Percent, Info, Globe, ShieldCheck, AlertCircle, ChevronDown, Check } from 'lucide-react';

interface Props {
  onBack: () => void;
}

// --- SCHEMA DEFINITIONS ---

type ProductSchema = {
    id: string;
    name: string;
    columns: string[]; // e.g. Age Groups or Vehicle Types
    rows: { key: string; label: string; sub?: string }[];
    supportsGeo: boolean; // Does it have VN/Asia/Global toggle?
}

// 1. Health Insurance Schema (Standard)
const UV2025_SCHEMA: ProductSchema = {
    id: 'uv2025',
    name: 'Sức Khỏe Ưu Việt 2025',
    columns: ['0 - 10 tuổi', '11 - 17 tuổi', '18 - 50 tuổi', '51 - 65 tuổi', '66 - 70 tuổi'],
    supportsGeo: true,
    rows: [
        { key: 'A1', label: 'A1. Tử vong/Thương tật toàn bộ vĩnh viễn', sub: 'Tỷ lệ phí cơ bản' },
        { key: 'A2', label: 'A2. Thương tật bộ phận vĩnh viễn', sub: 'Tỷ lệ phí cơ bản' },
        { key: 'A_ALLOWANCE_3_5', label: 'A3. Trợ cấp lương (3-5 tháng)', sub: 'Tỷ lệ phí' },
        { key: 'A_ALLOWANCE_6_9', label: 'A3. Trợ cấp lương (6-9 tháng)', sub: 'Tỷ lệ phí' },
        { key: 'A_ALLOWANCE_10_12', label: 'A3. Trợ cấp lương (10-12 tháng)', sub: 'Tỷ lệ phí' },
        { key: 'A_MEDICAL_LOW', label: 'A4. Y tế (≤ 40 triệu)', sub: 'Tỷ lệ phí' },
        { key: 'A_MEDICAL_MID1', label: 'A4. Y tế (40 - 60 triệu)', sub: 'Tỷ lệ phí' },
        { key: 'A_MEDICAL_MID2', label: 'A4. Y tế (60 - 100 triệu)', sub: 'Tỷ lệ phí' },
        { key: 'A_MEDICAL_HIGH', label: 'A4. Y tế (> 100 triệu)', sub: 'Tỷ lệ phí' },
        { key: 'B', label: 'B. Chết do ốm đau, bệnh tật', sub: 'Tỷ lệ phí cơ bản' },
        { key: 'C_BAND1', label: 'C. Nội trú (40M - 60M)', sub: 'Tỷ lệ phí' },
        { key: 'C_BAND2', label: 'C. Nội trú (60M - 100M)', sub: 'Tỷ lệ phí' },
        { key: 'C_BAND3', label: 'C. Nội trú (100M - 200M)', sub: 'Tỷ lệ phí' },
        { key: 'C_BAND4', label: 'C. Nội trú (200M - 400M)', sub: 'Tỷ lệ phí' },
        { key: 'D_BAND1', label: 'D. Thai sản (40M - 60M)', sub: 'Tỷ lệ phí' },
        { key: 'D_BAND2', label: 'D. Thai sản (60M - 100M)', sub: 'Tỷ lệ phí' },
        { key: 'D_BAND3', label: 'D. Thai sản (100M - 200M)', sub: 'Tỷ lệ phí' },
        { key: 'D_BAND4', label: 'D. Thai sản (200M - 400M)', sub: 'Tỷ lệ phí' },
        { key: 'E_BAND1', label: 'E. Ngoại trú (5M - 10M)', sub: 'Tỷ lệ phí' },
        { key: 'E_BAND2', label: 'E. Ngoại trú (10M - 20M)', sub: 'Tỷ lệ phí' },
        { key: 'E_BAND3', label: 'E. Ngoại trú (> 20M)', sub: 'Tỷ lệ phí' },
        { key: 'F_BAND1', label: 'F. Nha khoa (2M - 5M)', sub: 'Tỷ lệ phí' },
        { key: 'F_BAND2', label: 'F. Nha khoa (5M - 10M)', sub: 'Tỷ lệ phí' },
        { key: 'F_BAND3', label: 'F. Nha khoa (> 10M)', sub: 'Tỷ lệ phí' },
        { key: 'G_MEDICAL', label: 'G.1 Y tế nước ngoài', sub: 'Tỷ lệ phí' },
        { key: 'G_TRANSPORT', label: 'G.2 Vận chuyển nước ngoài', sub: 'Tỷ lệ phí' },
        { key: 'H_HOSPITALIZATION', label: 'H.1 Trợ cấp nằm viện', sub: 'Tỷ lệ phí' },
        { key: 'I_MAIN', label: 'I.1 & I.2 Tử vong/TT (Ngộ độc)', sub: 'Tỷ lệ phí' },
        { key: 'I_ALLOWANCE', label: 'I.3 Trợ cấp lương (Ngộ độc)', sub: 'Tỷ lệ phí' },
        { key: 'I_MEDICAL', label: 'I.4 Y tế (Ngộ độc)', sub: 'Tỷ lệ phí' },
    ]
};

// 2. Car Insurance Schema (Demo)
const CAR_SCHEMA: ProductSchema = {
    id: 'car',
    name: 'Bảo Hiểm Xe Cơ Giới (Demo)',
    columns: ['Không Kinh Doanh', 'Có Kinh Doanh', 'Taxi/Grab'],
    supportsGeo: false,
    rows: [
        { key: 'CAR_SEAT_LT_6', label: 'Xe dưới 6 chỗ', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_SEAT_6_11', label: 'Xe từ 6 - 11 chỗ', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_SEAT_12_24', label: 'Xe từ 12 - 24 chỗ', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_SEAT_GT_24', label: 'Xe trên 24 chỗ', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_TRUCK_LT_3', label: 'Xe tải dưới 3 tấn', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_TRUCK_3_8', label: 'Xe tải 3 - 8 tấn', sub: 'Phí TNDS bắt buộc' },
        { key: 'CAR_TRUCK_GT_8', label: 'Xe tải trên 8 tấn', sub: 'Phí TNDS bắt buộc' },
    ]
}

const PRODUCT_SCHEMAS: Record<string, ProductSchema> = {
    'uv2025': UV2025_SCHEMA,
    'car': CAR_SCHEMA
};

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('uv2025');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'factors' | 'rates'>('factors');
  const [rateType, setRateType] = useState<'base' | 'min'>('base');
  const [selectedGeoScope, setSelectedGeoScope] = useState<Geography>(Geography.VIETNAM);
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load config whenever selected product changes
  useEffect(() => {
    if (isAuthenticated) {
        const loadedConfig = configService.getConfig(selectedProduct);
        setConfig(loadedConfig);
        // Reset geo view when switching products just in case
        setSelectedGeoScope(Geography.VIETNAM);
    }
  }, [selectedProduct, isAuthenticated]);

  const currentSchema = PRODUCT_SCHEMAS[selectedProduct] || UV2025_SCHEMA;

  const handleSave = () => {
    if (config) {
      configService.saveConfig(config, selectedProduct);
      alert(`Đã lưu cấu hình cho sản phẩm "${currentSchema.name}" thành công!`);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục mặc định cho "${currentSchema.name}"? Mọi thay đổi sẽ bị mất.`)) {
      const def = configService.resetConfig(selectedProduct);
      setConfig(def);
    }
  };

  // Helper to construct keys matching configService structure
  const getStorageKey = (baseKey: string, suffix: string) => {
      // 1. Handle C, D, E, F bands where Geo is in the middle: C_BAND1 + _VN => C_VN_BAND1
      // Schema Key format: LETTER_BAND...
      const bandMatch = baseKey.match(/^([CDEF])_(BAND\d+)$/);
      if (bandMatch) {
          const letter = bandMatch[1];
          const band = bandMatch[2];
          return `${letter}${suffix}_${band}`;
      }
      
      // 2. Default concatenation (A1_VN, B_VN, etc.)
      return `${baseKey}${suffix}`;
  };

  const handleMatrixChange = (baseKey: string, index: number, valStr: string) => {
      if (!config) return;
      
      let val = 0;
      if (valStr.trim().toUpperCase() === 'N/A' || valStr.trim() === '-1') {
          val = -1;
      } else {
          val = parseFloat(valStr);
          if (isNaN(val) && valStr !== '') return;
          if (valStr === '') val = 0;
      }

      let suffix = '';
      if (currentSchema.supportsGeo) {
          if (selectedGeoScope === Geography.CHAU_A) suffix = '_ASIA';
          else if (selectedGeoScope === Geography.TOAN_CAU) suffix = '_GLOBAL';
          else suffix = '_VN';
      }

      // Use helper to resolve correct key structure
      const fullKey = getStorageKey(baseKey, suffix);

      const targetTable = rateType === 'base' ? config.baseRates : config.minRates;
      
      // Handle missing keys gracefully by creating default array if needed
      const currentArray = [...((targetTable as any)[fullKey] || new Array(currentSchema.columns.length).fill(0))];
      currentArray[index] = val;
      
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

  if (!config) return <div>Loading config...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
             </button>
             
             {/* PRODUCT SELECTOR */}
             <div className="relative">
                 <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                 >
                     <div className="flex flex-col items-start">
                         <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Sản phẩm đang chọn</span>
                         <span className="text-sm font-bold text-phuhung-blue flex items-center gap-1">
                             {currentSchema.name} <ChevronDown className="w-3 h-3" />
                         </span>
                     </div>
                 </button>
                 
                 {isDropdownOpen && (
                     <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                         {Object.values(PRODUCT_SCHEMAS).map(schema => (
                             <button
                                key={schema.id}
                                onClick={() => {
                                    setSelectedProduct(schema.id);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between group"
                             >
                                 <span className={selectedProduct === schema.id ? 'font-bold text-phuhung-blue' : 'text-gray-700'}>
                                     {schema.name}
                                 </span>
                                 {selectedProduct === schema.id && <Check className="w-4 h-4 text-phuhung-blue" />}
                             </button>
                         ))}
                     </div>
                 )}
             </div>
          </div>

          <div className="flex gap-3">
             <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors">
                <RotateCcw className="w-4 h-4" /> Khôi phục gốc
             </button>
             <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-phuhung-blue hover:bg-phuhung-blueHover rounded shadow-sm transition-colors">
                <Save className="w-4 h-4" /> Lưu Cấu Hình
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

                 {/* Geographic Factors - Only if supported */}
                 <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${!currentSchema.supportsGeo ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                     <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-r"></span>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-600" />
                            Phạm Vi Địa Lý (Hệ số chung)
                        </div>
                     </h3>
                     {!currentSchema.supportsGeo && (
                         <div className="text-xs text-red-500 mb-2">Sản phẩm này không hỗ trợ cấu hình Geo Factor chung.</div>
                     )}
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
                 
                 {/* 1. MATRIX RATES */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                     <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div>
                            <h3 className="font-bold text-gray-800">Tỷ Lệ Phí Chi Tiết</h3>
                            <p className="text-xs text-gray-500 mt-1">Cấu hình chi tiết theo: <strong>{currentSchema.columns.join(', ')}</strong></p>
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

                             {currentSchema.supportsGeo && (
                                <>
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
                                </>
                             )}
                         </div>
                     </div>

                     <div className={`p-2 text-center text-xs border-b border-blue-100 transition-colors ${rateType === 'base' ? 'bg-blue-50/50 text-blue-700' : 'bg-green-50/50 text-green-700'}`}>
                         Đang hiển thị bảng <strong>{rateType === 'base' ? 'TỶ LỆ PHÍ CƠ BẢN' : 'TỶ LỆ PHÍ THUẦN (MIN)'}</strong>
                         {currentSchema.supportsGeo && <span> cho khu vực: <strong>{selectedGeoScope === Geography.VIETNAM ? 'Việt Nam' : selectedGeoScope === Geography.CHAU_A ? 'Châu Á' : 'Toàn Cầu'}</strong></span>}
                     </div>
                     
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold w-1/4">Quyền Lợi / Hạng Mục</th>
                                    {currentSchema.columns.map((col, idx) => (
                                        <th key={idx} className="px-4 py-4 text-center min-w-[100px] border-l border-gray-200">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentSchema.rows.map((def) => {
                                    // Construct key dynamically based on geo support
                                    let suffix = '';
                                    if (currentSchema.supportsGeo) {
                                        if (selectedGeoScope === Geography.CHAU_A) suffix = '_ASIA';
                                        else if (selectedGeoScope === Geography.TOAN_CAU) suffix = '_GLOBAL';
                                        else suffix = '_VN';
                                    }
                                    
                                    // Use helper to resolve correct key structure
                                    const fullKey = getStorageKey(def.key, suffix);
                                    
                                    // SELECT SOURCE BASED ON RATE TYPE
                                    const sourceTable = rateType === 'base' ? config.baseRates : config.minRates;
                                    // Default to 0 array if not found
                                    const dataRow = (sourceTable as any)[fullKey] || new Array(currentSchema.columns.length).fill(0);

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
