import React, { useState, useEffect } from 'react';
import { InsuranceGroup, Gender, ContractType } from '../types';
import { calculateAge } from '../services/calculationService';
import { SI_BANDS_C, SI_BANDS_E, SI_BANDS_F } from '../constants';
import { Trash2, PlusCircle, Edit3, Users, User } from 'lucide-react';
import TooltipHelp from './TooltipHelp';

interface Props {
  groups: InsuranceGroup[];
  contractType: ContractType;
  onChange: (newGroups: InsuranceGroup[]) => void;
}

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

const InsuredList: React.FC<Props> = ({ groups, contractType, onChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Benefit Descriptions for Tooltips
  const benefitTooltips: Record<string, string> = {
    A: "Bảo hiểm chết và thương tật toàn bộ vĩnh viễn do tai nạn.",
    B: "Bảo hiểm chết và thương tật toàn bộ vĩnh viễn do ốm đau, bệnh tật.",
    C: "Chi phí y tế điều trị nội trú do ốm đau, bệnh tật, thai sản.",
    D: "Quyền lợi thai sản (biến chứng thai sản, sinh thường, sinh mổ).",
    E: "Chi phí y tế điều trị ngoại trú do ốm đau, bệnh tật.",
    F: "Chăm sóc và điều trị răng.",
    G: "Mở rộng phạm vi điều trị sang Thái Lan & Singapore.",
    H: "Trợ cấp mất giảm thu nhập trong thời gian điều trị.",
    I: "Trợ cấp do ngộ độc thức ăn, đồ uống, hít phải khí độc."
  };

  // Default Benefit Template
  const defaultBenefits = {
    chonQuyenLoiA: false, stbhA: 100000000,
    chonQuyenLoiB: false, stbhB: 100000000,
    chonQuyenLoiC: true, stbhC: 40000000,
    chonQuyenLoiD: false, stbhD: 10000000,
    chonQuyenLoiE: false, stbhE: 5000000,
    chonQuyenLoiF: false, stbhF: 2000000,
    chonQuyenLoiG: false, stbhG: 0,
    chonQuyenLoiH: false, stbhH: 0,
    chonQuyenLoiI: false, stbhI: 0,
  };

  // Ensure there is at least 1 group for Individual mode
  useEffect(() => {
    if (contractType === ContractType.CAN_HAN) {
      if (groups.length === 0) {
        // Create initial individual
        const initialInd: InsuranceGroup = {
            id: crypto.randomUUID(),
            tenNhom: '',
            soNguoi: 1,
            tuoiTrungBinh: 0,
            ngaySinh: '1990-01-01',
            gioiTinh: Gender.NAM,
            ...defaultBenefits
        };
        // Auto-calc initial age
        initialInd.tuoiTrungBinh = calculateAge(initialInd.ngaySinh!);
        onChange([initialInd]);
        setEditingId(initialInd.id); // Open edit immediately
      } else if (groups.length > 1) {
        // Force only 1 group if Individual
        onChange([groups[0]]);
      }
    }
  }, [contractType]);

  const addGroup = () => {
    const newGroup: InsuranceGroup = {
      id: crypto.randomUUID(),
      tenNhom: '',
      soNguoi: 1,
      tuoiTrungBinh: 30, // Default avg age
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
      const updated = { ...p, ...updates };
      
      // Special logic: if individual mode, and DOB changed, update avg age
      if (contractType === ContractType.CAN_HAN && updates.ngaySinh) {
        updated.tuoiTrungBinh = calculateAge(updates.ngaySinh);
      }
      return updated;
    }));
  };

  // Styles updated: Bg #F9FAFB, Border #E0E4EC, Text #111827
  const inputClass = "w-full text-sm bg-[#F9FAFB] border-[#E0E4EC] text-[#111827] placeholder-[#9CA3AF] rounded-[4px] shadow-sm focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue px-2 py-1.5 border transition-all disabled:bg-gray-100 disabled:text-gray-400";
  const checkboxClass = "w-4 h-4 text-phuhung-blue border-gray-300 rounded focus:ring-phuhung-blue cursor-pointer";

  // Modal or Panel for editing details
  const renderEditBenefits = (group: InsuranceGroup) => {
    return (
      <div className="mt-4 p-5 border border-phuhung-blue/20 bg-blue-50/50 rounded-lg animate-in fade-in zoom-in-95 duration-200">
        <h4 className="font-semibold text-phuhung-blue mb-4 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-phuhung-blue inline-block"></span>
           Chọn Quyền Lợi Bảo Hiểm
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
          {/* Helper to render a benefit row */}
          {[
              { code: 'A', label: 'Tai Nạn', val: group.stbhA, set: 'stbhA', check: group.chonQuyenLoiA, setCheck: 'chonQuyenLoiA', type: 'number' },
              { code: 'B', label: 'Sinh Mạng', val: group.stbhB, set: 'stbhB', check: group.chonQuyenLoiB, setCheck: 'chonQuyenLoiB', type: 'number' },
              { code: 'C', label: 'Nội Trú (Bậc)', val: group.stbhC, set: 'stbhC', check: group.chonQuyenLoiC, setCheck: 'chonQuyenLoiC', type: 'select', options: SI_BANDS_C },
              { code: 'D', label: 'Thai Sản', val: group.stbhD, set: 'stbhD', check: group.chonQuyenLoiD, setCheck: 'chonQuyenLoiD', type: 'number' },
              { code: 'E', label: 'Ngoại Trú (Bậc)', val: group.stbhE, set: 'stbhE', check: group.chonQuyenLoiE, setCheck: 'chonQuyenLoiE', type: 'select', options: SI_BANDS_E },
              { code: 'F', label: 'Nha Khoa (Bậc)', val: group.stbhF, set: 'stbhF', check: group.chonQuyenLoiF, setCheck: 'chonQuyenLoiF', type: 'select', options: SI_BANDS_F },
              { code: 'G', label: 'Điều Trị Nước Ngoài', val: group.stbhG, set: 'stbhG', check: group.chonQuyenLoiG, setCheck: 'chonQuyenLoiG', type: 'number' },
              { code: 'H', label: 'Mất Giảm Thu Nhập', val: group.stbhH, set: 'stbhH', check: group.chonQuyenLoiH, setCheck: 'chonQuyenLoiH', type: 'number' },
              { code: 'I', label: 'Ngộ Độc/Khí Độc', val: group.stbhI, set: 'stbhI', check: group.chonQuyenLoiI, setCheck: 'chonQuyenLoiI', type: 'number' }
          ].map((item: any) => (
             <div key={item.code} className={`flex items-start gap-3 p-2 rounded-md transition-colors ${item.check ? 'bg-white shadow-sm border border-blue-100' : 'opacity-70'}`}>
                <input 
                  type="checkbox" 
                  checked={item.check} 
                  onChange={(e) => updateGroup(group.id, { [item.setCheck]: e.target.checked })}
                  className={`${checkboxClass} mt-2.5`}
                />
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                      <label className="text-xs font-bold text-phuhung-text block">{item.code}. {item.label}</label>
                      <TooltipHelp text={benefitTooltips[item.code]} />
                  </div>
                  {item.type === 'select' ? (
                     <select 
                        disabled={!item.check}
                        value={item.val} 
                        onChange={(e) => updateGroup(group.id, { [item.set]: parseFloat(e.target.value) })}
                        className={inputClass}
                     >
                        {item.options.map((val: number) => (
                           <option key={val} value={val}>{formatCurrency(val)}</option>
                        ))}
                     </select>
                  ) : (
                      <input 
                        type="number" 
                        disabled={!item.check}
                        value={item.val} 
                        onChange={(e) => updateGroup(group.id, { [item.set]: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                      />
                  )}
                </div>
             </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-blue-200/50">
            <button 
                onClick={() => setEditingId(null)}
                className="bg-phuhung-blue text-white px-6 py-2 rounded-md hover:bg-phuhung-blueHover text-sm font-medium shadow-sm transition-colors"
            >
                Hoàn Tất
            </button>
        </div>
      </div>
    );
  };

  const isIndividual = contractType === ContractType.CAN_HAN;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[8px] shadow-sm border border-phuhung-border mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-full">
                {isIndividual ? <User className="w-5 h-5 text-phuhung-blue" /> : <Users className="w-5 h-5 text-phuhung-blue" />}
            </div>
            <h2 className="text-xl font-bold text-phuhung-blue">
                {isIndividual ? '2. Thông Tin Người Được Bảo Hiểm' : '2. Danh Sách Nhóm Bảo Hiểm'}
            </h2>
        </div>
        
        {!isIndividual && (
          <button 
            onClick={addGroup}
            className="flex items-center gap-2 bg-phuhung-orange text-white px-5 py-2.5 rounded-[6px] hover:bg-phuhung-orangeHover font-bold text-sm shadow-md shadow-orange-100 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" /> THÊM NHÓM
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group, index) => (
          <div key={group.id} className={`border rounded-lg ${editingId === group.id ? 'border-phuhung-blue ring-1 ring-phuhung-blue/20' : 'border-phuhung-border'} overflow-hidden transition-all`}>
              
              {/* Group Row Header / Main Info */}
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:items-center gap-4">
                  
                  {/* Info Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      {isIndividual ? (
                        <>
                            <div className="md:col-span-4">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Họ và Tên</label>
                                <input 
                                    type="text" 
                                    value={group.tenNhom} 
                                    onChange={(e) => updateGroup(group.id, { tenNhom: e.target.value })}
                                    className={inputClass} 
                                    placeholder="Nhập tên người được bảo hiểm"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Ngày Sinh</label>
                                <input 
                                    type="date" 
                                    value={group.ngaySinh} 
                                    onChange={(e) => updateGroup(group.id, { ngaySinh: e.target.value })}
                                    className={inputClass} 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tuổi</label>
                                <div className="py-1.5 px-3 bg-gray-200 rounded text-sm font-bold text-gray-700 text-center">
                                    {group.tuoiTrungBinh}
                                </div>
                            </div>
                        </>
                      ) : (
                        <>
                            <div className="md:col-span-1 text-center flex items-center justify-center">
                                <span className="bg-phuhung-blue text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">
                                    {index + 1}
                                </span>
                            </div>
                            <div className="md:col-span-4">
                                <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
                                    Tên Nhóm 
                                    <TooltipHelp text="Đặt tên gợi nhớ cho nhóm (Ví dụ: Khối văn phòng, Ban Giám Đốc...)" />
                                </label>
                                <input 
                                    type="text" 
                                    value={group.tenNhom} 
                                    onChange={(e) => updateGroup(group.id, { tenNhom: e.target.value })}
                                    className={inputClass} 
                                    placeholder="VD: Ban Giám Đốc"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
                                    Số Người
                                    <TooltipHelp text="Số lượng người trong nhóm này có cùng quyền lợi bảo hiểm." />
                                </label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={group.soNguoi} 
                                    onChange={(e) => updateGroup(group.id, { soNguoi: parseInt(e.target.value) || 1 })}
                                    className={inputClass} 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center">
                                    Tuổi TB
                                    <TooltipHelp text="Tuổi trung bình = Tổng số tuổi của cả nhóm / Số người trong nhóm. Dùng để tra bảng tỷ lệ phí." />
                                </label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={group.tuoiTrungBinh} 
                                    onChange={(e) => updateGroup(group.id, { tuoiTrungBinh: parseFloat(e.target.value) || 0 })}
                                    className={inputClass} 
                                />
                            </div>
                        </>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 md:border-l md:pl-4 border-gray-200">
                      <button 
                        onClick={() => setEditingId(editingId === group.id ? null : group.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${editingId === group.id ? 'bg-phuhung-blue text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                      >
                         <Edit3 className="w-3.5 h-3.5" />
                         {editingId === group.id ? 'Đóng Quyền Lợi' : 'Chọn Quyền Lợi'}
                      </button>
                      
                      {!isIndividual && (
                          <button 
                            onClick={() => removeGroup(group.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Xóa nhóm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      )}
                  </div>
              </div>

              {/* Collapsible Benefit Form */}
              {editingId === group.id && (
                  <div className="p-4 bg-white border-t border-gray-100">
                      {renderEditBenefits(group)}
                  </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsuredList;