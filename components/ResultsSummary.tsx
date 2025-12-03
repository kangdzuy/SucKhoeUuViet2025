import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { Calculator, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  result: CalculationResult;
  onExport: () => void;
}

const formatMoney = (val: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatPercent = (factor: number) => {
  const p = Math.round((Math.abs(1 - factor)) * 100);
  return `${p}%`;
}

const ResultsSummary: React.FC<Props> = ({ result, onExport }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-phuhung-blue/20 overflow-hidden animate-in fade-in slide-in-from-right-4 ring-1 ring-black/5">
      
      {/* Header */}
      <div className="bg-phuhung-blue p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
             <Calculator className="w-5 h-5" />
             <h2 className="font-bold text-lg">Kết Quả Tính Phí</h2>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
             {result.tongSoNguoi} người
          </span>
      </div>

      {/* Main Price Card */}
      <div className="p-6 bg-gradient-to-b from-blue-50 to-white text-center border-b border-gray-100">
          <p className="text-phuhung-textSec text-xs font-semibold uppercase tracking-wider mb-2">Tổng Phí Cuối Cùng</p>
          <div className="text-4xl font-extrabold text-phuhung-orange tracking-tight drop-shadow-sm mb-1">
              {formatMoney(result.phiCuoi).replace('₫', '')} <span className="text-lg text-gray-400 font-medium">₫</span>
          </div>
          
          {/* Validity Badge */}
          <div className="flex justify-center mt-3">
            {result.phiCuoi <= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> Phí không hợp lệ
                </span>
            ) : result.isFloorApplied ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                     <AlertCircle className="w-3 h-3" /> Đã áp dụng sàn phí thuần
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3" /> Phí hợp lệ
                </span>
            )}
          </div>
      </div>

      {/* Breakdown Details - Vertical Stack */}
      <div className="p-5 space-y-4 text-sm bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-600">Tổng Phí Gốc</span>
                <span className="font-semibold text-gray-900">{formatMoney(result.tongPhiGoc)}</span>
            </div>
            
            <div className="space-y-2.5">
                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Hệ số thời hạn</span>
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">x{result.heSoThoiHan}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Giảm đồng chi trả (Co-pay)</span>
                    {result.heSoDongChiTra < 1 ? (
                        <span className="text-green-600 font-bold">-{formatPercent(result.heSoDongChiTra)}</span>
                    ) : <span className="text-gray-300">0%</span>}
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Giảm quy mô nhóm</span>
                    {result.heSoGiamNhom < 1 ? (
                        <span className="text-green-600 font-bold">-{formatPercent(result.heSoGiamNhom)}</span>
                    ) : <span className="text-gray-300">0%</span>}
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Điều chỉnh Loss Ratio</span>
                    <div className="flex items-center gap-1">
                        {result.heSoTangLR > 1 && (
                            <span className="text-red-600 font-bold">+{formatPercent(result.heSoTangLR)}</span>
                        )}
                        {result.heSoGiamLR < 1 && (
                            <span className="text-green-600 font-bold">-{formatPercent(result.heSoGiamLR)}</span>
                        )}
                        {result.heSoTangLR === 1 && result.heSoGiamLR === 1 && <span className="text-gray-300">--</span>}
                    </div>
                </div>
            </div>
             
             <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                 <span className="text-gray-500 text-xs">Sàn phí thuần (Min)</span>
                 <span className="font-mono text-gray-500 text-xs">{formatMoney(result.phiThuanSauHeSo)}</span>
            </div>
      </div>

      {/* Action Area */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <button 
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md shadow-green-200 transition-all transform active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Xuất Báo Giá Excel
          </button>

          {result.tongSoNguoi > 0 && (
             <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-phuhung-blue py-2"
             >
                {showDetails ? 'Thu gọn chi tiết' : 'Xem chi tiết từng nhóm'}
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
             </button>
          )}
      </div>

      {/* Expandable Details Table */}
      {showDetails && result.tongSoNguoi > 0 && (
         <div className="bg-white border-t border-gray-200 max-h-60 overflow-y-auto">
             <table className="w-full text-left text-[10px] text-gray-600">
                 <thead className="bg-gray-50 text-gray-700 font-semibold uppercase sticky top-0">
                     <tr>
                         <th className="p-2 border-b">Tên</th>
                         <th className="p-2 border-b text-right">Phí Gốc</th>
                         <th className="p-2 border-b text-right">Phí Min</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {result.detailByGroup.map(g => (
                         <tr key={g.id}>
                             <td className="p-2 truncate max-w-[100px]" title={g.tenNhom}>{g.tenNhom || '(Trống)'}</td>
                             <td className="p-2 text-right font-mono text-phuhung-blue">{formatMoney(g.tongPhiGoc)}</td>
                             <td className="p-2 text-right font-mono text-gray-400">{formatMoney(g.tongPhiThuanToiThieu)}</td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      )}
    </div>
  );
};

export default ResultsSummary;