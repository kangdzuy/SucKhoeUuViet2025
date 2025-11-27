import React from 'react';
import { GeneralInfo, ContractType, Geography, Duration, CoPay } from '../types';
import { Info, Building2, Globe, Calendar, Percent, Briefcase } from 'lucide-react';
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
            <TooltipHelp text="Chọn 'Cá nhân' nếu tính phí cho 1 người. Chọn 'Nhóm' nếu tính phí cho nhiều nhóm người, mỗi nhóm có thể có số người và tuổi trung bình khác nhau." />
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
                <span className="text-sm text-gray-700 font-medium">Nhóm</span>
             </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-phuhung-blue" /> Phạm Vi Địa Lý</span>
            <TooltipHelp text="Phạm vi chi trả bảo hiểm. Chọn 'Việt Nam', 'Châu Á' hoặc 'Toàn Cầu' sẽ ảnh hưởng đến tỷ lệ phí gốc." />
          </label>
          <select
            value={info.phamViDiaLy}
            onChange={(e) => handleChange('phamViDiaLy', e.target.value)}
            className={inputClass}
          >
            <option value={Geography.VIETNAM}>Việt Nam</option>
            <option value={Geography.CHAU_A}>Châu Á</option>
            <option value={Geography.TOAN_CAU}>Toàn Cầu</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-phuhung-blue" /> Thời Hạn</span>
            <TooltipHelp text="Áp dụng bảng tỷ lệ phí ngắn hạn: 3 tháng (30%), 6 tháng (50%), 9 tháng (75%) hoặc đủ năm (100%)." />
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

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Percent className="w-4 h-4 text-phuhung-blue" /> Mức Đồng Chi Trả</span>
            <TooltipHelp text="Nếu khách hàng đồng ý cùng chi trả % chi phí y tế (Co-pay), phí bảo hiểm sẽ được giảm tương ứng." />
          </label>
          <select
            value={info.mucDongChiTra}
            onChange={(e) => handleChange('mucDongChiTra', e.target.value)}
            className={inputClass}
          >
            {Object.values(CoPay).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-phuhung-blue" /> Tỷ Lệ Bồi Thường (%)</span>
            <TooltipHelp text="Chỉ áp dụng cho hợp đồng Nhóm. Dùng để tăng hoặc giảm phí dựa trên lịch sử bồi thường (Loss Ratio) năm trước." />
          </label>
          <input
            type="number"
            min="0"
            disabled={info.loaiHopDong !== ContractType.NHOM}
            value={info.tyLeBoiThuongNamTruoc}
            onChange={(e) => handleChange('tyLeBoiThuongNamTruoc', parseFloat(e.target.value) || 0)}
            className={`${inputClass} ${info.loaiHopDong !== ContractType.NHOM ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}`}
            placeholder={info.loaiHopDong !== ContractType.NHOM ? "Chỉ áp dụng cho nhóm" : "0"}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoForm;