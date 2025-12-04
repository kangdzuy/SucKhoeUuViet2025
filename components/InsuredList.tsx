import React, { useState, useEffect, useMemo, useRef } from 'react';
import { InsuranceGroup, Gender, ContractType, BenefitHMethod, BenefitAMethod, BenefitASalaryOption } from '../types';
import { isValidAgeDate } from '../services/calculationService';
import { BENEFIT_LIMITS } from '../constants';
import { 
  Trash2, PlusCircle, Edit3, Users, User, AlertCircle, Info, ChevronDown, Check,
  ShieldAlert, HeartPulse, BedDouble, Baby, Stethoscope, Smile, Plane, Wallet, Utensils, Calculator,
  Upload, Download, FileText, Copy
} from 'lucide-react';
import TooltipHelp from './TooltipHelp';

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

const InsuredList: React.FC<Props> = ({ groups, contractType, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default Benefit Template
  const defaultBenefits = {
    chonQuyenLoiA: false, 
    methodA: BenefitAMethod.THEO_SO_TIEN,
    luongA: 10000000,
    soThangLuongA: 24,
    stbhA: 100000000,
    subA_TroCap: false,
    subA_TroCap_Option: BenefitASalaryOption.OP_3_5,
    soThangLuongTroCap: 5, // Default for OP_3_5
    subA_YTe: false,
    stbhA_YTe: 20000000,

    chonQuyenLoiB: false, stbhB: 100000000,
    chonQuyenLoiC: false, stbhC: 40000000,
    chonQuyenLoiD: false, stbhD: 10000000,
    chonQuyenLoiE: false, stbhE: 5000000,
    chonQuyenLoiF: false, stbhF: 2000000,
    chonQuyenLoiG: false, stbhG: 50000000,
    
    chonQuyenLoiH: false, 
    methodH: BenefitHMethod.THEO_LUONG,
    luongTrungBinh: 10000000,
    soThangLuong: 3,
    stbhH: 30000000,
    
    chonQuyenLoiI: false, stbhI: 20000000,
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
            id: crypto.randomUUID(),
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
    // Default: Add a single person regardless of contract type
    // This supports "Listing individual members" in Group mode
    const newGroup: InsuranceGroup = {
      id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
      // This ensures compatibility if we switch logic later
      if (updated.soNguoi === 1 && updated.gioiTinh) {
          if (updated.gioiTinh === Gender.NAM) { updated.soNam = 1; updated.soNu = 0; }
          else { updated.soNam = 0; updated.soNu = 1; }
      }

      // 3. Benefit H SI Calculation (If By Salary)
      if (updated.chonQuyenLoiH && updated.methodH === BenefitHMethod.THEO_LUONG) {
          updated.stbhH = (updated.luongTrungBinh || 0) * (updated.soThangLuong || 0);
      }
      
      // 4. Benefit A Main SI Calculation (If By Salary)
      if (updated.chonQuyenLoiA && updated.methodA === BenefitAMethod.THEO_LUONG) {
          updated.stbhA = (updated.luongA || 0) * (updated.soThangLuongA || 0);
      }

      return updated;
    }));
  };

  // --- IMPORT / EXPORT LOGIC ---

  const handleDownloadTemplate = () => {
    // Definitive columns for full calculation
    const headers = [
      "Họ và tên",
      "Ngày sinh (dd/mm/yyyy)",
      "Giới tính (Nam/Nữ)",
      "A-Có tham gia? (C/K)",
      "A-Số Tiền BH (VNĐ)",
      "A-Lương (Nếu theo lương)",
      "A-Số tháng lương (Nếu theo lương)",
      "A-Trợ cấp? (C/K)",
      "A-Gói Trợ cấp (3-5/6-9/10-12)",
      "A-Y tế? (C/K)",
      "A-Y tế Số tiền",
      "B-Có tham gia? (C/K)",
      "B-Số Tiền BH",
      "C-Có tham gia? (C/K)",
      "C-Số Tiền BH",
      "D-Thai sản? (C/K)",
      "D-Số Tiền BH",
      "E-Ngoại trú? (C/K)",
      "E-Số Tiền BH",
      "F-Nha khoa? (C/K)",
      "F-Số Tiền BH",
      "G-Nước ngoài? (C/K)",
      "G-Số Tiền BH",
      "H-Trợ cấp thu nhập? (C/K)",
      "H-Số Tiền BH",
      "H-Lương (Nếu theo lương)",
      "H-Số tháng lương (3/6/9/12)",
      "I-Ngộ độc? (C/K)",
      "I-Số Tiền BH"
    ];
    
    // Create an example row
    const example = [
      "Nguyen Van A", "01/01/1990", "Nam", 
      "C", "100000000", "", "", "K", "", "C", "10000000", 
      "C", "100000000", 
      "C", "60000000", 
      "K", "", 
      "C", "10000000", 
      "K", "", 
      "K", "", 
      "K", "", "", "", 
      "K", ""
    ].join(",");

    const bom = "\uFEFF"; // UTF-8 BOM
    const csvContent = bom + headers.join(",") + "\n" + example;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Mau_Chi_Tiet_Uu_Viet.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust Date Parser to handle CSV variations
  const parseDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // 1. Clean quotes and spaces
    const cleanStr = dateStr.trim().replace(/^["']|["']$/g, '');
    
    // 2. Try ISO format (yyyy-mm-dd) which input[type="date"] uses
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) return cleanStr;

    // 3. Try splitting by /, -, or .
    const parts = cleanStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const p0 = parts[0];
      const p1 = parts[1].padStart(2, '0');
      const p2 = parts[2];

      // yyyy-mm-dd
      if (p0.length === 4) {
          return `${p0}-${p1}-${p2.padStart(2, '0')}`;
      }
      // dd/mm/yyyy (Prioritize d/m/y format)
      if (p2.length === 4) {
          return `${p2}-${p1}-${p0.padStart(2, '0')}`;
      }
      // dd/mm/yy (Handle 2 digit year) - Assume 20xx for small numbers, 19xx for large
      if (p2.length === 2) {
          const y = parseInt(p2, 10);
          const prefix = y < 50 ? '20' : '19'; 
          return `${prefix}${p2}-${p1}-${p0.padStart(2, '0')}`;
      }
    }
    return '';
  };

  const parseBool = (str: string): boolean => {
      if (!str) return false;
      const s = str.trim().toLowerCase().replace(/^["']|["']$/g, '');
      return s === 'c' || s === 'co' || s === 'có' || s === 'y' || s === 'yes' || s === '1' || s === 'true';
  };

  const parseMoney = (str: string): number => {
      if (!str) return 0;
      // Remove quotes, commas (if thousand sep), dots (if thousand sep), and non-digits
      // Warning: dot can be decimal. But in VND context usually integer.
      // Safer: remove all non digit.
      const numStr = str.replace(/[^0-9]/g, '');
      return parseInt(numStr, 10) || 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      // Handle universal newlines (Win/Mac/Linux)
      const lines = text.split(/\r\n|\n|\r/);
      if (lines.length < 2) return; // Empty or header only

      // AUTO DETECT SEPARATOR from header row
      // Count commas vs semicolons in the first line
      const headerLine = lines[0];
      const commaCount = (headerLine.match(/,/g) || []).length;
      const semiCount = (headerLine.match(/;/g) || []).length;
      const separator = semiCount > commaCount ? ';' : ',';

      // Helper to parse a CSV line respecting quotes
      const parseLine = (line: string): string[] => {
         const res: string[] = [];
         let cur = '';
         let inQuote = false;
         for (let i = 0; i < line.length; i++) {
             const char = line[i];
             if (char === '"') {
                 inQuote = !inQuote;
             } else if (char === separator && !inQuote) {
                 res.push(cur); 
                 cur = '';
             } else {
                 cur += char;
             }
         }
         res.push(cur);
         // Clean up quotes around value and double quotes inside
         return res.map(val => {
             const trimmed = val.trim();
             if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                 return trimmed.slice(1, -1).replace(/""/g, '"');
             }
             return trimmed;
         });
      };

      const newItems: InsuranceGroup[] = [];
      let successCount = 0;

      // Skip header row (index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Use smart parser
        const cols = parseLine(line);
        
        // Basic Info
        const name = cols[0];
        if (!name) continue;

        const dobRaw = cols[1];
        const genderRaw = (cols[2] || '').toLowerCase();
        const dob = parseDate(dobRaw);
        const gender = (genderRaw === 'nữ' || genderRaw === 'nu' || genderRaw === 'f') ? Gender.NU : Gender.NAM;
        
        let age = 0;
        if (dob) {
            const check = isValidAgeDate(dob);
            if (check.valid) age = check.age;
        }

        // --- PARSE BENEFITS ---
        // Indices matching the Header array in handleDownloadTemplate
        
        // Benefit A
        const hasA = parseBool(cols[3]);
        const stbhA = parseMoney(cols[4]);
        const luongA = parseMoney(cols[5]);
        const thangA = parseMoney(cols[6]);
        const methodA = (luongA > 0) ? BenefitAMethod.THEO_LUONG : BenefitAMethod.THEO_SO_TIEN;
        
        const hasA_Sub1 = parseBool(cols[7]);
        let optA_Sub1 = BenefitASalaryOption.OP_3_5;
        const optRaw = cols[8] || '';
        if (optRaw.includes('6-9')) optA_Sub1 = BenefitASalaryOption.OP_6_9;
        if (optRaw.includes('10-12')) optA_Sub1 = BenefitASalaryOption.OP_10_12;
        
        const hasA_Sub2 = parseBool(cols[9]);
        const stbhA_Sub2 = parseMoney(cols[10]);

        // Benefit B
        const hasB = parseBool(cols[11]);
        const stbhB = parseMoney(cols[12]);

        // Benefit C
        const hasC = parseBool(cols[13]);
        const stbhC = parseMoney(cols[14]);

        // Benefit D
        const hasD = parseBool(cols[15]);
        const stbhD = parseMoney(cols[16]);

        // Benefit E
        const hasE = parseBool(cols[17]);
        const stbhE = parseMoney(cols[18]);

        // Benefit F
        const hasF = parseBool(cols[19]);
        const stbhF = parseMoney(cols[20]);

        // Benefit G
        const hasG = parseBool(cols[21]);
        const stbhG = parseMoney(cols[22]);

        // Benefit H
        const hasH = parseBool(cols[23]);
        const stbhH = parseMoney(cols[24]);
        const luongH = parseMoney(cols[25]);
        const thangH = parseMoney(cols[26]);
        const methodH = (luongH > 0) ? BenefitHMethod.THEO_LUONG : BenefitHMethod.THEO_SO_TIEN;

        // Benefit I
        const hasI = parseBool(cols[27]);
        const stbhI = parseMoney(cols[28]);


        const newItem: InsuranceGroup = {
            id: crypto.randomUUID(),
            tenNhom: name,
            soNguoi: 1,
            soNam: gender === Gender.NAM ? 1 : 0,
            soNu: gender === Gender.NU ? 1 : 0,
            tongSoTuoi: 0,
            tuoiTrungBinh: age,
            ngaySinh: dob,
            gioiTinh: gender,
            
            // Mapped Props
            chonQuyenLoiA: hasA,
            methodA: methodA,
            luongA: luongA || defaultBenefits.luongA,
            soThangLuongA: thangA || defaultBenefits.soThangLuongA,
            stbhA: stbhA || defaultBenefits.stbhA,
            
            subA_TroCap: hasA_Sub1,
            subA_TroCap_Option: optA_Sub1,
            soThangLuongTroCap: 5, // Defaulting as csv doesn't have exact months, just package
            subA_YTe: hasA_Sub2,
            stbhA_YTe: stbhA_Sub2 || defaultBenefits.stbhA_YTe,

            chonQuyenLoiB: hasB,
            stbhB: stbhB || defaultBenefits.stbhB,

            chonQuyenLoiC: hasC,
            stbhC: stbhC || defaultBenefits.stbhC,

            chonQuyenLoiD: hasD,
            stbhD: stbhD || defaultBenefits.stbhD,

            chonQuyenLoiE: hasE,
            stbhE: stbhE || defaultBenefits.stbhE,

            chonQuyenLoiF: hasF,
            stbhF: stbhF || defaultBenefits.stbhF,

            chonQuyenLoiG: hasG,
            stbhG: stbhG || defaultBenefits.stbhG,

            chonQuyenLoiH: hasH,
            methodH: methodH,
            luongTrungBinh: luongH || defaultBenefits.luongTrungBinh,
            soThangLuong: thangH || defaultBenefits.soThangLuong,
            stbhH: stbhH || defaultBenefits.stbhH,

            chonQuyenLoiI: hasI,
            stbhI: stbhI || defaultBenefits.stbhI,
        };
        newItems.push(newItem);
        successCount++;
      }

      if (successCount > 0) {
        // If the list only had the default empty item, replace it. Otherwise append.
        if (groups.length === 1 && !groups[0].tenNhom && !groups[0].ngaySinh) {
             onChange(newItems);
        } else {
             onChange([...groups, ...newItems]);
        }
        alert(`Đã nhập thành công ${successCount} dòng dữ liệu.`);
      } else {
        alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra file mẫu.");
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
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
    colSpan = "",
    tooltip,
    icon: Icon
  }: any) => (
    <div className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${disabled ? 'bg-gray-50 border-gray-100 opacity-60 shadow-sm' : selected ? 'bg-white border-phuhung-blue shadow-lg shadow-blue-50 ring-1 ring-phuhung-blue/20' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'} ${colSpan}`}>
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
                    {selected && <Check className="w-4 h-4 text-phuhung-blue" />}
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

  const getAllowanceRange = (op: BenefitASalaryOption) => {
    switch(op) {
        case BenefitASalaryOption.OP_6_9: return { min: 6, max: 9 };
        case BenefitASalaryOption.OP_10_12: return { min: 10, max: 12 };
        default: return { min: 3, max: 5 }; // OP_3_5
    }
  };

  // Modal or Panel for editing details
  const renderEditBenefits = (group: InsuranceGroup) => {
    const hasA = group.chonQuyenLoiA;
    const hasC = group.chonQuyenLoiC;
    const isIndividual = contractType === ContractType.CAN_HAN;
    
    // Logic: In Group mode, we are listing individuals, so we treat row checks like individuals
    // unless soNguoi > 1 (which shouldn't happen often if listing individually).
    // However, if we list individually, we check Gender directly.
    
    // Determine if this specific row is Female for Maternity
    let isFemale = group.gioiTinh === Gender.NU;
    if (group.soNguoi > 1 && group.soNu > 0) isFemale = true; // Group logic fallback

    const disableMaternity = !hasC || (!isFemale && contractType === ContractType.CAN_HAN);
    
    let maternityDependencyText = "Cần chọn Quyền lợi C";
    if (hasC && !isFemale) maternityDependencyText = "Chỉ dành cho Nữ";

    const hasNoMainBenefit = !group.chonQuyenLoiA && !group.chonQuyenLoiB && !group.chonQuyenLoiC;

    return (
      <div className="mt-4 p-6 bg-[#F5F7FA] rounded-xl border border-gray-200 shadow-inner animate-in fade-in zoom-in-95 duration-200">
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
        
        {hasNoMainBenefit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Vui lòng chọn ít nhất 1 Quyền lợi chính (A, B hoặc C)
            </div>
        )}

        <div className="space-y-8">
          {/* BENEFITS CONFIGURATION (Same as before, abbreviated for update) */}
          
          {/* PART 1: MAIN BENEFITS */}
          <div>
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
                 <span className="text-phuhung-blue font-bold text-base uppercase tracking-wider">I. Quyền Lợi Bảo Hiểm Chính (Phần 1)</span>
                 <TooltipHelp content="Khách hàng bắt buộc phải tham gia ít nhất 1 loại hình Bảo hiểm Chính (A, B hoặc C)." />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <BenefitCard 
                    code="A" title="Tai Nạn" 
                    icon={ShieldAlert} 
                    selected={group.chonQuyenLoiA} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiA: v })} 
                    colSpan="col-span-1 md:col-span-2 lg:col-span-2"
                    tooltip="Bảo hiểm cho rủi ro tai nạn. STBH từ 10 triệu đến 5 tỷ đồng."
                 >
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50/50 rounded border border-blue-100">
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_LUONG })} className="text-phuhung-blue"/><span>Theo Lương</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_SO_TIEN })} className="text-phuhung-blue"/><span>Theo Số Tiền BH</span></label>
                            </div>
                            {group.methodA === BenefitAMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500 block mb-1">Lương (VND)</label><input type="number" value={group.luongA} onChange={(e) => updateGroup(group.id, { luongA: Number(e.target.value) })} className={inputClass} /></div>
                                    <div><label className="text-xs text-gray-500 block mb-1">Số tháng (Max 30)</label><input type="number" max="30" value={group.soThangLuongA} onChange={(e) => updateGroup(group.id, { soThangLuongA: Math.min(30, Number(e.target.value)) })} className={inputClass} /></div>
                                </div>
                            ) : (
                                <div><label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label><input type="number" value={group.stbhA} onChange={(e) => updateGroup(group.id, { stbhA: Number(e.target.value) })} className={inputClass} /><ValidationMsg val={group.stbhA} min={BENEFIT_LIMITS.A.min} max={BENEFIT_LIMITS.A.max} /></div>
                            )}
                        </div>
                        <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_TroCap} onChange={(e) => updateGroup(group.id, { subA_TroCap: e.target.checked })} className="mt-1" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700">Trợ cấp lương</label>
                                        <TooltipHelp content="Quyền lợi mở rộng của A: Trợ cấp trong thời gian điều trị tai nạn." />
                                     </div>
                                     {group.subA_TroCap && (
                                         <div className="mt-2 grid grid-cols-2 gap-2">
                                             <select value={group.subA_TroCap_Option} onChange={(e) => updateGroup(group.id, { subA_TroCap_Option: e.target.value as BenefitASalaryOption })} className={inputClass}><option value={BenefitASalaryOption.OP_3_5}>Gói 3-5 tháng</option><option value={BenefitASalaryOption.OP_6_9}>Gói 6-9 tháng</option><option value={BenefitASalaryOption.OP_10_12}>Gói 10-12 tháng</option></select>
                                             <input type="number" value={group.soThangLuongTroCap} onChange={(e) => updateGroup(group.id, { soThangLuongTroCap: Number(e.target.value) })} className={inputClass} placeholder="Số tháng" />
                                         </div>
                                     )}
                                 </div>
                             </div>
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_YTe} onChange={(e) => updateGroup(group.id, { subA_YTe: e.target.checked })} className="mt-1" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700">Chi phí y tế</label>
                                        <TooltipHelp content="Quyền lợi mở rộng của A: Chi trả chi phí y tế thực tế phát sinh do tai nạn." />
                                     </div>
                                     {group.subA_YTe && (<input type="number" value={group.stbhA_YTe} onChange={(e) => updateGroup(group.id, { stbhA_YTe: Number(e.target.value) })} className={inputClass} />)}
                                 </div>
                             </div>
                        </div>
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="B" title="Tử vong (Ốm đau)" 
                    icon={HeartPulse} 
                    selected={group.chonQuyenLoiB} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiB: v })}
                    tooltip="Bảo hiểm tử vong do ốm đau, bệnh tật, thai sản (không bao gồm tai nạn). STBH từ 10 triệu đến 5 tỷ đồng."
                 >
                    <input type="number" value={group.stbhB} onChange={(e) => updateGroup(group.id, { stbhB: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="C" title="Nội Trú" 
                    icon={BedDouble} 
                    selected={group.chonQuyenLoiC} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiC: v })}
                    tooltip="Chi trả chi phí nằm viện, phẫu thuật do ốm đau, bệnh tật. Thường là cơ sở cho Thai sản và Trợ cấp."
                 >
                    <input type="number" value={group.stbhC} onChange={(e) => updateGroup(group.id, { stbhC: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
             </div>
          </div>

          {/* PART 2: SUPPLEMENTARY BENEFITS */}
          <div>
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-orange-200">
                 <span className="text-phuhung-orange font-bold text-base uppercase tracking-wider">II. Quyền Lợi Bảo Hiểm Bổ Sung (Phần 2)</span>
                 <TooltipHelp content="Các quyền lợi này có thể tham gia độc lập hoặc phụ thuộc vào C (như Thai sản)." />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <BenefitCard 
                    code="D" title="Thai Sản" 
                    icon={Baby} 
                    selected={group.chonQuyenLoiD} 
                    disabled={disableMaternity} 
                    dependencyText={maternityDependencyText} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiD: v })}
                    tooltip="Chi trả chi phí sinh nở và biến chứng thai sản. Điều kiện: Phải tham gia quyền lợi C, là Nữ."
                 >
                     <input type="number" value={group.stbhD} onChange={(e) => updateGroup(group.id, { stbhD: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="E" title="Ngoại Trú" 
                    icon={Stethoscope} 
                    selected={group.chonQuyenLoiE} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiE: v })}
                    tooltip="Chi trả chi phí khám chữa bệnh không nằm viện (thuốc kê đơn, xét nghiệm, X-quang, vật lý trị liệu)."
                 >
                    <input type="number" value={group.stbhE} onChange={(e) => updateGroup(group.id, { stbhE: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="F" title="Nha Khoa" 
                    icon={Smile} 
                    selected={group.chonQuyenLoiF} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiF: v })}
                    tooltip="Chi trả chi phí khám răng, trám răng, nhổ răng, lấy cao răng và điều trị tủy."
                 >
                    <input type="number" value={group.stbhF} onChange={(e) => updateGroup(group.id, { stbhF: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="G" title="Nước Ngoài" 
                    icon={Plane} 
                    selected={group.chonQuyenLoiG} 
                    disabled={!hasC} 
                    dependencyText="Cần chọn C" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiG: v })}
                    tooltip="Mở rộng phạm vi địa lý khám chữa bệnh sang Thái Lan và Singapore. Yêu cầu tham gia quyền lợi C."
                 >
                     <input type="number" value={group.stbhG} onChange={(e) => updateGroup(group.id, { stbhG: Number(e.target.value) })} className={inputClass} />
                 </BenefitCard>
                 <BenefitCard 
                    code="H" title="Trợ cấp thu nhập" 
                    icon={Wallet} 
                    selected={group.chonQuyenLoiH} 
                    disabled={!hasC} 
                    dependencyText="Cần chọn C" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiH: v })}
                    tooltip="Trợ cấp lương trong thời gian nằm viện điều trị do ốm đau, bệnh tật. Yêu cầu đã tham gia quyền lợi C."
                 >
                    <div className="flex gap-2 mb-2">
                        <label className="flex items-center text-xs"><input type="radio" checked={group.methodH === BenefitHMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_LUONG })} className="mr-1"/> Lương</label>
                        <label className="flex items-center text-xs"><input type="radio" checked={group.methodH === BenefitHMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_SO_TIEN })} className="mr-1"/> STBH</label>
                    </div>
                    {group.methodH === BenefitHMethod.THEO_LUONG ? (
                        <div className="grid grid-cols-2 gap-2"><input type="number" value={group.luongTrungBinh} onChange={(e) => updateGroup(group.id, { luongTrungBinh: Number(e.target.value) })} className={inputClass} placeholder="Lương" /><select value={group.soThangLuong} onChange={(e) => updateGroup(group.id, { soThangLuong: Number(e.target.value) })} className={inputClass}><option value={3}>3 tháng</option><option value={6}>6 tháng</option><option value={9}>9 tháng</option><option value={12}>12 tháng</option></select></div>
                    ) : (
                        <input type="number" value={group.stbhH} onChange={(e) => updateGroup(group.id, { stbhH: Number(e.target.value) })} className={inputClass} />
                    )}
                 </BenefitCard>
                 <BenefitCard 
                    code="I" title="Ngộ độc" 
                    icon={Utensils} 
                    selected={group.chonQuyenLoiI} 
                    disabled={!hasA} 
                    dependencyText="Cần chọn A" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiI: v })}
                    tooltip="Chi trả cho rủi ro ngộ độc thức ăn, hít phải khí độc. Yêu cầu đã tham gia quyền lợi A (Tai nạn)."
                 >
                    <input type="number" value={group.stbhI} onChange={(e) => updateGroup(group.id, { stbhI: Number(e.target.value) })} className={inputClass} />
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
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
           <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-4 text-white shadow-md flex items-center justify-between mb-4 animate-in slide-in-from-top-2">
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
          <div key={group.id} className="bg-white p-6 rounded-[8px] border border-phuhung-border shadow-sm hover:shadow-md transition-shadow">
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
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-phuhung-blue hover:text-phuhung-blue hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
       >
          <PlusCircle className="w-5 h-5" />
          {contractType === ContractType.NHOM ? 'Thêm Thành Viên Vào Nhóm' : 'Thêm Người Được Bảo Hiểm'}
       </button>
    </div>
  );
};

export default InsuredList;