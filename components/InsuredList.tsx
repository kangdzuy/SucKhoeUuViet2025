import React, { useState, useEffect, useMemo, useRef } from 'react';
import { InsuranceGroup, Gender, ContractType, BenefitHMethod, BenefitAMethod, BenefitBMethod, BenefitASalaryOption, Geography, CoPay, BenefitA4Program, BenefitCProgram, BenefitEProgram, BenefitFProgram } from '../types';
import { isValidAgeDate } from '../services/calculationService';
import { BENEFIT_LIMITS } from '../constants';
import { 
  Trash2, PlusCircle, Edit3, Users, User, AlertCircle, Info, ChevronDown, Check,
  ShieldAlert, HeartPulse, BedDouble, Baby, Stethoscope, Smile, Plane, Wallet, Utensils, Calculator,
  Upload, Download, FileText, Copy, Globe, Percent, Banknote, Layers, Activity, FileOutput
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

// E Program Definitions
const E_PROGRAMS: Record<BenefitEProgram, { label: string, min: number, max: number, default: number }> = {
    [BenefitEProgram.P1]: { label: 'Từ 5 triệu đến 10 triệu', min: 5000000, max: 10000000, default: 5000000 },
    [BenefitEProgram.P2]: { label: 'Trên 10 triệu đến 20 triệu', min: 10000001, max: 20000000, default: 10000001 },
    [BenefitEProgram.P3]: { label: 'Trên 20 triệu', min: 20000001, max: 200000000, default: 20000001 },
};

// F Program Definitions
const F_PROGRAMS: Record<BenefitFProgram, { label: string, min: number, max: number, default: number }> = {
    [BenefitFProgram.P1]: { label: 'Từ 2 triệu đến 5 triệu', min: 2000000, max: 5000000, default: 5000000 },
    [BenefitFProgram.P2]: { label: 'Trên 5 triệu đến 10 triệu', min: 5000001, max: 10000000, default: 10000000 },
    [BenefitFProgram.P3]: { label: 'Trên 10 triệu đến 20 triệu', min: 10000001, max: 20000000, default: 20000000 },
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

    chonQuyenLoiD: false, geoD: Geography.VIETNAM, stbhD: C_PROGRAMS[BenefitCProgram.P1].default, // Init same as C
    
    chonQuyenLoiE: false, 
    geoE: Geography.VIETNAM, 
    programE: BenefitEProgram.P1,
    stbhE: E_PROGRAMS[BenefitEProgram.P1].default,

    chonQuyenLoiF: false, 
    geoF: Geography.VIETNAM, 
    programF: BenefitFProgram.P1,
    stbhF: F_PROGRAMS[BenefitFProgram.P1].default,
    
    chonQuyenLoiG: false, 
    geoG: Geography.CHAU_A, // Default for G is Asia (Thai/Sin)
    stbhG: 50000000, // Legacy support field
    stbhG_VanChuyen: 600000000, // Default Max for Transport
    stbhG_YTe: 400000000, // Fixed Default for Medical
    subG_YTe: true,
    subG_VanChuyen: true,
    
    chonQuyenLoiH: false, 
    geoH: Geography.VIETNAM,
    methodH: BenefitHMethod.THEO_LUONG,
    soThangLuong: 12, // Default 12 months per request
    stbhH: 120000000, // Initial value based on 12 months * 10M
    subH_NamVien: true,
    subH_PhauThuat: false, // Deprecated/Removed from UI
    
    chonQuyenLoiI: false, 
    geoI: Geography.VIETNAM,
    stbhI: 20000000, // Legacy
    subI_I1: true,
    subI_I2: true,
    subI_I3: false,
    subI_I4: false,
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
          // Disable I subs if A is completely off
          updates.subI_I1 = false;
          updates.subI_I2 = false;
          updates.subI_I3 = false;
          updates.subI_I4 = false;
      } else {
          // If A is On, ensure I subs respect A subs
          const currentA1 = updates.subA_A1 !== undefined ? updates.subA_A1 : p.subA_A1;
          const currentA2 = updates.subA_A2 !== undefined ? updates.subA_A2 : p.subA_A2;
          const currentA3 = updates.subA_TroCap !== undefined ? updates.subA_TroCap : p.subA_TroCap;
          const currentA4 = updates.subA_YTe !== undefined ? updates.subA_YTe : p.subA_YTe;

          // If A component turns off, turn off corresponding I
          if (!currentA1) updates.subI_I1 = false;
          if (!currentA2) updates.subI_I2 = false;
          if (!currentA3) updates.subI_I3 = false;
          if (!currentA4) updates.subI_I4 = false;
      }
      
      if (updates.chonQuyenLoiC === false) {
          updates.chonQuyenLoiD = false;
          updates.chonQuyenLoiG = false;
          updates.chonQuyenLoiH = false;
      }

      // Geo Logic: Only applies to G now if C is removed (handled above).
      // If G is selected, ensure Geo is Asia/Global. Default to Asia if not set.
      if (updates.chonQuyenLoiG === true) {
          // Force G to be Asia (Thai/Sin) only
          updates.geoG = Geography.CHAU_A;
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

      // E Logic: If Program changes, update SI to default (minimum of range)
      if (updates.programE) {
          const prog = E_PROGRAMS[updates.programE];
          if (prog) {
              updates.stbhE = prog.default;
          }
      }

      // F Logic: If Program changes, update SI to default (MAXIMUM of range)
      if (updates.programF) {
          const prog = F_PROGRAMS[updates.programF];
          if (prog) {
              updates.stbhF = prog.default;
          }
      }

      const updated = { ...p, ...updates };
      
      // Enforce Fixed G2 (Medical) SI
      updated.stbhG_YTe = 400000000;

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

      // 3. Benefit H SI Calculation (Strictly by Salary now)
      // Always update stbhH based on Salary * Months if H is selected
      if (updated.chonQuyenLoiH) {
          updated.methodH = BenefitHMethod.THEO_LUONG; // Enforce
          updated.stbhH = (updated.luongCoBan || 0) * (updated.soThangLuong || 12);
      }
      
      // 4. Benefit A Main SI Calculation (If By Salary)
      if (updated.chonQuyenLoiA && updated.methodA === BenefitAMethod.THEO_LUONG) {
          updated.stbhA = (updated.luongCoBan || 0) * (updated.soThangLuongA || 0);
      }
      
      // 5. Benefit B SI Calculation (If By Salary)
      if (updated.chonQuyenLoiB && updated.methodB === BenefitBMethod.THEO_LUONG) {
          updated.stbhB = (updated.luongCoBan || 0) * (updated.soThangLuongB || 0);
      }

      // 6. Benefit D Sync (Always equal to C)
      updated.stbhD = updated.stbhC;

      return updated;
    }));
  };
  
  // --- IMPORT / EXPORT LOGIC ---

  const getCsvHeaders = () => [
        "Họ và Tên", "Ngày Sinh (dd/mm/yyyy)", "Giới Tính", 
        "Lương Cơ Bản", "CoPay (%)",
        "Phạm vi A", "A (Chính)", "A1", "A2", "A3", "A4",
        "Phạm vi B", "B (Sinh mạng)", 
        "Phạm vi C", "C (Nội trú)", 
        "Phạm vi D", "D (Thai sản)", 
        "Phạm vi E", "E (Ngoại trú)", 
        "Phạm vi F", "F (Nha khoa)", 
        "Phạm vi G", "G1 (VC)", "G2 (YT)", 
        "Phạm vi H", "H (Tháng)", 
        "I1", "I2", "I3", "I4"
  ];

  const handleDownloadTemplate = () => {
    const BOM = "\uFEFF";
    const headers = getCsvHeaders();
    
    // Example row with distinct logic
    const exampleRow = [
        "Nguyen Van A", "01/01/1990", "Nam", 
        "15000000", "0",
        "VN", "24", "C", "C", "C", "C", // A
        "VN", "100000000", // B
        "VN", "60000000", // C
        "VN", "C", // D
        "VN", "10000000", // E
        "VN", "2000000", // F
        "Asia", "C", "C", // G
        "VN", "12", // H
        "C", "C", "C", "C" // I
    ];

    const csvContent = BOM + headers.join(",") + "\n" + exampleRow.join(",");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Mau_DS_BaoHiem_Chuan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapGeoToCSV = (g: Geography): string => {
      if (g === Geography.CHAU_A) return "Asia";
      if (g === Geography.TOAN_CAU) return "Global";
      return "VN";
  }

  const handleExportData = () => {
    if (groups.length === 0) {
        alert("Danh sách trống, không có dữ liệu để xuất.");
        return;
    }

    const BOM = "\uFEFF";
    const headers = getCsvHeaders();

    const rows = groups.map(g => {
        // Date Format: yyyy-mm-dd -> dd/mm/yyyy
        let dob = "";
        if (g.ngaySinh) {
            const parts = g.ngaySinh.split('-');
            if (parts.length === 3) dob = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        // A Value
        let valA = "";
        if (g.chonQuyenLoiA) {
            valA = g.methodA === BenefitAMethod.THEO_LUONG ? g.soThangLuongA.toString() : g.stbhA.toString();
        }

        // B Value
        let valB = "";
        if (g.chonQuyenLoiB) {
            valB = g.methodB === BenefitBMethod.THEO_LUONG ? g.soThangLuongB.toString() : g.stbhB.toString();
        }

        return [
            `"${(g.tenNhom || '').replace(/"/g, '""')}"`, // Name
            dob, // DOB
            g.gioiTinh === Gender.NAM ? "Nam" : "Nữ", // Gender
            g.luongCoBan || 0, // Salary
            (g.mucDongChiTra || "").replace('%', '') || 0, // CoPay
            
            // A
            mapGeoToCSV(g.geoA),
            valA, 
            (g.chonQuyenLoiA && g.subA_A1) ? "C" : "K",
            (g.chonQuyenLoiA && g.subA_A2) ? "C" : "K",
            (g.chonQuyenLoiA && g.subA_TroCap) ? "C" : "K",
            (g.chonQuyenLoiA && g.subA_YTe) ? (g.stbhA_YTe || "C") : 0, 
            
            // B
            mapGeoToCSV(g.geoB),
            valB, 
            
            // C
            mapGeoToCSV(g.geoC),
            g.chonQuyenLoiC ? g.stbhC : 0, 
            
            // D
            mapGeoToCSV(g.geoD),
            g.chonQuyenLoiD ? g.stbhD : "K", 
            
            // E
            mapGeoToCSV(g.geoE),
            g.chonQuyenLoiE ? g.stbhE : 0, 
            
            // F
            mapGeoToCSV(g.geoF),
            g.chonQuyenLoiF ? g.stbhF : 0, 
            
            // G
            mapGeoToCSV(g.geoG),
            (g.chonQuyenLoiG && g.subG_VanChuyen) ? (g.stbhG_VanChuyen || "C") : 0, // G1
            (g.chonQuyenLoiG && g.subG_YTe) ? (g.stbhG_YTe || "C") : 0, // G2
            
            // H
            mapGeoToCSV(g.geoH),
            g.chonQuyenLoiH ? g.soThangLuong : 0, // H
            
            // I
            (g.chonQuyenLoiI && g.subI_I1) ? "C" : "K",
            (g.chonQuyenLoiI && g.subI_I2) ? "C" : "K",
            (g.chonQuyenLoiI && g.subI_I3) ? "C" : "K",
            (g.chonQuyenLoiI && g.subI_I4) ? "C" : "K",
        ].join(",");
    });

    const csvContent = BOM + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DS_BaoHiem_Export_${new Date().toISOString().slice(0,10)}.csv`);
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

  const parseGeo = (str: string): Geography => {
      if (!str) return Geography.VIETNAM;
      const s = str.trim().toLowerCase();
      if (s.includes('asia') || s.includes('châu á')) return Geography.CHAU_A;
      if (s.includes('global') || s.includes('toàn cầu')) return Geography.TOAN_CAU;
      return Geography.VIETNAM;
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => { 
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          if (!text) return;

          const lines = text.split(/\r\n|\n/);
          const newGroups: InsuranceGroup[] = [];

          // Helper to parse cell
          const parseCell = (raw: string) => {
              if (!raw) return { val: 0, checked: false, isFlag: false };
              const s = raw.trim().toUpperCase();
              
              // Flag detection
              if (['C', 'X', 'YES', 'CO', 'CÓ', 'K', 'KHONG', 'KHÔNG', 'NO'].includes(s)) {
                  if (s.startsWith('K') || s === 'NO') return { val: 0, checked: false, isFlag: false };
                  return { val: 0, checked: true, isFlag: true };
              }
              const num = parseMoney(raw);
              return { val: num, checked: num > 0, isFlag: false };
          };

          // Helper to properly split CSV line handling quotes
          const splitCSVLine = (line: string) => {
              const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
              return line.split(regex).map(s => {
                  let val = s.trim();
                  // Remove surrounding quotes if present
                  if (val.startsWith('"') && val.endsWith('"')) {
                      val = val.slice(1, -1);
                  }
                  // Unescape double quotes
                  return val.replace(/""/g, '"');
              });
          };

          // Start from index 1 to skip header
          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              // Use robust splitter instead of simple split(',')
              const cols = splitCSVLine(line);
              if (cols.length < 6) continue; // Basic check

              // Map columns based on NEW DETAILED template structure
              const [
                  name, dob, genderStr, salaryStr, copayStr,
                  geoA_Str, valA, subA1, subA2, subA3, subA4, // A Block
                  geoB_Str, valB, // B Block
                  geoC_Str, valC, // C Block
                  geoD_Str, subD, // D Block
                  geoE_Str, subE, // E Block
                  geoF_Str, subF, // F Block
                  geoG_Str, subG1, subG2, // G Block
                  geoH_Str, valH, // H Block
                  subI1, subI2, subI3, subI4 // I Block
              ] = cols;

              const gender = genderStr?.toLowerCase().includes('nữ') || genderStr?.toLowerCase().includes('nu') || genderStr?.toLowerCase().includes('female') 
                  ? Gender.NU : Gender.NAM;

              const salary = parseMoney(salaryStr);
              
              // Parse Geo
              const geoA = parseGeo(geoA_Str);
              const geoB = parseGeo(geoB_Str);
              const geoC = parseGeo(geoC_Str);
              const geoD = parseGeo(geoD_Str);
              const geoE = parseGeo(geoE_Str);
              const geoF = parseGeo(geoF_Str);
              const geoG = parseGeo(geoG_Str);
              const geoH = parseGeo(geoH_Str);
              // I usually follows A, so reuse geoA if needed, or default

              // Basic default setup based on parsed data
              const group: InsuranceGroup = {
                  ...defaultBenefits, // Spread defaults
                  id: generateId(),
                  tenNhom: name?.trim() || `Thành viên ${i}`,
                  ngaySinh: parseDate(dob),
                  gioiTinh: gender,
                  soNguoi: 1, soNam: gender === Gender.NAM ? 1 : 0, soNu: gender === Gender.NU ? 1 : 0,
                  tuoiTrungBinh: 0, tongSoTuoi: 0, // Will be calc automatically
                  
                  // Apply parsed Geo
                  geoA, geoB, geoC, geoD, geoE, geoF, geoG, geoH, geoI: geoA,

                  // Simple copay mapping, default to 0
                  mucDongChiTra: CoPay.MUC_0, 

                  // Map Values if present
                  luongCoBan: salary, 
              };

              // --- LOGIC PARSING FOR A (MAIN) ---
              const pA = parseCell(valA);
              if (pA.val > 0) {
                  group.chonQuyenLoiA = true;
                  // Rule: <= 100 means Months, > 100 means Fixed Money
                  if (pA.val <= 100) {
                      group.methodA = BenefitAMethod.THEO_LUONG;
                      group.soThangLuongA = pA.val;
                      group.stbhA = salary * pA.val;
                  } else {
                      group.methodA = BenefitAMethod.THEO_SO_TIEN;
                      group.stbhA = pA.val;
                  }
              } else {
                  group.chonQuyenLoiA = false; // "C" flag NOT allowed for Main Value
              }

              // Sub A flags (Inherit Enabled status)
              if (group.chonQuyenLoiA) {
                  group.subA_A1 = parseCell(subA1).checked;
                  group.subA_A2 = parseCell(subA2).checked;
                  group.subA_TroCap = parseCell(subA3).checked;
                  
                  const pA4 = parseCell(subA4);
                  group.subA_YTe = pA4.checked;
                  if (pA4.val > 0) group.stbhA_YTe = pA4.val;
              }

              // --- LOGIC PARSING FOR B ---
              const pB = parseCell(valB);
              if (pB.val > 0) {
                  group.chonQuyenLoiB = true;
                  if (pB.val <= 100) {
                      group.methodB = BenefitBMethod.THEO_LUONG;
                      group.soThangLuongB = pB.val;
                      group.stbhB = salary * pB.val;
                  } else {
                      group.methodB = BenefitBMethod.THEO_SO_TIEN;
                      group.stbhB = pB.val;
                  }
              }

              // --- LOGIC PARSING FOR C ---
              const pC = parseCell(valC);
              if (pC.val > 0) {
                  group.chonQuyenLoiC = true;
                  group.stbhC = pC.val;
              }

              // --- D, E, F (Dependent on C usually) ---
              if (group.chonQuyenLoiC) {
                  // D
                  const pD = parseCell(subD);
                  group.chonQuyenLoiD = pD.checked;
                  if (pD.val > 0) group.stbhD = pD.val;
                  else if (pD.isFlag) group.stbhD = group.stbhC; // Inherit

                  // E
                  const pE = parseCell(subE);
                  group.chonQuyenLoiE = pE.checked;
                  if (pE.val > 0) {
                      group.stbhE = pE.val;
                      if (pE.val <= 10000000) group.programE = BenefitEProgram.P1;
                      else if (pE.val <= 20000000) group.programE = BenefitEProgram.P2;
                      else group.programE = BenefitEProgram.P3;
                  }

                  // F
                  const pF = parseCell(subF);
                  group.chonQuyenLoiF = pF.checked;
                  if (pF.val > 0) {
                      group.stbhF = pF.val;
                      if (pF.val <= 5000000) group.programF = BenefitFProgram.P1;
                      else if (pF.val <= 10000000) group.programF = BenefitFProgram.P2;
                      else group.programF = BenefitFProgram.P3;
                  }
                  
                  // G
                  const pG1 = parseCell(subG1);
                  const pG2 = parseCell(subG2);
                  if (pG1.checked || pG2.checked) {
                      group.chonQuyenLoiG = true;
                      group.subG_VanChuyen = pG1.checked;
                      if (pG1.val > 0) group.stbhG_VanChuyen = pG1.val;
                      
                      group.subG_YTe = pG2.checked;
                      if (pG2.val > 0) group.stbhG_YTe = pG2.val;
                  }
                  
                  // H
                  const pH = parseCell(valH);
                  if (pH.val > 0 && pH.val <= 12) {
                      group.chonQuyenLoiH = true;
                      group.soThangLuong = pH.val;
                      group.stbhH = salary * pH.val;
                  }
              }

              // --- I (Dependent on A) ---
              if (group.chonQuyenLoiA) {
                  const pI1 = parseCell(subI1);
                  const pI2 = parseCell(subI2);
                  const pI3 = parseCell(subI3);
                  const pI4 = parseCell(subI4);
                  if (pI1.checked || pI2.checked || pI3.checked || pI4.checked) {
                      group.chonQuyenLoiI = true;
                      group.subI_I1 = pI1.checked;
                      group.subI_I2 = pI2.checked;
                      group.subI_I3 = pI3.checked;
                      group.subI_I4 = pI4.checked;
                  }
              }

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
              alert('Không đọc được dữ liệu hoặc file không đúng định dạng.');
          }
      };
      reader.readAsText(file);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const inputClass = "w-full text-sm bg-[#F9FAFB] border-[#E0E4EC] text-[#111827] placeholder-[#9CA3AF] rounded-[4px] shadow-sm focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue px-2 py-1.5 border transition-all disabled:bg-gray-100 disabled:text-gray-400";
  const checkboxClass = "w-4 h-4 text-phuhung-blue border-gray-300 rounded focus:ring-phuhung-blue cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

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

  // Helper for Benefit I SI Calculation Display
  const calculateSIForI = (group: InsuranceGroup, type: 'I1' | 'I2' | 'I3' | 'I4') => {
      if (type === 'I1' || type === 'I2') {
          return group.methodA === BenefitAMethod.THEO_LUONG 
            ? (group.luongCoBan || 0) * (group.soThangLuongA || 0)
            : group.stbhA;
      }
      if (type === 'I3') {
          // Assume inherits A3 calculation: Salary * Months
          let months = group.soThangLuongTroCap;
          if (!months || months <= 0) {
               if (group.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) months = 9;
               else if (group.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) months = 12;
               else months = 5; // Default for 3-5
          }
          return (group.luongCoBan || 0) * months;
      }
      if (type === 'I4') {
          return group.stbhA_YTe;
      }
      return 0;
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
                            <GeoSelect value={geoValue} onChange={onGeoChange} options={geoOptions} disabled={geoOptions?.length === 1} />
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
                        <div className="p-3 bg-blue-50/50 rounded border border-blue-100">
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_LUONG })} className="text-phuhung-blue"/><span>Theo Lương</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodA_${group.id}`} checked={group.methodA === BenefitAMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_SO_TIEN })} className="text-phuhung-blue"/><span>Theo Số Tiền BH</span></label>
                            </div>
                            {group.methodA === BenefitAMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in">
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
                        <div className="space-y-3 pl-2 border-l-2 border-gray-200">
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
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_YTe} onChange={(e) => updateGroup(group.id, { subA_YTe: e.target.checked })} className="mt-1 checkbox-sm" />
                                 <div className="flex-1">
                                     <div className="flex items-center cursor-pointer" onClick={() => updateGroup(group.id, { subA_YTe: !group.subA_YTe })}>
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer">A4. Chi phí y tế, chi phí vận chuyển cấp cứu (loại trừ đường hàng không)</label>
                                     </div>
                                     {group.subA_YTe && (
                                         <div className="mt-2 animate-in slide-in-from-top-1 space-y-2">
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
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodB_${group.id}`} checked={group.methodB === BenefitBMethod.THEO_LUONG} onChange={() => updateGroup(group.id, { methodB: BenefitBMethod.THEO_LUONG })} className="text-phuhung-blue"/><span>Theo Lương</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`methodB_${group.id}`} checked={group.methodB === BenefitBMethod.THEO_SO_TIEN} onChange={() => updateGroup(group.id, { methodB: BenefitBMethod.THEO_SO_TIEN })} className="text-phuhung-blue"/><span>Theo Số Tiền BH</span></label>
                            </div>
                            {group.methodB === BenefitBMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in">
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
                     <CurrencyInput 
                        value={group.stbhD} 
                        onChange={() => {}} 
                        className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`} 
                        disabled={true} 
                     />
                     <p className="text-[10px] text-gray-500 mt-1">Bằng STBH Quyền lợi C</p>
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
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Chọn hạn mức</label>
                            <select 
                                value={group.programE}
                                onChange={(e) => updateGroup(group.id, { programE: e.target.value as BenefitEProgram })}
                                className={inputClass}
                            >
                                {Object.entries(E_PROGRAMS).map(([key, p]) => (
                                    <option key={key} value={key}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label>
                            <CurrencyInput value={group.stbhE} onChange={(val) => updateGroup(group.id, { stbhE: val })} className={inputClass} />
                            <ValidationMsg val={group.stbhE} min={E_PROGRAMS[group.programE || BenefitEProgram.P1].min} max={E_PROGRAMS[group.programE || BenefitEProgram.P1].max} />
                        </div>
                    </div>
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
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Chọn hạn mức</label>
                            <select 
                                value={group.programF}
                                onChange={(e) => updateGroup(group.id, { programF: e.target.value as BenefitFProgram })}
                                className={inputClass}
                            >
                                {Object.entries(F_PROGRAMS).map(([key, p]) => (
                                    <option key={key} value={key}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm</label>
                            <CurrencyInput value={group.stbhF} onChange={(val) => updateGroup(group.id, { stbhF: val })} className={inputClass} />
                            <ValidationMsg val={group.stbhF} min={F_PROGRAMS[group.programF || BenefitFProgram.P1].min} max={F_PROGRAMS[group.programF || BenefitFProgram.P1].max} />
                        </div>
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="G" title="Khám chữa bệnh và điều trị ở nước ngoài" 
                    icon={Plane} 
                    selected={group.chonQuyenLoiG} 
                    disabled={disableG} 
                    dependencyText={gDependencyText} 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiG: v })}
                    tooltip="Phạm vi địa lý: Thái Lan & Singapore. Yêu cầu tham gia quyền lợi C."
                    geoValue={group.geoG}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoG: v })}
                    geoOptions={[Geography.CHAU_A]} 
                 >
                     <div className="text-[10px] text-gray-500 mb-2 italic">Chỉ áp dụng cho Thái Lan & Singapore</div>
                     
                     <div className="mt-3 bg-blue-50/50 rounded border border-blue-100 p-3 text-sm animate-in fade-in slide-in-from-top-1 space-y-4">
                        <div className="space-y-2">
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subG_VanChuyen} onChange={(e) => updateGroup(group.id, { subG_VanChuyen: e.target.checked })} className="mt-2 cursor-pointer text-blue-600 focus:ring-blue-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center mb-1">
                                        <label className="text-sm font-bold text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subG_VanChuyen: !group.subG_VanChuyen })}>G.1 Chi phí vận chuyển cấp cứu</label>
                                     </div>
                                     {group.subG_VanChuyen && (
                                         <div className="animate-in slide-in-from-top-1">
                                             <CurrencyInput 
                                                value={group.stbhG_VanChuyen} 
                                                onChange={(val) => updateGroup(group.id, { stbhG_VanChuyen: val })} 
                                                className={inputClass}
                                                placeholder="Nhập STBH..."
                                             />
                                             <ValidationMsg val={group.stbhG_VanChuyen} min={1000000} max={600000000} />
                                         </div>
                                     )}
                                 </div>
                             </div>

                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subG_YTe} onChange={(e) => updateGroup(group.id, { subG_YTe: e.target.checked })} className="mt-2 cursor-pointer text-blue-600 focus:ring-blue-500 rounded border-gray-300" />
                                 <div className="flex-1">
                                     <div className="flex items-center mb-1">
                                        <label className="text-sm font-bold text-gray-700 cursor-pointer" onClick={() => updateGroup(group.id, { subG_YTe: !group.subG_YTe })}>G.2 Chi phí y tế điều trị nội trú</label>
                                     </div>
                                     {group.subG_YTe && (
                                         <div className="animate-in slide-in-from-top-1">
                                             <CurrencyInput 
                                                value={group.stbhG_YTe} 
                                                onChange={() => {}} 
                                                className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                                                disabled={true}
                                             />
                                             <p className="text-[10px] text-gray-500 mt-1">Hạn mức cố định: 400 triệu</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                     </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="H" title="Trợ cấp lương ngày trong quá trình điều trị nội trú" 
                    icon={Wallet} 
                    selected={group.chonQuyenLoiH} 
                    disabled={!hasC} 
                    dependencyText="Cần chọn C" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiH: v })}
                    tooltip="Trợ cấp lương trong thời gian nằm viện điều trị do ốm đau, bệnh tật. Tính theo số tháng lương (từ 3 đến 12 tháng)."
                    geoValue={group.geoH}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoH: v })}
                 >
                    <div className="flex gap-2 mb-2 items-center">
                        <span className="text-xs font-semibold text-gray-600">Cách tính:</span>
                        <div className="flex items-center gap-1.5 text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600">
                            <Banknote className="w-3 h-3" />
                            Theo Lương
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Lương cơ bản</label>
                            <input type="text" value={formatShortMoney(group.luongCoBan)} disabled className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-[4px] px-2 py-1.5 text-xs cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Số tháng (03 - 12)</label>
                            <select value={group.soThangLuong} onChange={(e) => updateGroup(group.id, { soThangLuong: Number(e.target.value) })} className={inputClass}>
                                <option value={3}>3 tháng</option>
                                <option value={6}>6 tháng</option>
                                <option value={9}>9 tháng</option>
                                <option value={12}>12 tháng</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Tổng STBH Trợ cấp</label>
                        <CurrencyInput 
                            value={group.stbhH} 
                            onChange={() => {}} 
                            className={`${inputClass} bg-gray-50 font-bold text-gray-700`}
                            disabled
                        />
                    </div>
                 </BenefitCard>
                 <BenefitCard 
                    code="I" title="Ngộ độc thức ăn, đồ uống, hít phải khí độc" 
                    icon={Utensils} 
                    selected={group.chonQuyenLoiI} 
                    disabled={!hasA} 
                    dependencyText="Cần chọn A" 
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiI: v })}
                    tooltip="Chi trả cho rủi ro ngộ độc thức ăn, hít phải khí độc. Yêu cầu đã tham gia quyền lợi A (Tai nạn) tương ứng."
                    geoValue={group.geoI}
                    onGeoChange={(v: Geography) => updateGroup(group.id, { geoI: v })}
                 >
                     <div className="text-[10px] text-gray-500 mb-2 italic">STBH kế thừa từ quyền lợi A tương ứng</div>
                     <div className="mt-3 bg-red-50/50 rounded border border-red-100 p-3 text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="font-semibold text-red-600 mb-2 text-xs uppercase tracking-wide">Quyền lợi chi tiết:</div>
                        <div className="space-y-2">
                             {/* I1 */}
                             <div className={`flex items-start gap-2 ${!group.subA_A1 ? 'opacity-50' : ''}`}>
                                 <input type="checkbox" checked={group.subI_I1} disabled={!group.subA_A1} onChange={(e) => updateGroup(group.id, { subI_I1: e.target.checked })} className={checkboxClass} />
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => group.subA_A1 && updateGroup(group.id, { subI_I1: !group.subI_I1 })}>I.1 Tử vong/TTTBVV</label>
                                        <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600 font-mono">{formatShortMoney(calculateSIForI(group, 'I1'))}</span>
                                     </div>
                                     {!group.subA_A1 && <span className="text-[9px] text-red-400 block">Yêu cầu chọn A1</span>}
                                 </div>
                             </div>
                             {/* I2 */}
                             <div className={`flex items-start gap-2 ${!group.subA_A2 ? 'opacity-50' : ''}`}>
                                 <input type="checkbox" checked={group.subI_I2} disabled={!group.subA_A2} onChange={(e) => updateGroup(group.id, { subI_I2: e.target.checked })} className={checkboxClass} />
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => group.subA_A2 && updateGroup(group.id, { subI_I2: !group.subI_I2 })}>I.2 TTB PVV</label>
                                        <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600 font-mono">{formatShortMoney(calculateSIForI(group, 'I2'))}</span>
                                     </div>
                                     {!group.subA_A2 && <span className="text-[9px] text-red-400 block">Yêu cầu chọn A2</span>}
                                 </div>
                             </div>
                             {/* I3 */}
                             <div className={`flex items-start gap-2 ${!group.subA_TroCap ? 'opacity-50' : ''}`}>
                                 <input type="checkbox" checked={group.subI_I3} disabled={!group.subA_TroCap} onChange={(e) => updateGroup(group.id, { subI_I3: e.target.checked })} className={checkboxClass} />
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => group.subA_TroCap && updateGroup(group.id, { subI_I3: !group.subI_I3 })}>I.3 Trợ cấp lương ngày</label>
                                        <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600 font-mono">{formatShortMoney(calculateSIForI(group, 'I3'))}</span>
                                     </div>
                                     {!group.subA_TroCap && <span className="text-[9px] text-red-400 block">Yêu cầu chọn A3</span>}
                                 </div>
                             </div>
                             {/* I4 */}
                             <div className={`flex items-start gap-2 ${!group.subA_YTe ? 'opacity-50' : ''}`}>
                                 <input type="checkbox" checked={group.subI_I4} disabled={!group.subA_YTe} onChange={(e) => updateGroup(group.id, { subI_I4: e.target.checked })} className={checkboxClass} />
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => group.subA_YTe && updateGroup(group.id, { subI_I4: !group.subI_I4 })}>I.4 Chi phí y tế</label>
                                        <span className="text-[10px] bg-gray-100 px-1.5 rounded text-gray-600 font-mono">{formatShortMoney(calculateSIForI(group, 'I4'))}</span>
                                     </div>
                                     {!group.subA_YTe && <span className="text-[9px] text-red-400 block">Yêu cầu chọn A4</span>}
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
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-sm transition-colors"
                    title="Xuất danh sách hiện tại để lưu hoặc chuyển tiếp"
                >
                    <FileOutput className="w-3.5 h-3.5" />
                    Xuất dữ liệu
                </button>
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