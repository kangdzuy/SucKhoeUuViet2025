import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { Calculator, AlertCircle, CheckCircle2, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  result: CalculationResult;
  onExport: () => void;
}

const formatMoney = (val: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

// Helper to format percentage with sign (e.g., +10%, -5%)
const formatSignedPercent = (val: number) => {
  const p = Math.round(val * 100);
  if (p > 0) return `+${p}%`;
  return `${p}%`;
}

const ResultsSummary: React.FC<Props> = ({ result, onExport }) => {
  const [showDetails, setShowDetails] = useState(false);
  const hasErrors = result.validationErrors && result.validationErrors.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-phuhung-blue/20 overflow-hidden animate-in fade-in slide-in-from-right-4 ring-1 ring-black/5">
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${hasErrors ? 'bg-red-600' : 'bg-phuhung-blue'}`}>
          <div className="flex items-center gap-2 text-white">
             {hasErrors ? <AlertCircle className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
             <h2 className="font-bold text-lg">{hasErrors ? 'Lưu ý quan trọng' : 'Kết Quả Tính Phí'}</h2>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
             {result.tongSoNguoi} người
          </span>
      </div>

      {/* Main Price Card */}
      <div className="p-6 bg-gradient-to-b from-blue-50 to-white text-center border-b border-gray-100">
          
          {hasErrors ? (
              <div className="text-left space-y-2">
                 {result.validationErrors.map((err, idx) => (
                     <div key={idx} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                         <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                         <span>{err}</span>
                     </div>
                 ))}
                 <p className="text-xs text-center text-gray-500 mt-2">Phí tạm tính bên dưới chưa có hiệu lực cho đến khi thỏa mãn điều kiện.</p>
              </div>
          ) : (
             <p className="text-phuhung-textSec text-xs font-semibold uppercase tracking-wider mb-2">Tổng Phí Cuối Cùng</p>
          )}

          <div className={`text-4xl font-extrabold tracking-tight drop-shadow-sm mb-1 mt-4 ${hasErrors ? 'text-gray-400 decoration-line-through' : 'text-phuhung-orange'}`}>
              {formatMoney(result.phiCuoi).replace('₫', '')} <span className="text-lg font-medium">₫</span>
          </div>
          
          {/* Validity Badge */}
          <div className="flex justify-center mt-3">
            {hasErrors ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> Chưa đủ điều kiện
                </span>
            ) : result.phiCuoi <= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> Phí không hợp lệ
                </span>
            ) : result.isFloorApplied ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700" title={`Phí tính toán: ${formatMoney(result.tongPhiGoc * result.adjFactor * result.heSoThoiHan)}`}>
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
      <div className={`p-5 space-y-4 text-sm bg-white ${hasErrors ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            
            {/* Step 1: Base */}
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-600">Tổng phí gốc (chưa giảm)</span>
                <span className="font-semibold text-gray-900">{formatMoney(result.tongPhiGoc)}</span>
            </div>
            
            {/* Factors */}
            <div className="space-y-2.5 pl-2 border-l-2 border-gray-100">
                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Đồng chi trả (Co-pay)</span>
                    <span className={result.percentCopay !== 0 ? "text-gray-800 font-medium" : "text-gray-300"}>
                        {formatSignedPercent(result.percentCopay)}
                    </span>
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Quy mô nhóm</span>
                    <span className={result.percentGroup !== 0 ? "text-gray-800 font-medium" : "text-gray-300"}>
                        {formatSignedPercent(result.percentGroup)}
                    </span>
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Loss Ratio (Tăng/Giảm)</span>
                    <span className={result.percentLR !== 0 ? (result.percentLR > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold") : "text-gray-300"}>
                        {formatSignedPercent(result.percentLR)}
                    </span>
                </div>

                {/* Total Adjustment Line */}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-phuhung-blue font-semibold text-xs">Tổng % Tăng/Giảm</span>
                    <span className={`font-bold text-xs ${result.totalAdjPercent > 0 ? 'text-red-600' : result.totalAdjPercent < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatSignedPercent(result.totalAdjPercent)}
                    </span>
                </div>
            </div>

            {/* Step 2: After Discounts */}
            <div className="flex justify-between items-center pt-2 pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-800 font-medium">Tổng phí sau tăng/giảm</span>
                <span className="font-bold text-blue-800">{formatMoney(result.tongPhiSauGiam)}</span>
            </div>

            {/* Step 3: Duration */}
            <div className="flex justify-between items-center text-gray-500 text-xs">
                <span>Hệ số thời hạn (Ngắn hạn)</span>
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">x{result.heSoThoiHan}</span>
            </div>
             
             {/* Step 4: Min Fee */}
             <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                 <span className="text-gray-500 text-xs">Sàn phí thuần (Min)</span>
                 <span className="font-mono text-gray-500 text-xs">{formatMoney(result.phiThuanSauHeSo)}</span>
            </div>
      </div>

      {/* Action Area */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <button 
            onClick={onExport}
            disabled={hasErrors}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold shadow-md transition-all transform ${hasErrors ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 active:scale-[0.98]'}`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            {hasErrors ? 'Vui lòng kiểm tra lỗi' : 'Xuất Báo Giá Excel'}
          </button>

          {result.tongSoNguoi > 0 && !hasErrors && (
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
      {showDetails && result.tongSoNguoi > 0 && !hasErrors && (
         <div className="bg-white border-t border-gray-200 max-h-60 overflow-y-auto">
             <table className="w-full text-left text-[10px] text-gray-600">
                 <thead className="bg-gray-50 text-gray-700 font-semibold uppercase sticky top-0">
                     <tr>
                         <th className="p-2 border-b">Tên</th>
                         <th className="p-2 border-b text-right">Phí Gốc</th>
                         <th className="p-2 border-b text-right">Phí Cuối (Sau giảm)</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {result.detailByGroup.map(g => {
                         let finalGroupPrice = 0;
                         if (result.isFloorApplied) {
                             finalGroupPrice = g.tongPhiThuanToiThieu * result.heSoThoiHan;
                         } else {
                             const adjusted = Math.round(g.tongPhiGoc * result.adjFactor);
                             finalGroupPrice = adjusted * result.heSoThoiHan;
                         }
                         
                         return (
                            <tr key={g.id}>
                                <td className="p-2 truncate max-w-[100px]" title={g.tenNhom}>{g.tenNhom || '(Trống)'}</td>
                                <td className="p-2 text-right font-mono text-phuhung-blue">{formatMoney(g.tongPhiGoc)}</td>
                                <td className="p-2 text-right font-mono text-gray-800 font-bold">{formatMoney(finalGroupPrice)}</td>
                            </tr>
                         );
                     })}
                 </tbody>
             </table>
         </div>
      )}
    </div>
  );
};

export default ResultsSummary;