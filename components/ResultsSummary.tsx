import React from 'react';
import { CalculationResult } from '../types';
import { Calculator, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  result: CalculationResult;
}

const formatMoney = (val: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const formatPercent = (factor: number) => {
  const p = Math.round((Math.abs(1 - factor)) * 100);
  return `${p}%`;
}

const ResultsSummary: React.FC<Props> = ({ result }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[8px] shadow-sm border border-phuhung-border mt-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-phuhung-border">
         <div className="bg-phuhung-blue p-2 rounded-lg text-white shadow-md shadow-blue-200">
            <Calculator className="w-6 h-6" />
         </div>
         <h2 className="text-xl font-bold text-phuhung-blue">3. Kết Quả Tính Phí</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Breakdown */}
        <div className="space-y-4 text-sm">
            <h3 className="text-base font-bold text-phuhung-text mb-2">Chi tiết tính toán</h3>
            
            <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
                <div>
                   <span className="text-phuhung-textSec font-medium block">Tổng Phí Gốc (Base Premium)</span>
                   <span className="text-xs text-gray-400">
                       ({result.tongSoNhom} nhóm, {result.tongSoNguoi} người)
                   </span>
                </div>
                <span className="font-mono text-lg font-bold text-phuhung-text">{formatMoney(result.tongPhiGoc)}</span>
            </div>
            
            <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                <div className="flex justify-between items-center text-phuhung-textSec">
                    <span>Hệ số thời hạn (ngắn hạn)</span>
                    <span className="font-mono text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200 font-bold">x{result.heSoThoiHan}</span>
                </div>

                <div className="flex justify-between items-center text-phuhung-textSec">
                    <span>Giảm phí đồng chi trả (Co-pay)</span>
                    {result.heSoDongChiTra < 1 ? (
                        <div className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                            <TrendingDown className="w-3 h-3" />
                            <span className="font-mono">{formatPercent(result.heSoDongChiTra)}</span>
                        </div>
                    ) : <span className="text-gray-400 font-mono">0%</span>}
                </div>

                <div className="flex justify-between items-center text-phuhung-textSec">
                    <span>Giảm phí quy mô nhóm ({result.tongSoNguoi} người)</span>
                    {result.heSoGiamNhom < 1 ? (
                         <div className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                            <TrendingDown className="w-3 h-3" />
                            <span className="font-mono">{formatPercent(result.heSoGiamNhom)}</span>
                        </div>
                    ) : <span className="text-gray-400 font-mono">0%</span>}
                </div>

                <div className="flex justify-between items-center text-phuhung-textSec">
                    <span>Điều chỉnh theo Loss Ratio</span>
                    <div className="flex items-center gap-2">
                        {result.heSoTangLR > 1 && (
                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            <TrendingUp className="w-3 h-3" /> Tăng {formatPercent(result.heSoTangLR)}
                            </span>
                        )}
                        {result.heSoGiamLR < 1 && (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            <TrendingDown className="w-3 h-3" /> Giảm {formatPercent(result.heSoGiamLR)}
                            </span>
                        )}
                        {result.heSoTangLR === 1 && result.heSoGiamLR === 1 && <span className="text-gray-400 text-xs font-mono">--</span>}
                    </div>
                </div>
            </div>
             
             <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                 <span className="text-phuhung-text font-semibold">Phí thương mại sơ bộ</span>
                 <span className="font-mono text-phuhung-text font-bold">{formatMoney(result.phiSauLR)}</span>
            </div>
        </div>

        {/* Right Column: Final Calculation & Floor Check */}
        <div className="bg-[#F8F9FB] p-6 rounded-lg flex flex-col justify-center border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-phuhung-orange/5 rounded-bl-full"></div>
            
            <div className="mb-8 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                     <p className="text-phuhung-textSec text-sm font-medium uppercase tracking-wider">Tổng Phí Cuối Cùng</p>
                     <span className="bg-phuhung-orange text-white text-[10px] px-1.5 py-0.5 rounded font-bold">VND</span>
                </div>
                <span className="text-4xl sm:text-5xl font-extrabold text-phuhung-orange tracking-tight drop-shadow-sm">
                    {formatMoney(result.phiCuoi).replace('₫', '')}
                </span>
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-3 relative z-10">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Sàn phí thuần (Minimum Pure Premium)</span>
                    <span className="font-mono text-sm text-gray-600 font-medium">{formatMoney(result.phiThuanSauHeSo)}</span>
                </div>

                {result.isFloorApplied ? (
                    <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-md border border-orange-200">
                        <AlertCircle className="w-5 h-5 text-phuhung-orange mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-gray-800 font-bold">Đã áp dụng sàn phí thuần</p>
                            <p className="text-xs text-gray-600 mt-0.5">Phí thương mại tính toán thấp hơn phí thuần tối thiểu quy định.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-green-50 p-3 rounded-md border border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                            Phí hợp lệ (Cao hơn sàn phí thuần).
                        </span>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Detailed Table Link/View */}
      {result.tongSoNguoi > 0 && (
         <div className="mt-8 pt-8 border-t border-gray-100">
             <h3 className="text-sm font-bold text-phuhung-text mb-4 uppercase tracking-wide">Chi tiết các nhóm</h3>
             <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                 <table className="w-full text-left text-xs text-gray-600">
                     <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
                         <tr>
                             <th className="p-3 border-b border-gray-200">Tên Nhóm / Cá Nhân</th>
                             <th className="p-3 border-b border-gray-200 text-center">Số Người</th>
                             <th className="p-3 border-b border-gray-200 text-center">Tuổi TB</th>
                             <th className="p-3 border-b border-gray-200 text-right">Tổng phí gốc nhóm</th>
                             <th className="p-3 border-b border-gray-200 text-right">Phí thuần Min nhóm</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white">
                         {result.detailByGroup.map(g => (
                             <tr key={g.id} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
                                 <td className="p-3 font-medium text-phuhung-text">{g.tenNhom || '(Chưa đặt tên)'}</td>
                                 <td className="p-3 text-center">{g.soNguoi}</td>
                                 <td className="p-3 text-center">{g.tuoiTrungBinh}</td>
                                 <td className="p-3 text-right font-mono text-phuhung-blue">{formatMoney(g.tongPhiGoc)}</td>
                                 <td className="p-3 text-right font-mono text-gray-400">{formatMoney(g.tongPhiThuanToiThieu)}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         </div>
      )}
    </div>
  );
};

export default ResultsSummary;