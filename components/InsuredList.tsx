import React, { useState, useEffect, useMemo, useRef } from 'react';
import { InsuranceGroup, Gender, ContractType, BenefitHMethod, BenefitAMethod, BenefitBMethod, BenefitASalaryOption, Geography, CoPay, BenefitA4Program, BenefitCProgram } from '../types';
import { isValidAgeDate } from '../services/calculationService';
import { BENEFIT_LIMITS } from '../constants';
import { 
  Trash2, PlusCircle, Edit3, Users, User, AlertCircle, Info, ChevronDown, Check,
  ShieldAlert, HeartPulse, BedDouble, Baby, Stethoscope, Smile, Plane, Wallet, Utensils, Calculator,
  Upload, Download, FileText, Copy, Globe, Percent, Banknote, Layers, Activity
} from 'lucide-react';
import TooltipHelp from './TooltipHelp';
import CurrencyInput from './CurrencyInput';

interface Props {
  groups: InsuranceGroup[];
  contractType: ContractType;
  onChange: (newGroups: InsuranceGroup[]) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);
const formatShortMoney = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000) + ' tỷ';
    if (val >= 1000000) return (val / 1000000) + ' tr';
    return formatCurrency(val);
}

// Safer ID generator that doesn't rely on crypto.randomUUID (which requires secure context)
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// A4 Program Definitions
const A4_PROGRAMS: Record<BenefitA4Program, { label: string, min: number, max: number, default: number }> = {
    [BenefitA4Program.P1]: { label: 'Chương trình 1 (20tr - 40tr)', min: 20000000, max: 40000000, default: 40000000 },
    [BenefitA4Program.P2]: { label: 'Chương trình 2 (40tr - 60tr)', min: 40000001, max: 60000000, default: 60000000 },
    [BenefitA4Program.P3]: { label: 'Chương trình 3 (60tr - 100tr)', min: 60000001, max: 100000000, default: 100000000 },
    [BenefitA4Program.P4]: { label: 'Chương trình 4 (100tr - 1 tỷ)', min: 100000001, max: 1000000000, default: 1000000000 }, // Default set to Max
};

// C Program Definitions
const C_PROGRAMS: Record<BenefitCProgram, { label: string, min: number, max: number, default: number }> = {
    [BenefitCProgram.P1]: { label: 'Chương trình 1 (40tr - 60tr)', min: 40000000, max: 60000000, default: 60000000 },
    [BenefitCProgram.P2]: { label: 'Chương trình 2 (60tr - 100tr)', min: 60000001, max: 100000000, default: 100000000 },
    [BenefitCProgram.P3]: { label: 'Chương trình 3 (100tr - 200tr)', min: 100000001, max: 200000000, default: 200000000 },
    [BenefitCProgram.P4]: { label: 'Chương trình 4 (200tr - 400tr)', min: 200000001, max: 400000000, default: 400000000 },
};

// Compact Geo Select Component
const GeoSelect = ({ value, onChange, options = [Geography.VIETNAM, Geography.CHAU_A, Geography.TOAN_CAU], disabled = false }: { value: Geography, onChange: (v: Geography) => void, options?: Geography[], disabled?: boolean }) => {
    return (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 py-1 text-xs hover:border-phuhung-blue transition-colors shadow-sm">
            <Globe className="w-3 h-3 text-phuhung-blue" />
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value as Geography)}
                disabled={disabled}
                className="bg-transparent border-none p-0 text-xs font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none pr-1"
            >
                {options.includes(Geography.VIETNAM) && <option value={Geography.VIETNAM}>Việt Nam</option>}
                {options.includes(Geography.CHAU_A) && <option value={Geography.CHAU_A}>Châu Á</option>}
                {options.includes(Geography.TOAN_CAU) && <option value={Geography.TOAN_CAU}>Toàn Cầu</option>}
            </select>
        </div>
    );
};

const InsuredList: React.FC<Props> = ({ groups, contractType, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Benefit Template
  const defaultBenefits = {
    // phamViDiaLy removed from default
    mucDongChiTra: CoPay.MUC_0,
    luongCoBan: 10000000, 

    chonQuyenLoiA: false, 
    geoA: Geography.VIETNAM,
    methodA: BenefitAMethod.THEO_SO_TIEN,
    soThangLuongA: 24,
    stbhA: 100000000,
    subA_A1: true,
    subA_A2: true,
    subA_TroCap: false,
    subA_TroCap_Option: BenefitASalaryOption.OP_3_5,
    soThangLuongTroCap: 5, 
    subA_YTe: false,
    subA_YTe_Program: BenefitA4Program.P1, // Default Program 1
    stbhA_YTe: A4_PROGRAMS[BenefitA4Program.P1].default, // Default Max P1

    chonQuyenLoiB: false, 
    geoB: Geography.VIETNAM, 
    methodB: BenefitBMethod.THEO_SO_TIEN,
    soThangLuongB: 24,
    stbhB: 100000000,
    
    chonQuyenLoiC: false, 
    geoC: Geography.VIETNAM, 
    programC: BenefitCProgram.P1,
    stbhC: C_PROGRAMS[BenefitCProgram.P1].default, // Default to Max of P1

    chonQuyenLoiD: false, geoD: Geography.VIETNAM, stbhD: 10000000,
    chonQuyenLoiE: false, geoE: Geography.VIETNAM, stbhE: 5000000,
    chonQuyenLoiF: false, geoF: Geography.VIETNAM, stbhF: 2000000,
    
    chonQuyenLoiG: false, 
    geoG: Geography.CHAU_A, // Default for G is Asia
    stbhG: 50000000,
    subG_YTe: true,
    subG_VanChuyen: true,
    
    chonQuyenLoiH: false, 
    geoH: Geography.VIETNAM,
    methodH: BenefitHMethod.THEO_LUONG,
    soThangLuong: 3,
    stbhH: 30000000,
    subH_NamVien: true,
    subH_PhauThuat: true,
    
    chonQuyenLoiI: false, 
    geoI: Geography.VIETNAM,
    stbhI: 20000000,
    subI_TuVong: true,
    subI_TroCap: true,
    subI_YTe: true
  };

  // Auto-calculate Group Stats
  const groupStats = useMemo(() => {
    let totalPeople = 0;
    let totalAgeMass = 0;
    let validAgeCount = 0;

    groups.forEach(g => {
        const count = g.soNguoi || 1;
        totalPeople += count;
        
        // Calculate age for this row
        let age = g.tuoiTrungBinh;
        if (g.ngaySinh) {
            const check = isValidAgeDate(g.ngaySinh);
            if (check.valid) age = check.age;
        }

        if (age > 0) {
            totalAgeMass += age * count;
            validAgeCount += count;
        }
    });

    const avgAge = validAgeCount > 0 ? Math.round(totalAgeMass / validAgeCount) : 0;

    return { totalPeople, avgAge };
  }, [groups]);


  // Initialize Data
  useEffect(() => {
    if (groups.length === 0) {
        const initialItem: InsuranceGroup = {
            id: generateId(),
            tenNhom: '',
            soNguoi: 1,
            soNam: 1, soNu: 0, tongSoTuoi: 0, tuoiTrungBinh: 0,
            ngaySinh: '', gioiTinh: Gender.NAM,
            ...defaultBenefits
        };
        onChange([initialItem]);
        setEditingId(initialItem.id);
    }
  }, []); 

  const addGroup = () => {
    const newGroup: InsuranceGroup = {
      id: generateId(),
      tenNhom: '',
      soNguoi: 1, 
      soNam: 1, soNu: 0,
      tongSoTuoi: 0,
      tuoiTrungBinh: 0, 
      ngaySinh: '',
      gioiTinh: Gender.NAM,
      ...defaultBenefits
    };
    onChange([...groups, newGroup]);
    setEditingId(newGroup.id);
  };

  const removeGroup = (id: string) => {
    onChange(groups.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const duplicateGroup = (id: string) => {
    const originalIndex = groups.findIndex(g => g.id === id);
    if (originalIndex === -1) return;
    
    const original = groups[originalIndex];
    
    const newGroup: InsuranceGroup = {
        ...original,
        id: generateId(),
        tenNhom: original.tenNhom ? `${original.tenNhom} - Copy` : 'Copy',
    };

    // Insert right after the original
    const newGroups = [...groups];
    newGroups.splice(originalIndex + 1, 0, newGroup);
    
    onChange(newGroups);
    setEditingId(newGroup.id);
  };

  const updateGroup = (id: string, updates: Partial<InsuranceGroup>) => {
    onChange(groups.map(p => {
      if (p.id !== id) return p;
      
      // LOGIC: Reset dependent benefits if Main Benefit is turned OFF
      if (updates.chonQuyenLoiA === false) {
          updates.subA_TroCap = false;
          updates.subA_YTe = false;
          updates.chonQuyenLoiI = false;
      }
      
      if (updates.chonQuyenLoiC === false) {
          updates.chonQuyenLoiD = false;
          updates.chonQuyenLoiG = false;
          updates.chonQuyenLoiH = false;
      }

      // Geo Logic: Only applies to G now if C is removed (handled above).
      // If G is selected, ensure Geo is Asia/Global. Default to Asia if not set.
      if (updates.chonQuyenLoiG === true) {
          if (!p.geoG || p.geoG === Geography.VIETNAM) updates.geoG = Geography.CHAU_A;
      }

      // A4 Logic: If Program changes, update SI to default max
      if (updates.subA_YTe_Program) {
          const prog = A4_PROGRAMS[updates.subA_YTe_Program];
          if (prog) {
              updates.stbhA_YTe = prog.default;
          }
      }

      // C Logic: If Program changes, update SI to default max
      if (updates.programC) {
          const prog = C_PROGRAMS[updates.programC];
          if (prog) {
              updates.stbhC = prog.default;
          }
      }

      const updated = { ...p, ...updates };
      
      // AUTO CALCULATION LOGIC
      
      // 1. Age Calculation from DOB
      if (updates.ngaySinh) {
        const check = isValidAgeDate(updates.ngaySinh);
        if (check.valid) {
             updated.tuoiTrungBinh = check.age;
        }
      }

      // 2. Auto update Gender Counts (soNam/soNu) based on gioiTinh if soNguoi is 1
      if (updated.soNguoi === 1 && updated.gioiTinh) {
          if (updated.gioiTinh === Gender.NAM) { updated.soNam = 1; updated.soNu = 0; }
          else { updated.soNam = 0; updated.soNu = 1; }
      }

      // 3. Benefit H SI Calculation (If By Salary)
      if (updated.chonQuyenLoiH && updated.methodH === BenefitHMethod.THEO_LUONG) {
          updated.stbhH = (updated.luongCoBan || 0) * (updated.soThangLuong || 0);
      }
      
      // 4. Benefit A Main SI Calculation (If By Salary)
      if (updated.chonQuyenLoiA && updated.methodA === BenefitAMethod.THEO_LUONG) {
          updated.stbhA = (updated.luongCoBan || 0) * (updated.soThangLuongA || 0);
      }
      
      // 5. Benefit B SI Calculation (If By Salary) - NEW
      if (updated.chonQuyenLoiB && updated.methodB === BenefitBMethod.THEO_LUONG) {
          updated.stbhB = (updated.luongCoBan || 0) * (updated.soThangLuongB || 0);
      }

      return updated;
    }));
  };
  
  // --- IMPORT / EXPORT LOGIC ---

  const handleDownloadTemplate = () => {
    // BOM for UTF-8 support in Excel
    const BOM = "\uFEFF";
    const headers = [
        "Họ và Tên", "Ngày Sinh (dd/mm/yyyy)", "Giới Tính (Nam/Nữ)", 
        "Lương Cơ Bản (VND)", "Phạm Vi Chung (VN/Asia/Global)", "CoPay (%)",
        "STBH A (Tai nạn)", "STBH B (Sinh mạng)", "STBH C (Nội trú)",
        "STBH D (Thai sản)", "STBH E (Ngoại trú)", "STBH F (Nha khoa)",
        "STBH G (Nước ngoài)", "STBH H (Trợ cấp)", "STBH I (Ngộ độc)"
    ];
    const exampleRow = [
        "Nguyen Van A", "01/01/1990", "Nam", 
        "15000000", "VN", "0",
        "100000000", "100000000", "60000000",
        "0", "10000000", "2000000",
        "0", "0", "0"
    ];

    const csvContent = BOM + headers.join(",") + "\n" + exampleRow.join(",");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_DS_BaoHiem.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust Date Parser to handle CSV variations
  const parseDate = (dateStr: string): string => { 
    if (!dateStr) return '';
    try {
        // Assume dd/mm/yyyy
        const parts = dateStr.trim().split(/[\/\-\.]/);
        if (parts.length === 3) {
            const d = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            const y = parts[2];
            // Validate basic range
            if (parseInt(m) > 12 || parseInt(d) > 31) return '';
            return `${y}-${m}-${d}`; // ISO format for input[type=date]
        }
    } catch (e) { return ''; }
    return ''; 
  };

  const parseMoney = (str: string): number => { 
      if (!str) return 0;
      // Remove non-digits
      const clean = str.replace(/[^0-9]/g, '');
      return parseInt(clean) || 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) return;

          const lines = text.split(/\r\n|\n/);
          const newGroups: InsuranceGroup[] = [];

          // Start from index 1 to skip header
          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              const cols = line.split(',');
              if (cols.length < 3) continue;

              const [
                  name, dob, genderStr, salaryStr, geoStr, copayStr,
                  stbhA, stbhB, stbhC, stbhD, stbhE, stbhF, stbhG, stbhH, stbhI
              ] = cols;

              const gender = genderStr?.toLowerCase().includes('nữ') || genderStr?.toLowerCase().includes('nu') || genderStr?.toLowerCase().includes('female') 
                  ? Gender.NU : Gender.NAM;

              const salary = parseMoney(salaryStr);
              
              let geo = Geography.VIETNAM;
              if (geoStr?.toLowerCase().includes('asia') || geoStr?.toLowerCase().includes('châu á')) geo = Geography.CHAU_A;
              if (geoStr?.toLowerCase().includes('global') || geoStr?.toLowerCase().includes('toàn cầu')) geo = Geography.TOAN_CAU;

              // Basic default setup based on parsed data
              const group: InsuranceGroup = {
                  ...defaultBenefits, // Spread defaults
                  id: generateId(),
                  tenNhom: name?.trim() || `Thành viên ${i}`,
                  ngaySinh: parseDate(dob),
                  gioiTinh: gender,
                  soNguoi: 1, soNam: gender === Gender.NAM ? 1 : 0, soNu: gender === Gender.NU ? 1 : 0,
                  tuoiTrungBinh: 0, tongSoTuoi: 0, // Will be calc automatically
                  
                  // Initialize all geos to the import value
                  geoA: geo, geoB: geo, geoC: geo, geoD: geo, geoE: geo, geoF: geo, geoH: geo, geoI: geo,
                  // G defaults to Asia if Asia/Global selected, else Asia
                  geoG: (geo === Geography.VIETNAM) ? Geography.CHAU_A : geo,

                  // Simple copay mapping, default to 0
                  mucDongChiTra: CoPay.MUC_0, 

                  // Map Values if present
                  luongCoBan: salary, // Map unified salary
                  
                  // Logic: If column has value > 0, select that benefit
                  chonQuyenLoiA: parseMoney(stbhA) > 0, stbhA: parseMoney(stbhA) || defaultBenefits.stbhA,
                  chonQuyenLoiB: parseMoney(stbhB) > 0, stbhB: parseMoney(stbhB) || defaultBenefits.stbhB,
                  chonQuyenLoiC: parseMoney(stbhC) > 0, stbhC: parseMoney(stbhC) || defaultBenefits.stbhC,
                  chonQuyenLoiD: parseMoney(stbhD) > 0, stbhD: parseMoney(stbhD) || defaultBenefits.stbhD,
                  chonQuyenLoiE: parseMoney(stbhE) > 0, stbhE: parseMoney(stbhE) || defaultBenefits.stbhE,
                  chonQuyenLoiF: parseMoney(stbhF) > 0, stbhF: parseMoney(stbhF) || defaultBenefits.stbhF,
                  chonQuyenLoiG: parseMoney(stbhG) > 0, stbhG: parseMoney(stbhG) || defaultBenefits.stbhG,
                  chonQuyenLoiH: parseMoney(stbhH) > 0, stbhH: parseMoney(stbhH) || defaultBenefits.stbhH,
                  chonQuyenLoiI: parseMoney(stbhI) > 0, stbhI: parseMoney(stbhI) || defaultBenefits.stbhI,
              };
              
              // Recalc Age
              if (group.ngaySinh) {
                  const check = isValidAgeDate(group.ngaySinh);
                  if (check.valid) group.tuoiTrungBinh = check.age;
              }

              newGroups.push(group);
          }

          if (newGroups.length > 0) {
              if (groups.length === 1 && !groups[0].tenNhom) {
                  onChange(newGroups);
              } else {
                  onChange([...groups, ...newGroups]);
              }
              alert(`Đã nhập thành công ${newGroups.length} thành viên.`);
          } else {
              alert('Không đọc được dữ liệu. Vui lòng kiểm tra file mẫu.');
          }
      };
      reader.readAsText(file);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const inputClass = "w-full text-sm bg-[#F9FAFB] border-[#E0E4EC] text-[#111827] placeholder-[#9CA3AF] rounded-[4px] shadow-sm focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue px-2 py-1.5 border transition-all disabled:bg-gray-100 disabled:text-gray-400";
  const checkboxClass = "w-4 h-4 text-phuhung-blue border-gray-300 rounded focus:ring-phuhung-blue cursor-pointer";

  // Helper for Validation Message
  const ValidationMsg = ({ val, min, max }: { val: number, min: number, max: number }) => {
    if (val < min || val > max) {
        return (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-red-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Hạn mức từ {formatShortMoney(min)} đến {formatShortMoney(max)}</span>
            </div>
        );
    }
    return null;
  };

  // Common wrapper for a benefit card
  const BenefitCard = ({ 
    selected, 
    disabled = false,
    title, 
    code,
    description,
    children, 
    onToggle,
    dependencyText,
    tooltip,
    icon: Icon,
    geoValue, // NEW: Geo Value for this benefit
    onGeoChange, // NEW: Handler
    geoOptions // NEW: Filtered Options
  }: any) => (
    <div className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${disabled ? 'bg-gray-50 border-gray-100 opacity-60 shadow-sm' : selected ? 'bg-white border-phuhung-blue shadow-lg shadow-blue-50 ring-1 ring-phuhung-blue/20' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'}`}>
        <div className="flex items-start gap-3 mb-3">
            <div className="pt-0.5">
                <input 
                    type="checkbox" 
                    checked={selected} 
                    disabled={disabled}
                    onChange={(e) => onToggle(e.target.checked)} 
                    className={checkboxClass} 
                />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <label className={`text-sm font-bold flex items-center ${selected ? 'text-phuhung-blue' : 'text-gray-700'}`}>
                        {Icon && <Icon className={`w-4 h-4 mr-1.5 ${selected ? 'text-phuhung-blue' : 'text-gray-400'}`} />}
                        <span>{code}. {title}</span>
                        {tooltip && <TooltipHelp content={tooltip} />}
                    </label>
                    {/* Render Geo Select if selected */}
                    {selected && geoValue && onGeoChange && (
                        <div className="ml-auto mr-6">
                            <GeoSelect value={geoValue} onChange={onGeoChange} options={geoOptions} />
                        </div>
                    )}
                    {selected && !geoValue && <Check className="w-4 h-4 text-phuhung-blue" />}
                </div>
                {description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>}
                {disabled && dependencyText && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded w-fit">
                        <Info className="w-3 h-3" /> {dependencyText}
                    </div>
                )}
            </div>
        </div>
        
        {selected && (
            <div className="mt-auto pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1">
                {children}
            </div>
        )}
    </div>
  );

  // Modal or Panel for editing details
  const renderEditBenefits = (group: InsuranceGroup) => {
    const hasA = group.chonQuyenLoiA;
    const hasC = group.chonQuyenLoiC;
    const isIndividual = contractType === ContractType.CAN_HAN;
    
    let isFemale = group.gioiTinh === Gender.NU;
    if (group.soNguoi > 1 && group.soNu > 0) isFemale = true; // Group logic fallback

    const disableMaternity = !hasC || (!isFemale && contractType === ContractType.CAN_HAN);
    
    let maternityDependencyText = "Cần chọn Quyền lợi C";
    if (hasC && !isFemale) maternityDependencyText = "Chỉ dành cho Nữ";
    
    // Benefit G checks
    const disableG = !hasC;
    let gDependencyText = "";
    if (!hasC) gDependencyText = "Cần chọn C";

    const hasNoMainBenefit = !group.chonQuyenLoiA && !group.chonQuyenLoiB && !group.chonQuyenLoiC;

    return (
      <div className="mt-4 p-6 bg-[#F5F7FA] rounded-xl border border-gray-200 shadow-inner animate-enter" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span className="bg-phuhung-blue text-white w-6 h-6 rounded flex items-center justify-center text-xs">
                    <Edit3 className="w-3 h-3" />
                </span>
                Cấu Trúc Quyền Lợi Bảo Hiểm
            </h4>
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                Đang chỉnh sửa: <span className="font-semibold text-phuhung-blue">{group.tenNhom || 'Chưa đặt tên'}</span>
            </div>
        </div>

        {/* --- SETTINGS FOR THIS MEMBER (COPAY, SALARY) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-white p-4 rounded-lg border border-gray-200">
             <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
                   <Percent className="w-4 h-4 text-phuhung-blue" /> Mức Đồng Chi Trả
                </label>
                <select 
                    value={group.mucDongChiTra}
                    onChange={(e) => updateGroup(group.id, { mucDongChiTra: e.target.value as CoPay })}
                    className={inputClass}
                >
                    {Object.values(CoPay).map((v) => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
             </div>
             <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5 mb-1.5">
                   <Banknote className="w-4 h-4 text-phuhung-blue" /> Lương Cơ Bản (VND)
                </label>
                <CurrencyInput 
                    value={group.luongCoBan} 
                    onChange={(val) => updateGroup(group.id, { luongCoBan: val })} 
                    className={inputClass}
                    placeholder="Nhập lương cơ bản..."
                />
                <p className="text-[10px] text-gray-400 mt-1">Sử dụng cho Quyền lợi A, B và H (nếu chọn theo lương)</p>
             </div>
        </div>
        
        {hasNoMainBenefit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Vui lòng chọn ít nhất 1 Quyền lợi chính (A, B hoặc C)
            </div>
        )}

        <div className="space-y-8">
          {/* BENEFITS CONFIGURATION */}
          
          {/* PART 1: MAIN BENEFITS */}
          <div>
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
                 <span className="text-phuhung-blue font-bold text-base uppercase tracking-wider">I. Quyền Lợi Bảo Hiểm Chính (Phần 1)</span>
                 <TooltipHelp content="Khách hàng bắt buộc phải tham gia ít nhất 1 loại hình Bảo hiểm Chính (A, B hoặc C)." />
             </div>
             <div className="space-y-4">
                 <BenefitCard 
                    code="A" title="Bảo hiểm Tai nạn con người" 
                    icon={ShieldAlert} 
                    selected={group.chonQuyenLoiA} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiA: v })} 
                    tooltip="Gồm 4 quyền lợi: A1 (Tử vong/TTTBVV), A2 (TTBPVV), A3 (Trợ cấp lương), A4 (Chi phí y tế)."
                    geoValue={group.geoA}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoA: v })}
                 >
                    <div className="space-y-4">
                        {/* A1 & A2 Group */}
                        <div className="p-3 bg-blue-50/50 rounded border border-blue-100">
                            {/* Salary Mode Selection */}
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_LUONG })} className="text-phuhung-blue"/><span>Theo Lương</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_SO_TIEN })} className="text-phuhung-blue"/><span>Theo Số Tiền BH</span></label>
                            </div>
                            
                            {group.methodA === BenefitAMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in">
                                    {/* Read-only Salary Field */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Lương cơ bản (VND)</label>
                                        <input type="text" value={formatCurrency(group.luongCoBan)} disabled className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-[4px] px-2 py-1.5 text-sm cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Số tháng (Max 30)</label>
                                        <input type="number" max="30" value={group.soThangLuongA} onChange={(e) => updateGroup(group.id, { soThangLuongA: Math.min(30, Number(e.target.value)) })} className={inputClass} />
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4 animate-in fade-in">
                                    <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label>
                                    <CurrencyInput value={group.stbhA} onChange={(val) => updateGroup(group.id, { stbhA: val })} className={inputClass} />
                                    <ValidationMsg val={group.stbhA} min={BENEFIT_LIMITS.A.min} max={BENEFIT_LIMITS.A.max} />
                                </div>
                            )}

                            {/* Sub Selection A1 A2 */}
                            <div className="space-y-2 pt-2 border-t border-blue-200">
                                <div className="flex items-start gap-2">
                                     <input type="checkbox" checked={group.subA_A1} onChange={(e) => updateGroup(group.id, { subA_A1: e.target.checked })} className="mt-1 checkbox-sm" />
                                     <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subA_A1: !group.subA_A1 })}>A1. Tử vong/Thương tật toàn bộ vĩnh viễn</label>
                                </div>
                                <div className="flex items-start gap-2">
                                     <input type="checkbox" checked={group.subA_A2} onChange={(e) => updateGroup(group.id, { subA_A2: e.target.checked })} className="mt-1 checkbox-sm" />
                                     <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subA_A2: !group.subA_A2 })}>A2. Thương tật bộ phận vĩnh viễn</label>
                                </div>
                            </div>
                        </div>

                        {/* A3 & A4 Selection */}
                        <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                             {/* A3 */}
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_TroCap} onChange={(e) => updateGroup(group.id, { subA_TroCap: e.target.checked })} className="mt-1 checkbox-sm" />
                                 <div className="flex-1">
                                     <div className="flex items-center cursor-pointer" onClick={() => updateGroup(group.id, { subA_TroCap: !group.subA_TroCap })}>
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">A3. Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời</label>
                                     </div>
                                     {group.subA_TroCap && (
                                         <div className="mt-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1">
                                             <select value={group.subA_TroCap_Option} onChange={(e) => updateGroup(group.id, { subA_TroCap_Option: e.target.value as BenefitASalaryOption })} className={inputClass}><option value={BenefitASalaryOption.OP_3_5}>Gói 3-5 tháng</option><option value={BenefitASalaryOption.OP_6_9}>Gói 6-9 tháng</option><option value={BenefitASalaryOption.OP_10_12}>Gói 10-12 tháng</option></select>
                                             <input type="number" value={group.soThangLuongTroCap} onChange={(e) => updateGroup(group.id, { soThangLuongTroCap: Number(e.target.value) })} className={inputClass} placeholder="Số tháng" />
                                         </div>
                                     )}
                                 </div>
                             </div>
                             
                             {/* A4 */}
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_YTe} onChange={(e) => updateGroup(group.id, { subA_YTe: e.target.checked })} className="mt-1 checkbox-sm" />
                                 <div className="flex-1">
                                     <div className="flex items-center cursor-pointer" onClick={() => updateGroup(group.id, { subA_YTe: !group.subA_YTe })}>
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">A4. Chi phí y tế, chi phí vận chuyển cấp cứu (loại trừ đường hàng không)</label>
                                     </div>
                                     {group.subA_YTe && (
                                         <div className="mt-2 animate-in slide-in-from-top-1 space-y-2">
                                             {/* A4 Program Select */}
                                             <select 
                                                value={group.subA_YTe_Program}
                                                onChange={(e) => updateGroup(group.id, { subA_YTe_Program: e.target.value as BenefitA4Program })}
                                                className={inputClass}
                                             >
                                                 {Object.entries(A4_PROGRAMS).map(([key, p]) => (
                                                     <option key={key} value={key}>{p.label}</option>
                                                 ))}
                                             </select>
                                             
                                             <div className="relative">
                                                <CurrencyInput 
                                                    value={group.stbhA_YTe} 
                                                    onChange={(val) => updateGroup(group.id, { stbhA_YTe: val })} 
                                                    className={inputClass} 
                                                    placeholder="Nhập hạn mức A4..." 
                                                />
                                                {/* Range Validation */}
                                                <ValidationMsg val={group.stbhA_YTe} min={A4_PROGRAMS[group.subA_YTe_Program || BenefitA4Program.P1].min} max={A4_PROGRAMS[group.subA_YTe_Program || BenefitA4Program.P1].max} />
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="B" title="Chết do ốm đau, bệnh tật" 
                    icon={HeartPulse} 
                    selected={group.chonQuyenLoiB} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiB: v })}
                    tooltip="Bảo hiểm tử vong do ốm đau, bệnh tật, thai sản (không bao gồm tai nạn). STBH từ 10 triệu đến 5 tỷ đồng."
                    geoValue={group.geoB}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoB: v })}
                 >
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50/50 rounded border border-red-100">
                            {/* Salary Mode Selection */}
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodB_${group.id}`} checked={group.methodB === BenefitBMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodB: BenefitBMethod.THEO_LUONG })} className="text-phuhung-blue"/><span>Theo Lương</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodB_${group.id}`} checked={group.methodB === BenefitBMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodB: BenefitBMethod.THEO_SO_TIEN })} className="text-phuhung-blue"/><span>Theo Số Tiền BH</span></label>
                            </div>
                            
                            {group.methodB === BenefitBMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in">
                                    {/* Read-only Salary Field */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Lương cơ bản (VND)</label>
                                        <input type="text" value={formatCurrency(group.luongCoBan)} disabled className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-[4px] px-2 py-1.5 text-sm cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Số tháng (Max 30)</label>
                                        <input type="number" max="30" value={group.soThangLuongB} onChange={(e) => updateGroup(group.id, { soThangLuongB: Math.min(30, Number(e.target.value)) })} className={inputClass} />
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4 animate-in fade-in">
                                    <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label>
                                    <CurrencyInput value={group.stbhB} onChange={(val) => updateGroup(group.id, { stbhB: val })} className={inputClass} />
                                    <ValidationMsg val={group.stbhB} min={BENEFIT_LIMITS.B.min} max={BENEFIT_LIMITS.B.max} />
                                </div>
                            )}
                        </div>
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="C" title="Chi phí y tế nội trú do ốm đau, bệnh tật" 
                    icon={BedDouble} 
                    selected={group.chonQuyenLoiC} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiC: v })}
                    tooltip="Chi trả chi phí nằm viện, phẫu thuật do ốm đau, bệnh tật. Thường là cơ sở cho Thai sản và Trợ cấp."
                    geoValue={group.geoC}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoC: v })}
                 >
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Chọn chương trình</label>
                            <select 
                                value={group.programC}
                                onChange={(e) => updateGroup(group.id, { programC: e.target.value as BenefitCProgram })}
                                className={inputClass}
                            >
                                {Object.entries(C_PROGRAMS).map(([key, p]) => (
                                    <option key={key} value={key}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label>
                            <CurrencyInput value={group.stbhC} onChange={(val) => updateGroup(group.id, { stbhC: val })} className={inputClass} />
                            <ValidationMsg val={group.stbhC} min={C_PROGRAMS[group.programC || BenefitCProgram.P1].min} max={C_PROGRAMS[group.programC || BenefitCProgram.P1].max} />
                        </div>
                    </div>
                 </BenefitCard>
             </div>
          </div>

          {/* PART 2: SUPPLEMENTARY BENEFITS */}
          <div>
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-orange-200">
                 <span className="text-phuhung-orange font-bold text-base uppercase tracking-wider">II. Quyền Lợi Bảo Hiểm Bổ Sung (Phần 2)</span>
                 <TooltipHelp content="Các quyền lợi này có thể tham gia độc lập hoặc phụ thuộc vào C (như Thai sản)." />
             </div>
             <div className="space-y-4">
                 <BenefitCard 
                    code="D" title="Thai sản" 
                    icon={Baby} 
                    selected={group.chonQuyenLoiD} 
                    disabled={disableMaternity} 
                    dependencyText={maternityDependencyText} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiD: v })}
                    tooltip="Chi trả chi phí sinh nở và biến chứng thai sản. Điều kiện: Phải tham gia quyền lợi C, là Nữ."
                    geoValue={group.geoD}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoD: v })}
                 >
                     <CurrencyInput value={group.stbhD} onChange={(val) => updateGroup(group.id, { stbhD: val })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="E" title="Điều trị ngoại trú do ốm đau, bệnh tật" 
                    icon={Stethoscope} 
                    selected={group.chonQuyenLoiE} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiE: v })}
                    tooltip="Chi trả chi phí khám chữa bệnh không nằm viện (thuốc kê đơn, xét nghiệm, X-quang, vật lý trị liệu)."
                    geoValue={group.geoE}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoE: v })}
                 >
                    <CurrencyInput value={group.stbhE} onChange={(val) => updateGroup(group.id, { stbhE: val })} className={inputClass} />
                    <ValidationMsg val={group.stbhE} min={BENEFIT_LIMITS.E.min} max={BENEFIT_LIMITS.E.max} />
                 </BenefitCard>
                 <BenefitCard 
                    code="F" title="Chăm sóc răng" 
                    icon={Smile} 
                    selected={group.chonQuyenLoiF} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiF: v })}
                    tooltip="Chi trả chi phí khám răng, trám răng, nhổ răng, lấy cao răng và điều trị tủy."
                    geoValue={group.geoF}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoF: v })}
                 >
                    <CurrencyInput value={group.stbhF} onChange={(val) => updateGroup(group.id, { stbhF: val })} className={inputClass} />
                    <ValidationMsg val={group.stbhF} min={BENEFIT_LIMITS.F.min} max={BENEFIT_LIMITS.F.max} />
                 </BenefitCard>
                 <BenefitCard 
                    code="G" title="Khám chữa bệnh và điều trị ở nước ngoài" 
                    icon={Plane} 
                    selected={group.chonQuyenLoiG} 
                    disabled={disableG} 
                    dependencyText={gDependencyText} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiG: v })}
                    tooltip="Mở rộng phạm vi địa lý khám chữa bệnh sang Thái Lan và Singapore. Yêu cầu tham gia quyền lợi C."
                    geoValue={group.geoG}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoG: v })}
                    geoOptions={[Geography.CHAU_A, Geography.TOAN_CAU]} // Limit options for G
                 >
                     <CurrencyInput value={group.stbhG} onChange={(val) => updateGroup(group.id, { stbhG: val })} className={inputClass} />
                     <ValidationMsg val={group.stbhG} min={BENEFIT_LIMITS.G.min} max={BENEFIT_LIMITS.G.max} />
                     
                     {/* G - Split Components Checkboxes */}
                     <div className="mt-3 bg-blue-50/50 rounded border border-blue-100 p-3 text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="font-semibold text-phuhung-blue mb-2 text-xs uppercase tracking-wide">Quyền lợi chi tiết:</div>
                        <div className="space-y-2">
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subG_YTe} onChange={(e) => updateGroup(group.id, { subG_YTe: e.target.checked })} className="mt-0.5 cursor-pointer text-blue-600 focus:ring-blue-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subG_YTe: !group.subG_YTe })}>G.1 Chi phí y tế điều trị nội trú</label>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subG_VanChuyen} onChange={(e) => updateGroup(group.id, { subG_VanChuyen: e.target.checked })} className="mt-0.5 cursor-pointer text-blue-600 focus:ring-blue-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subG_VanChuyen: !group.subG_VanChuyen })}>G.2 Chi phí vận chuyển cấp cứu</label>
                                     </div>
                                 </div>
                             </div>
                        </div>
                     </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="H" title="Trợ cấp mất giảm thu nhập" 
                    icon={Wallet} 
                    selected={group.chonQuyenLoiH} 
                    disabled={!hasC} 
                    dependencyText="Cần chọn C" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiH: v })}
                    tooltip="Trợ cấp lương trong thời gian nằm viện điều trị do ốm đau, bệnh tật. Yêu cầu đã tham gia quyền lợi C."
                    geoValue={group.geoH}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoH: v })}
                 >
                    <div className="flex gap-2 mb-2">
                        <label className="flex items-center text-xs"><input type="radio" checked={group.methodH === BenefitHMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_LUONG })} className="mr-1"/> Lương</label>
                        <label className="flex items-center text-xs"><input type="radio" checked={group.methodH === BenefitHMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_SO_TIEN })} className="mr-1"/> STBH</label>
                    </div>
                    {group.methodH === BenefitHMethod.THEO_LUONG ? (
                        <div className="grid grid-cols-2 gap-2">
                            {/* Read only salary */}
                            <input type="text" value={formatShortMoney(group.luongCoBan)} disabled className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-[4px] px-2 py-1.5 text-xs cursor-not-allowed" title="Lương cơ bản" />
                            <select value={group.soThangLuong} onChange={(e) => updateGroup(group.id, { soThangLuong: Number(e.target.value) })} className={inputClass}><option value={3}>3 tháng</option><option value={6}>6 tháng</option><option value={9}>9 tháng</option><option value={12}>12 tháng</option></select>
                        </div>
                    ) : (
                        <CurrencyInput value={group.stbhH} onChange={(val) => updateGroup(group.id, { stbhH: val })} className={inputClass} />
                    )}
                    <ValidationMsg val={group.stbhH} min={BENEFIT_LIMITS.H.min} max={BENEFIT_LIMITS.H.max} />

                    {/* H - Split Components Checkboxes */}
                    <div className="mt-3 bg-orange-50/50 rounded border border-orange-100 p-3 text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="font-semibold text-phuhung-orange mb-2 text-xs uppercase tracking-wide">Quyền lợi chi tiết:</div>
                        <div className="space-y-2">
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subH_NamVien} onChange={(e) => updateGroup(group.id, { subH_NamVien: e.target.checked })} className="mt-0.5 cursor-pointer text-orange-600 focus:ring-orange-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subH_NamVien: !group.subH_NamVien })}>H.1 Trợ cấp nằm viện</label>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subH_PhauThuat} onChange={(e) => updateGroup(group.id, { subH_PhauThuat: e.target.checked })} className="mt-0.5 cursor-pointer text-orange-600 focus:ring-orange-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subH_PhauThuat: !group.subH_PhauThuat })}>H.2 Trợ cấp phẫu thuật</label>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="I" title="Ngộ độc thức ăn, đồ uống, hít phải khí độc" 
                    icon={Utensils} 
                    selected={group.chonQuyenLoiI} 
                    disabled={!hasA} 
                    dependencyText="Cần chọn A" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiI: v })}
                    tooltip="Chi trả cho rủi ro ngộ độc thức ăn, hít phải khí độc. Yêu cầu đã tham gia quyền lợi A (Tai nạn)."
                    geoValue={group.geoI}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoI: v })}
                 >
                    <CurrencyInput value={group.stbhI} onChange={(val) => updateGroup(group.id, { stbhI: val })} className={inputClass} />
                    <ValidationMsg val={group.stbhI} min={BENEFIT_LIMITS.I.min} max={BENEFIT_LIMITS.I.max} />
                    
                    {/* I - Split Components Checkboxes (Added per request) */}
                     <div className="mt-3 bg-red-50/50 rounded border border-red-100 p-3 text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="font-semibold text-red-600 mb-2 text-xs uppercase tracking-wide">Quyền lợi chi tiết:</div>
                        <div className="space-y-2">
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subI_TuVong} onChange={(e) => updateGroup(group.id, { subI_TuVong: e.target.checked })} className="mt-0.5 cursor-pointer text-red-600 focus:ring-red-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subI_TuVong: !group.subI_TuVong })}>I.1 Tử vong/Thương tật toàn bộ vĩnh viễn</label>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subI_TroCap} onChange={(e) => updateGroup(group.id, { subI_TroCap: e.target.checked })} className="mt-0.5 cursor-pointer text-red-600 focus:ring-red-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subI_TroCap: !group.subI_TroCap })}>I.2 Trợ cấp lương ngày</label>
                                     </div>
                                 </div>
                             </div>
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subI_YTe} onChange={(e) => updateGroup(group.id, { subI_YTe: e.target.checked })} className="mt-0.5 cursor-pointer text-red-600 focus:ring-red-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subI_YTe: !group.subI_YTe })}>I.3 Chi phí y tế, vận chuyển cấp cứu</label>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                 </BenefitCard>
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-8 border-t border-gray-200">
            <button onClick={() => setEditingId(null)} className="bg-phuhung-blue text-white px-8 py-2.5 rounded-lg hover:bg-phuhung-blueHover text-sm font-bold shadow-lg flex items-center gap-2">
                <Check className="w-4 h-4" /> Hoàn Tất Chọn Quyền Lợi
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 animate-enter" style={{ animationDelay: '0ms' }}>
           <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-full">
                    {contractType === ContractType.NHOM ? <Users className="w-5 h-5 text-phuhung-blue" /> : <User className="w-5 h-5 text-phuhung-blue" />}
                </div>
                <h2 className="text-xl font-bold text-phuhung-blue">2. Danh Sách Người Được Bảo Hiểm</h2>
           </div>
           
           {/* IMPORT TOOLS */}
           <div className="flex gap-2">
                <button 
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 hover:text-phuhung-blue transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Tải mẫu nhập
                </button>
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <button 
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 shadow-sm transition-colors"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Nhập danh sách
                    </button>
                </div>
           </div>
       </div>

       {/* GROUP MODE DASHBOARD */}
       {contractType === ContractType.NHOM && (
           <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-white shadow-md flex items-center justify-between mb-4 animate-enter" style={{ animationDelay: '50ms' }}>
               <div className="flex items-center gap-3">
                   <div className="bg-white/20 p-2 rounded-full">
                       <Calculator className="w-6 h-6" />
                   </div>
                   <div>
                       <div className="text-xs text-blue-100 uppercase font-semibold">Thống kê nhóm (Hệ thống tự tính)</div>
                       <div className="text-sm">Tổng hợp số liệu từ danh sách bên dưới</div>
                   </div>
               </div>
               <div className="flex gap-8 text-center">
                   <div>
                       <div className="text-3xl font-bold leading-none">{groupStats.totalPeople}</div>
                       <div className="text-[10px] opacity-80 uppercase mt-1">Thành viên</div>
                   </div>
                   <div className="h-10 w-px bg-white/20"></div>
                   <div>
                       <div className="text-3xl font-bold leading-none">{groupStats.avgAge}</div>
                       <div className="text-[10px] opacity-80 uppercase mt-1">Tuổi trung bình</div>
                   </div>
               </div>
           </div>
       )}

       {groups.map((group, index) => (
          <div key={group.id} className="bg-white p-6 rounded-[8px] border border-phuhung-border shadow-sm hover:shadow-md transition-shadow animate-enter" style={{ animationDelay: `${100 + (index * 50)}ms` }}>
              {/* Row: Render inputs same for Individual AND Group (Listing individuals) */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Name Input */}
                      <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                             <User className="w-3 h-3" /> Họ Tên
                          </label>
                          <input 
                              type="text" 
                              value={group.tenNhom}
                              onChange={(e) => updateGroup(group.id, { tenNhom: e.target.value })}
                              placeholder="Nguyễn Văn A"
                              className={inputClass}
                          />
                      </div>

                      {/* DOB Input (Required for Avg Age Calc) */}
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                              Ngày Sinh
                          </label>
                          <input 
                              type="date"
                              value={group.ngaySinh || ''}
                              onChange={(e) => updateGroup(group.id, { ngaySinh: e.target.value })}
                              className={`${inputClass} ${
                                  group.ngaySinh && !isValidAgeDate(group.ngaySinh).valid ? 'border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500' : ''
                              }`}
                          />
                          {/* Display Age Preview */}
                          {group.ngaySinh && isValidAgeDate(group.ngaySinh).valid ? (
                             <div className="text-[10px] text-gray-500 mt-1 text-right">
                                 {isValidAgeDate(group.ngaySinh).age} tuổi
                             </div>
                          ) : group.ngaySinh && (
                              <span className="text-[10px] text-red-500 mt-1 block">
                                  {isValidAgeDate(group.ngaySinh).error}
                              </span>
                          )}
                      </div>

                      {/* Gender Selection */}
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                              Giới Tính
                          </label>
                          <select
                              value={group.gioiTinh}
                              onChange={(e) => updateGroup(group.id, { gioiTinh: e.target.value as Gender })}
                              className={inputClass}
                          >
                              <option value={Gender.NAM}>Nam</option>
                              <option value={Gender.NU}>Nữ</option>
                          </select>
                      </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 md:pt-0 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 min-w-[140px] justify-end">
                      <button 
                          onClick={() => duplicateGroup(group.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Sao chép"
                      >
                          <Copy className="w-4 h-4" />
                      </button>

                      <button 
                          onClick={() => setEditingId(editingId === group.id ? null : group.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              editingId === group.id 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                          {editingId === group.id ? <ChevronDown className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          {editingId === group.id ? 'Đóng' : 'Chọn QL'}
                      </button>

                      <button 
                          onClick={() => removeGroup(group.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
              </div>

              {/* Edit Panel */}
              {editingId === group.id && renderEditBenefits(group)}
          </div>
       ))}

       {/* Add Button */}
       <button 
          onClick={addGroup}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-phuhung-blue hover:text-phuhung-blue hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium animate-enter" style={{ animationDelay: `${100 + (groups.length * 50)}ms` }}
       >
          <PlusCircle className="w-5 h-5" />
          {contractType === ContractType.NHOM ? 'Thêm Thành Viên Vào Nhóm' : 'Thêm Người Được Bảo Hiểm'}
       </button>
    </div>
  );
};

export default InsuredList;