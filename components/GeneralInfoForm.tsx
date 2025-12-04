
import React from 'react';
import { GeneralInfo, ContractType, Duration, RenewalStatus } from '../types';
import { Info, Building2, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import TooltipHelp from './TooltipHelp';

interface Props {
  info: GeneralInfo;
  onChange: (newInfo: GeneralInfo) => void;
}

const GeneralInfoForm: React.FC<Props> = ({ info, onChange }) => {
  const handleChange = (field: keyof GeneralInfo, value: any) => {
    onChange({ ...info, [field]: value });
  };

  // Styles updated: Bg #F9FAFB, Border #E0E4EC, Text #111827
  const inputClass = "w-full bg-[#F9FAFB] border-[#E0E4EC] rounded-[6px] shadow-sm focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue px-3 py-2.5 border text-[#111827] placeholder-[#9CA3AF] transition-all text-sm";
  const labelClass = "block text-sm font-medium text-phuhung-text mb-1.5 flex items-center";

  // Check if Continuous Renewal is selected
  const isContinuous = info.renewalStatus === RenewalStatus.CONTINUOUS;
  const isGroup = info.loaiHopDong === ContractType.NHOM;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[8px] shadow-sm border border-phuhung-border">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-phuhung-border">
        <div className="bg-blue-50 p-2 rounded-full">
          <Info className="w-5 h-5 text-phuhung-blue" />
        </div>
        <h2 className="text-xl font-bold text-phuhung-blue">1. Thông Tin Chung</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <label className={labelClass}>Tên Khách Hàng / Công Ty</label>
          <input
            type="text"
            value={info.tenKhachHang}
            onChange={(e) => handleChange('tenKhachHang', e.target.value)}
            className={inputClass}
            placeholder="Nhập tên khách hàng..."
          />
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-phuhung-blue" /> Loại Hợp Đồng</span>
            <TooltipHelp content="Chọn 'Cá nhân' nếu tính phí cho 1 người. Chọn 'Nhóm' nếu tính phí cho tập thể từ 5 người trở lên." />
          </label>
          <div className="flex gap-4 mt-2">
             <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E0E4EC]">
                <input 
                  type="radio" 
                  name="loaiHopDong"
                  value={ContractType.CAN_HAN}
                  checked={info.loaiHopDong === ContractType.CAN_HAN}
                  onChange={(e) => handleChange('loaiHopDong', e.target.value)}
                  className="w-4 h-4 text-phuhung-blue focus:ring-phuhung-blue border-gray-300"
                />
                <span className="text-sm text-gray-700 font-medium">Cá nhân</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#F9FAFB] transition-colors border border-transparent hover:border-[#E0E4EC]">
                <input 
                  type="radio" 
                  name="loaiHopDong"
                  value={ContractType.NHOM}
                  checked={info.loaiHopDong === ContractType.NHOM}
                  onChange={(e) => handleChange('loaiHopDong', e.target.value)}
                  className="w-4 h-4 text-phuhung-blue focus:ring-phuhung-blue border-gray-300"
                />
                <span className="text-sm text-gray-700 font-medium">Nhóm (≥ 5 người)</span>
             </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-phuhung-blue" /> Thời Hạn</span>
            <TooltipHelp content="Áp dụng bảng tỷ lệ phí ngắn hạn: 3 tháng (30%), 6 tháng (50%), 9 tháng (75%) hoặc đủ năm (100%)." />
          </label>
          <select
            value={info.thoiHanBaoHiem}
            onChange={(e) => handleChange('thoiHanBaoHiem', e.target.value)}
            className={inputClass}
          >
            <option value={Duration.DEN_3_THANG}>Đến 3 Tháng (30%)</option>
            <option value={Duration.DEN_6_THANG}>Đến 6 Tháng (50%)</option>
            <option value={Duration.DEN_9_THANG}>Đến 9 Tháng (75%)</option>
            <option value={Duration.TREN_9_THANG}>Trên 9 Tháng (100%)</option>
          </select>
        </div>
        
        {/* Renewal Status & Loss Ratio - ONLY FOR GROUPS */}
        {isGroup && (
          <>
            <div className="animate-in fade-in slide-in-from-top-2">
                <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-phuhung-blue" /> Tái Tục (Chỉ dành cho Nhóm)</span>
                    <TooltipHelp content="Chọn 'Có tái tục liên tục' để được áp dụng giảm phí nếu Loss Ratio tốt. Chọn 'Không' nếu là đơn mới hoặc gián đoạn (chỉ bị tăng phí nếu Loss Ratio xấu)." />
                </label>
                <div className="flex flex-col gap-2 mt-2">
                    <label className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors border ${info.renewalStatus === RenewalStatus.CONTINUOUS ? 'bg-blue-50 border-phuhung-blue' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                        <input 
                        type="radio" 
                        name="renewalStatus"
                        value={RenewalStatus.CONTINUOUS}
                        checked={info.renewalStatus === RenewalStatus.CONTINUOUS}
                        onChange={(e) => handleChange('renewalStatus', e.target.value)}
                        className="w-4 h-4 text-phuhung-blue focus:ring-phuhung-blue border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">Có tái tục liên tục</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors border ${info.renewalStatus === RenewalStatus.NON_CONTINUOUS ? 'bg-blue-50 border-phuhung-blue' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                        <input 
                        type="radio" 
                        name="renewalStatus"
                        value={RenewalStatus.NON_CONTINUOUS}
                        checked={info.renewalStatus === RenewalStatus.NON_CONTINUOUS}
                        onChange={(e) => handleChange('renewalStatus', e.target.value)}
                        className="w-4 h-4 text-phuhung-blue focus:ring-phuhung-blue border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">Không (Mới / Gián đoạn)</span>
                    </label>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-top-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-phuhung-blue" /> Tỷ Lệ Bồi Thường (%)</span>
                <TooltipHelp content="Nhập tỷ lệ bồi thường năm trước (nếu có). Nếu chọn 'Không tái tục liên tục', hệ thống chỉ áp dụng tăng phí (không giảm phí)." />
              </label>
              <div className="relative">
                <input
                    type="number"
                    min="0"
                    value={info.tyLeBoiThuongNamTruoc}
                    onChange={(e) => handleChange('tyLeBoiThuongNamTruoc', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                    placeholder="0"
                />
                {info.tyLeBoiThuongNamTruoc > 0 && (
                    <div className="absolute top-full left-0 mt-1 text-[10px]">
                        {!isContinuous ? (
                            <span className="text-orange-600 font-medium">* Chỉ áp dụng Tăng phí (nếu có)</span>
                        ) : (
                            <span className="text-green-600 font-medium">* Áp dụng Tăng hoặc Giảm phí</span>
                        )}
                    </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneralInfoForm;
