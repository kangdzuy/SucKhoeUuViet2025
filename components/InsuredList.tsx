import React, { useState, useEffect } from 'react';
import { InsuranceGroup, Gender, ContractType, BenefitHMethod, BenefitAMethod, BenefitASalaryOption } from '../types';
import { isValidAgeDate } from '../services/calculationService';
import { BENEFIT_LIMITS } from '../constants';
import { 
  Trash2, PlusCircle, Edit3, Users, User, AlertCircle, Info, ChevronDown, Check,
  ShieldAlert, HeartPulse, BedDouble, Baby, Stethoscope, Smile, Plane, Wallet, Utensils
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

  // Ensure there is at least 1 group for Individual mode on init
  useEffect(() => {
    if (contractType === ContractType.CAN_HAN && groups.length === 0) {
        // Create initial individual
        const initialInd: InsuranceGroup = {
            id: crypto.randomUUID(),
            tenNhom: '',
            soNguoi: 1,
            soNam: 1,
            soNu: 0,
            tongSoTuoi: 0,
            tuoiTrungBinh: 0,
            ngaySinh: '',
            gioiTinh: Gender.NAM,
            ...defaultBenefits
        };
        onChange([initialInd]);
        setEditingId(initialInd.id); // Open edit immediately
    }
  }, [contractType]);

  const addGroup = () => {
    const isInd = contractType === ContractType.CAN_HAN;
    const newGroup: InsuranceGroup = {
      id: crypto.randomUUID(),
      tenNhom: '',
      soNguoi: isInd ? 1 : 0, 
      soNam: isInd ? 1 : 0,
      soNu: 0,
      tongSoTuoi: 0,
      tuoiTrungBinh: 0, 
      ngaySinh: isInd ? '' : undefined,
      gioiTinh: isInd ? Gender.NAM : undefined,
      ...defaultBenefits
    };
    onChange([...groups, newGroup]);
    setEditingId(newGroup.id);
  };

  const removeGroup = (id: string) => {
    onChange(groups.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateGroup = (id: string, updates: Partial<InsuranceGroup>) => {
    onChange(groups.map(p => {
      if (p.id !== id) return p;
      
      // LOGIC: Reset dependent benefits if Main Benefit is turned OFF
      if (updates.chonQuyenLoiA === false) {
          updates.subA_TroCap = false;
          updates.subA_YTe = false;
          updates.chonQuyenLoiI = false; // I depends on A
      }
      
      if (updates.chonQuyenLoiC === false) {
          updates.chonQuyenLoiD = false; // Maternity (Still depends on C)
          updates.chonQuyenLoiG = false; // Overseas (Still depends on C)
          updates.chonQuyenLoiH = false; // Income Support (Still depends on C)
          // E, F are independent
      }

      const updated = { ...p, ...updates };
      
      // AUTO CALCULATION LOGIC
      
      // 1. Individual Age Calculation
      if (contractType === ContractType.CAN_HAN && updates.ngaySinh) {
        const check = isValidAgeDate(updates.ngaySinh);
        if (check.valid) {
             updated.tuoiTrungBinh = check.age;
        }
      }

      // 2. Group Avg Age Calculation
      // REMOVED: Previous logic was resetting tuoiTrungBinh to 0 because tongSoTuoi was 0.
      // Now we allow direct input of tuoiTrungBinh for groups.

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
        
        {/* Input Area - Only show if selected */}
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
    
    // Dependencies Logic
    const hasA = group.chonQuyenLoiA;
    const hasC = group.chonQuyenLoiC;
    
    // Validations
    const isIndividual = contractType === ContractType.CAN_HAN;
    
    // Rule for Maternity (D):
    // 1. Requires C (PDF Page 17)
    // 2. Female Only (PDF Page 26 - "Chỉ dành cho Nữ")
    
    const isMaleIndividual = isIndividual && group.gioiTinh === Gender.NAM;
    const isGroupNoFemale = !isIndividual && group.soNu === 0;

    const disableMaternity = !hasC || isMaleIndividual || isGroupNoFemale;
    
    let maternityDependencyText = "Cần chọn Quyền lợi C";
    if (hasC) {
        if (isMaleIndividual) maternityDependencyText = "Chỉ dành cho Nữ";
        else if (isGroupNoFemale) maternityDependencyText = "Nhóm không có Nữ";
    }

    const hasNoMainBenefit = !group.chonQuyenLoiA && !group.chonQuyenLoiB && !group.chonQuyenLoiC;

    return (
      <div className="mt-4 p-6 bg-[#F5F7FA] rounded-xl border border-gray-200 shadow-inner animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
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
          
          {/* PART 1: MAIN BENEFITS */}
          <div>
             <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-200">
                 <span className="text-phuhung-blue font-bold text-base uppercase tracking-wider">I. Quyền Lợi Bảo Hiểm Chính (Phần 1)</span>
                 <TooltipHelp content="Khách hàng bắt buộc phải tham gia ít nhất 1 loại hình Bảo hiểm Chính (A, B hoặc C)." />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {/* A - Tai Nan (Expanded) */}
                 <BenefitCard 
                    code="A" title="Tai Nạn" 
                    icon={ShieldAlert}
                    description="Tử vong/Thương tật toàn bộ/bộ phận vĩnh viễn"
                    selected={group.chonQuyenLoiA}
                    tooltip="Bảo hiểm cho rủi ro tai nạn. STBH từ 10 triệu đến 5 tỷ đồng."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiA: v })}
                    colSpan="col-span-1 md:col-span-2 lg:col-span-2"
                 >
                    <div className="space-y-4">
                        {/* Main A Config */}
                        <div className="p-3 bg-blue-50/50 rounded border border-blue-100">
                            <div className="flex gap-6 text-sm mb-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" 
                                        name={`methodA_${group.id}`}
                                        checked={group.methodA === BenefitAMethod.THEO_LUONG}
                                        onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_LUONG })}
                                        className="text-phuhung-blue"
                                    />
                                    <span>Theo Lương</span>
                                    <TooltipHelp content="Số tiền bảo hiểm được tính dựa trên mức lương tháng nhân với số tháng (tối đa 30 tháng)." />
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" 
                                        name={`methodA_${group.id}`}
                                        checked={group.methodA === BenefitAMethod.THEO_SO_TIEN}
                                        onChange={() => updateGroup(group.id, { methodA: BenefitAMethod.THEO_SO_TIEN })}
                                        className="text-phuhung-blue"
                                    />
                                    <span>Theo Số Tiền BH</span>
                                </label>
                            </div>

                            {group.methodA === BenefitAMethod.THEO_LUONG ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Lương (VND)</label>
                                        <input type="number" value={group.luongA} 
                                               onChange={(e) => updateGroup(group.id, { luongA: Number(e.target.value) })}
                                               className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Số tháng (Max 30)</label>
                                        <input type="number" max="30" value={group.soThangLuongA} 
                                               onChange={(e) => updateGroup(group.id, { soThangLuongA: Math.min(30, Number(e.target.value)) })}
                                               className={inputClass} />
                                    </div>
                                    <div className="col-span-2 text-xs text-blue-600">STBH Chính = {formatCurrency(group.luongA * group.soThangLuongA)}</div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Số tiền bảo hiểm ({formatShortMoney(BENEFIT_LIMITS.A.min)} - {formatShortMoney(BENEFIT_LIMITS.A.max)})</label>
                                    <input type="number" value={group.stbhA} 
                                           onChange={(e) => updateGroup(group.id, { stbhA: Number(e.target.value) })}
                                           className={inputClass} />
                                    <ValidationMsg val={group.stbhA} min={BENEFIT_LIMITS.A.min} max={BENEFIT_LIMITS.A.max} />
                                </div>
                            )}
                        </div>

                        {/* Sub Benefits of A */}
                        <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                             {/* Sub 1: Allowance */}
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_TroCap} 
                                        onChange={(e) => updateGroup(group.id, { subA_TroCap: e.target.checked })} 
                                        className="mt-1" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                        <label className="text-sm font-medium text-gray-700">Trợ cấp lương ngày trong điều trị</label>
                                        <TooltipHelp content="Quyền lợi mở rộng của A: Trợ cấp trong thời gian điều trị tai nạn." />
                                     </div>
                                     {group.subA_TroCap && (
                                         <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                                             <div className="col-span-2 md:col-span-1">
                                                 <label className="text-xs text-gray-500 block mb-1">Gói trợ cấp</label>
                                                 <select value={group.subA_TroCap_Option} 
                                                         onChange={(e) => {
                                                             const op = e.target.value as BenefitASalaryOption;
                                                             // Auto set max months when option changes
                                                             let defMonths = 5;
                                                             if (op === BenefitASalaryOption.OP_6_9) defMonths = 9;
                                                             if (op === BenefitASalaryOption.OP_10_12) defMonths = 12;
                                                             updateGroup(group.id, { subA_TroCap_Option: op, soThangLuongTroCap: defMonths });
                                                         }}
                                                         className={inputClass}>
                                                     <option value={BenefitASalaryOption.OP_3_5}>Gói 3-5 tháng</option>
                                                     <option value={BenefitASalaryOption.OP_6_9}>Gói 6-9 tháng</option>
                                                     <option value={BenefitASalaryOption.OP_10_12}>Gói 10-12 tháng</option>
                                                 </select>
                                             </div>
                                             <div className="col-span-2 md:col-span-1">
                                                {(() => {
                                                    const range = getAllowanceRange(group.subA_TroCap_Option);
                                                    return (
                                                        <>
                                                            <label className="text-xs text-gray-500 block mb-1">Số tháng ({range.min}-{range.max})</label>
                                                            <input type="number" 
                                                                value={group.soThangLuongTroCap}
                                                                min={range.min} max={range.max}
                                                                onChange={(e) => updateGroup(group.id, { soThangLuongTroCap: Number(e.target.value) })}
                                                                className={inputClass}
                                                            />
                                                        </>
                                                    );
                                                })()}
                                             </div>
                                             
                                             {group.methodA === BenefitAMethod.THEO_SO_TIEN && (
                                                 <div className="col-span-2 mt-1">
                                                     <label className="text-xs text-red-500 block mb-1">* Cần nhập lương để tính quyền lợi này</label>
                                                     <input type="number" value={group.luongA} 
                                                            placeholder="Nhập lương tháng"
                                                            onChange={(e) => updateGroup(group.id, { luongA: Number(e.target.value) })}
                                                            className={inputClass} />
                                                 </div>
                                             )}
                                         </div>
                                     )}
                                 </div>
                             </div>

                             {/* Sub 2: Medical */}
                             <div className="flex items-start gap-2">
                                 <input type="checkbox" checked={group.subA_YTe} 
                                        onChange={(e) => updateGroup(group.id, { subA_YTe: e.target.checked })} 
                                        className="mt-1" />
                                 <div className="flex-1">
                                     <div className="flex items-center">
                                         <label className="text-sm font-medium text-gray-700">Chi phí y tế & vận chuyển cấp cứu</label>
                                         <TooltipHelp content="Quyền lợi mở rộng của A: Chi trả chi phí y tế thực tế phát sinh do tai nạn." />
                                     </div>
                                     {group.subA_YTe && (
                                         <div className="mt-2">
                                             <label className="text-xs text-gray-500 block mb-1">Hạn mức (20tr - 1 tỷ)</label>
                                             <input type="number" value={group.stbhA_YTe} 
                                                    onChange={(e) => updateGroup(group.id, { stbhA_YTe: Number(e.target.value) })}
                                                    className={inputClass} />
                                             <ValidationMsg val={group.stbhA_YTe} min={BENEFIT_LIMITS.A_YTE.min} max={BENEFIT_LIMITS.A_YTE.max} />
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                 </BenefitCard>

                 {/* B - Sinh Mang */}
                 <BenefitCard 
                    code="B" title="Tử vong (Ốm đau, bệnh tật)" 
                    icon={HeartPulse}
                    description="Tử vong/TTTBVV do ốm đau, bệnh tật"
                    selected={group.chonQuyenLoiB}
                    tooltip="Bảo hiểm tử vong do ốm đau, bệnh tật, thai sản (không bao gồm tai nạn). STBH từ 10 triệu đến 5 tỷ đồng."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiB: v })}
                 >
                    <input type="number" value={group.stbhB} 
                           onChange={(e) => updateGroup(group.id, { stbhB: Number(e.target.value) })}
                           className={inputClass} placeholder="Số tiền BH" />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">VNĐ</p>
                    <ValidationMsg val={group.stbhB} min={BENEFIT_LIMITS.B.min} max={BENEFIT_LIMITS.B.max} />
                 </BenefitCard>

                 {/* C - Noi Tru (Base for many) */}
                 <BenefitCard 
                    code="C" title="Nội Trú (Ốm đau, bệnh tật)" 
                    icon={BedDouble}
                    description="Chi phí nằm viện, phẫu thuật. Đây là quyền lợi cơ sở nếu chọn các quyền lợi phụ thuộc."
                    selected={group.chonQuyenLoiC}
                    tooltip="Chi trả chi phí nằm viện, phẫu thuật do ốm đau, bệnh tật. Thường là cơ sở cho Thai sản và Trợ cấp."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiC: v })}
                 >
                    <input type="number" value={group.stbhC} 
                            onChange={(e) => updateGroup(group.id, { stbhC: Number(e.target.value) })}
                            className={inputClass} />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">Hạn mức / năm</p>
                    <ValidationMsg val={group.stbhC} min={BENEFIT_LIMITS.C.min} max={BENEFIT_LIMITS.C.max} />
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
                 
                 {/* D - Thai San (Requires C + Female) */}
                 <BenefitCard 
                    code="D" title="Thai Sản" 
                    icon={Baby}
                    description="Biến chứng thai sản, sinh thường/mổ. (Yêu cầu tham gia C)"
                    selected={group.chonQuyenLoiD}
                    disabled={disableMaternity}
                    dependencyText={maternityDependencyText}
                    tooltip="Chi trả chi phí sinh nở và biến chứng thai sản. Điều kiện: Phải tham gia quyền lợi C, là Nữ."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiD: v })}
                 >
                     <input type="number" value={group.stbhD} onChange={(e) => updateGroup(group.id, { stbhD: Number(e.target.value) })} className={inputClass} />
                     <p className="text-[10px] text-gray-400 mt-1 text-right">VNĐ</p>
                     <ValidationMsg val={group.stbhD} min={BENEFIT_LIMITS.D.min} max={BENEFIT_LIMITS.D.max} />
                     {contractType === ContractType.NHOM && group.chonQuyenLoiD && (
                        <div className="mt-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-start gap-1">
                            <Info className="w-3 h-3 mt-0.5" />
                            <span>Phí chỉ tính cho <b>{group.soNu}</b> Nữ trong nhóm.</span>
                        </div>
                     )}
                 </BenefitCard>

                 {/* E - Ngoai Tru (Independent) */}
                 <BenefitCard 
                    code="E" title="Điều trị Ngoại Trú" 
                    icon={Stethoscope}
                    description="Khám bệnh, thuốc, xét nghiệm."
                    selected={group.chonQuyenLoiE}
                    tooltip="Chi trả chi phí khám chữa bệnh không nằm viện (thuốc kê đơn, xét nghiệm, X-quang, vật lý trị liệu)."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiE: v })}
                 >
                    <input type="number" value={group.stbhE} onChange={(e) => updateGroup(group.id, { stbhE: Number(e.target.value) })} className={inputClass} />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">Hạn mức / năm</p>
                    <ValidationMsg val={group.stbhE} min={BENEFIT_LIMITS.E.min} max={BENEFIT_LIMITS.E.max} />
                 </BenefitCard>

                 {/* F - Nha Khoa (Independent) */}
                 <BenefitCard 
                    code="F" title="Chăm sóc Răng" 
                    icon={Smile}
                    description="Khám, trám, nhổ, điều trị tủy."
                    selected={group.chonQuyenLoiF}
                    tooltip="Chi trả chi phí khám răng, trám răng, nhổ răng, lấy cao răng và điều trị tủy."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiF: v })}
                 >
                    <input type="number" value={group.stbhF} onChange={(e) => updateGroup(group.id, { stbhF: Number(e.target.value) })} className={inputClass} />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">Hạn mức / năm</p>
                    <ValidationMsg val={group.stbhF} min={BENEFIT_LIMITS.F.min} max={BENEFIT_LIMITS.F.max} />
                 </BenefitCard>

                 {/* G - Nuoc Ngoai (Requires C) */}
                 <BenefitCard 
                    code="G" title="KCB & ĐT Nước Ngoài" 
                    icon={Plane}
                    description="Phạm vi Thái Lan & Singapore. (Yêu cầu tham gia C)"
                    selected={group.chonQuyenLoiG}
                    disabled={!hasC}
                    dependencyText="Cần chọn Quyền lợi C"
                    tooltip="Mở rộng phạm vi địa lý khám chữa bệnh sang Thái Lan và Singapore. Yêu cầu tham gia quyền lợi C."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiG: v })}
                 >
                     <input type="number" value={group.stbhG} 
                           onChange={(e) => updateGroup(group.id, { stbhG: Number(e.target.value) })}
                           className={inputClass} placeholder="Hạn mức mở rộng" />
                     <p className="text-[10px] text-gray-400 mt-1 text-right">VNĐ</p>
                     <ValidationMsg val={group.stbhG} min={BENEFIT_LIMITS.G.min} max={BENEFIT_LIMITS.G.max} />
                 </BenefitCard>

                 {/* H - Income Support (Requires C) */}
                 <div className={`col-span-1 md:col-span-2 lg:col-span-2 relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${!hasC ? 'bg-gray-50 border-gray-100 opacity-60 shadow-sm' : group.chonQuyenLoiH ? 'bg-white border-phuhung-blue shadow-lg shadow-blue-50 ring-1 ring-phuhung-blue/20' : 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300'}`}>
                    <div className="flex items-start gap-3 mb-3">
                        <div className="pt-0.5">
                            <input type="checkbox" checked={group.chonQuyenLoiH} disabled={!hasC}
                                onChange={(e) => updateGroup(group.id, { chonQuyenLoiH: e.target.checked })} 
                                className={checkboxClass} />
                        </div>
                        <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <label className={`text-sm font-bold flex items-center ${group.chonQuyenLoiH ? 'text-phuhung-blue' : 'text-gray-700'}`}>
                                    <Wallet className={`w-4 h-4 mr-1.5 ${group.chonQuyenLoiH ? 'text-phuhung-blue' : 'text-gray-400'}`} />
                                    <span>H. Trợ cấp mất giảm thu nhập</span>
                                    <TooltipHelp content="Trợ cấp lương trong thời gian nằm viện điều trị do ốm đau, bệnh tật. Yêu cầu đã tham gia quyền lợi C." />
                                </label>
                                {group.chonQuyenLoiH && <Check className="w-4 h-4 text-phuhung-blue" />}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Trợ cấp lương trong thời gian điều trị (Yêu cầu tham gia C)</p>
                            {!hasC && <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded w-fit"><Info className="w-3 h-3" /> Cần chọn Quyền lợi C</div>}
                        </div>
                    </div>
                    {group.chonQuyenLoiH && (
                        <div className="mt-2 pt-3 border-t border-gray-100 pl-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Method Selection */}
                            <div className="col-span-full flex gap-6 text-sm">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-phuhung-blue">
                                    <input type="radio" 
                                        name={`methodH_${group.id}`}
                                        checked={group.methodH === BenefitHMethod.THEO_LUONG}
                                        onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_LUONG })}
                                        className="text-phuhung-blue focus:ring-phuhung-blue"
                                    />
                                    <span>Theo Lương</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer hover:text-phuhung-blue">
                                    <input type="radio" 
                                        name={`methodH_${group.id}`}
                                        checked={group.methodH === BenefitHMethod.THEO_SO_TIEN}
                                        onChange={() => updateGroup(group.id, { methodH: BenefitHMethod.THEO_SO_TIEN })}
                                        className="text-phuhung-blue focus:ring-phuhung-blue"
                                    />
                                    <span>Theo Số Tiền BH</span>
                                </label>
                            </div>

                            {/* Fields based on Method */}
                            {group.methodH === BenefitHMethod.THEO_LUONG ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Lương Trung Bình (VND)</label>
                                        <input type="number" value={group.luongTrungBinh} 
                                            onChange={(e) => updateGroup(group.id, { luongTrungBinh: Number(e.target.value) })} 
                                            className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Số tháng trợ cấp</label>
                                        <select value={group.soThangLuong} 
                                                onChange={(e) => updateGroup(group.id, { soThangLuong: Number(e.target.value) })}
                                                className={inputClass}>
                                            <option value={3}>3 tháng lương</option>
                                            <option value={6}>6 tháng lương</option>
                                            <option value={9}>9 tháng lương</option>
                                            <option value={12}>12 tháng lương</option>
                                        </select>
                                    </div>
                                    <div className="col-span-full text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2">
                                        <Info className="w-3 h-3" />
                                        Tổng STBH = {formatCurrency(group.luongTrungBinh * group.soThangLuong)} VND
                                    </div>
                                </>
                            ) : (
                                <div className="col-span-full">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Số Tiền Bảo Hiểm (VND)</label>
                                    <input type="number" value={group.stbhH} 
                                        onChange={(e) => updateGroup(group.id, { stbhH: Number(e.target.value) })}
                                        className={inputClass} />
                                    <ValidationMsg val={group.stbhH} min={BENEFIT_LIMITS.H.min} max={BENEFIT_LIMITS.H.max} />
                                </div>
                            )}
                        </div>
                    )}
                 </div>

                 {/* I - Ngo Doc (Requires A) */}
                 <BenefitCard 
                    code="I" title="Ngộ độc thức ăn / Hít khí độc" 
                    icon={Utensils}
                    description="Chi trả theo giới hạn của Quyền lợi A. (Yêu cầu tham gia A)"
                    selected={group.chonQuyenLoiI}
                    disabled={!hasA}
                    dependencyText="Cần chọn Quyền lợi A"
                    tooltip="Chi trả cho rủi ro ngộ độc thức ăn, hít phải khí độc. Yêu cầu đã tham gia quyền lợi A (Tai nạn)."
                    onToggle={(v: boolean) => updateGroup(group.id, { chonQuyenLoiI: v })}
                 >
                    <input type="number" value={group.stbhI} onChange={(e) => updateGroup(group.id, { stbhI: Number(e.target.value) })} className={inputClass} />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">VNĐ</p>
                    <ValidationMsg val={group.stbhI} min={BENEFIT_LIMITS.I.min} max={BENEFIT_LIMITS.I.max} />
                 </BenefitCard>
             </div>
          </div>

        </div>

        <div className="flex justify-end pt-6 mt-8 border-t border-gray-200">
            <button 
                onClick={() => setEditingId(null)}
                className="bg-phuhung-blue text-white px-8 py-2.5 rounded-lg hover:bg-phuhung-blueHover text-sm font-bold shadow-lg shadow-blue-900/10 transition-all flex items-center gap-2"
            >
                <Check className="w-4 h-4" /> Hoàn Tất Chọn Quyền Lợi
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-2 mb-4">
           <div className="bg-blue-50 p-2 rounded-full">
              {contractType === ContractType.NHOM ? <Users className="w-5 h-5 text-phuhung-blue" /> : <User className="w-5 h-5 text-phuhung-blue" />}
           </div>
           <h2 className="text-xl font-bold text-phuhung-blue">2. Danh Sách Người Được Bảo Hiểm</h2>
       </div>

       {groups.map((group, index) => (
          <div key={group.id} className="bg-white p-6 rounded-[8px] border border-phuhung-border shadow-sm hover:shadow-md transition-shadow">
              {/* Group Summary Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Name Input */}
                      <div className="md:col-span-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                             {contractType === ContractType.NHOM ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                             {contractType === ContractType.NHOM ? 'Tên Nhóm' : 'Họ Tên'}
                          </label>
                          <input 
                              type="text" 
                              value={group.tenNhom}
                              onChange={(e) => updateGroup(group.id, { tenNhom: e.target.value })}
                              placeholder={contractType === ContractType.NHOM ? `Nhóm ${index + 1}` : "Nguyễn Văn A"}
                              className={inputClass}
                          />
                      </div>

                      {/* DOB or Avg Age */}
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                              {contractType === ContractType.NHOM ? 'Tuổi Trung Bình' : 'Ngày Sinh'}
                          </label>
                          {contractType === ContractType.NHOM ? (
                              <div className="relative">
                                  <input 
                                      type="number" 
                                      value={group.tuoiTrungBinh || ''}
                                      onChange={(e) => updateGroup(group.id, { tuoiTrungBinh: Number(e.target.value) })}
                                      className={inputClass}
                                      placeholder="Tuổi TB"
                                  />
                              </div>
                          ) : (
                              <input 
                                  type="date"
                                  value={group.ngaySinh || ''}
                                  onChange={(e) => updateGroup(group.id, { ngaySinh: e.target.value })}
                                  className={`${inputClass} ${
                                      group.ngaySinh && !isValidAgeDate(group.ngaySinh).valid ? 'border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500' : ''
                                  }`}
                              />
                          )}
                          {contractType === ContractType.CAN_HAN && group.ngaySinh && !isValidAgeDate(group.ngaySinh).valid && (
                              <span className="text-[10px] text-red-500 mt-1 block">
                                  {isValidAgeDate(group.ngaySinh).error}
                              </span>
                          )}
                      </div>

                      {/* Gender (Individual) or Count (Group) */}
                      <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">
                              {contractType === ContractType.NHOM ? 'Số Lượng' : 'Giới Tính'}
                          </label>
                          {contractType === ContractType.NHOM ? (
                              <input 
                                  type="number"
                                  min="1"
                                  value={group.soNguoi}
                                  onChange={(e) => updateGroup(group.id, { soNguoi: Number(e.target.value) })}
                                  className={inputClass}
                              />
                          ) : (
                              <select
                                  value={group.gioiTinh}
                                  onChange={(e) => updateGroup(group.id, { gioiTinh: e.target.value as Gender })}
                                  className={inputClass}
                              >
                                  <option value={Gender.NAM}>Nam</option>
                                  <option value={Gender.NU}>Nữ</option>
                              </select>
                          )}
                      </div>

                      {/* Group Count Specifics (If Group) */}
                      {contractType === ContractType.NHOM && (
                          <div>
                               <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-1.5">Nữ (Trong nhóm)</label>
                               <input 
                                  type="number"
                                  min="0"
                                  value={group.soNu}
                                  onChange={(e) => updateGroup(group.id, { soNu: Number(e.target.value) })}
                                  className={inputClass}
                              />
                          </div>
                      )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 md:pt-0 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-100 min-w-[140px] justify-end">
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

       {/* Add Group/Person Button */}
       <button 
          onClick={addGroup}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-phuhung-blue hover:text-phuhung-blue hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
       >
          <PlusCircle className="w-5 h-5" />
          {contractType === ContractType.NHOM ? 'Thêm Nhóm Mới' : 'Thêm Người Mới'}
       </button>
    </div>
  );
};

export default InsuredList;