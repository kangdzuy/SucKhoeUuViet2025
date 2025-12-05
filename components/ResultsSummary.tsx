import React, { useState } from 'react';
import { CalculationResult, Geography } from '../types';
import { Calculator, AlertCircle, Shield, FileSpreadsheet, ChevronDown, ChevronUp, ShieldCheck, Info } from 'lucide-react';
import TooltipHelp from './TooltipHelp';
import { useLanguage } from '../services/languageService';

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
  const { t } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const hasErrors = result.validationErrors && result.validationErrors.length > 0;

  const toggleGroup = (id: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedGroups(newSet);
  };

  const expandAll = () => {
    if (expandedGroups.size === result.detailByGroup.length) {
        setExpandedGroups(new Set());
    } else {
        setExpandedGroups(new Set(result.detailByGroup.map(g => g.id)));
    }
  };

  // Helper to get geography label
  const getGeoLabel = (g: string) => {
      if (g === Geography.VIETNAM) return t('geo.vn');
      if (g === Geography.CHAU_A) return t('geo.asia');
      if (g === Geography.TOAN_CAU) return t('geo.global');
      return g;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-phuhung-blue/20 overflow-hidden ring-1 ring-black/5 animate-enter">
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between ${hasErrors ? 'bg-red-600' : 'bg-phuhung-blue'}`}>
          <div className="flex items-center gap-2 text-white">
             {hasErrors ? <AlertCircle className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
             <h2 className="font-bold text-lg">{hasErrors ? t('result.important') : t('result.title')}</h2>
          </div>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
             {result.tongSoNguoi}
          </span>
      </div>

      {/* Main Price Card */}
      <div className="p-6 bg-gradient-to-b from-blue-50 to-white text-center border-b border-gray-100">
          
          {hasErrors ? (
              <div className="text-left space-y-2">
                 {result.validationErrors.map((errKey, idx) => (
                     <div key={idx} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">
                         <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                         {/* Attempt to translate the error key, if it fails (returns key), it might be a legacy string so display as is */}
                         <span>{t(errKey)}</span>
                     </div>
                 ))}
                 <p className="text-xs text-center text-gray-500 mt-2">{t('result.provisionalNote')}</p>
              </div>
          ) : (
             <p className="text-phuhung-textSec text-xs font-semibold uppercase tracking-wider mb-2">{t('result.totalFinal')}</p>
          )}

          <div className={`text-4xl font-extrabold tracking-tight drop-shadow-sm mb-1 mt-4 ${hasErrors ? 'text-gray-400 decoration-line-through' : 'text-phuhung-orange'}`}>
              {formatMoney(result.tongPhiCuoi).replace('₫', '')} <span className="text-lg font-medium">₫</span>
          </div>
          
          {/* Validity Badge */}
          <div className="flex justify-center mt-3">
            {hasErrors ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> {t('result.invalid')}
                </span>
            ) : result.tongPhiCuoi <= 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" /> {t('result.invalid')}
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700" title={t('result.min_fee_applied')}>
                    <ShieldCheck className="w-3 h-3" /> {t('result.optimized')}
                </span>
            )}
          </div>
      </div>

      {/* Breakdown Factors - Vertical Stack */}
      <div className={`p-5 space-y-4 text-sm bg-white ${hasErrors ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            
            {/* Step 1: Base */}
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                <span className="text-gray-600">{t('result.baseFee')}</span>
                <span className="font-semibold text-gray-900">{formatMoney(result.tongPhiGoc)}</span>
            </div>
            
            {/* Factors */}
            <div className="space-y-2.5 pl-2 border-l-2 border-gray-100">
                
                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>{t('result.groupSize')}</span>
                    <span className={result.percentGroup !== 0 ? "text-gray-800 font-medium" : "text-gray-300"}>
                        {formatSignedPercent(result.percentGroup)}
                    </span>
                </div>

                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>{t('result.lrAdj')}</span>
                    <span className={result.percentLR !== 0 ? (result.percentLR > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold") : "text-gray-300"}>
                        {formatSignedPercent(result.percentLR)}
                    </span>
                </div>

                <div className="flex justify-between items-center text-gray-400 text-[10px] italic">
                    <span>{t('calculator.copay')}</span>
                    <span>...</span>
                </div>
            </div>
            
            {/* Step 2: Duration */}
            <div className="flex justify-between items-center text-gray-500 text-xs pt-2">
                <span>{t('result.durationAdj')}</span>
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">x{result.heSoThoiHan}</span>
            </div>

            {/* Explanation with Icon Legend */}
            <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 space-y-1">
               <div className="flex items-center gap-1.5">
                   <Shield className="w-3 h-3 text-orange-600 fill-orange-100" />
                   <span>: {t('result.colMin')} {'>'} {t('result.colDiscounted')}</span>
               </div>
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
            {hasErrors ? t('result.checkErrors') : t('result.exportExcel')}
          </button>
      </div>

      {/* Detailed Groups Table */}
      {result.tongSoNguoi > 0 && !hasErrors && (
         <div className="bg-white border-t border-gray-200">
             <div className="p-2 bg-gray-100 flex justify-between items-center">
                 <h3 className="text-xs font-bold text-gray-600 uppercase">{t('result.detailMember')}</h3>
                 <button 
                    onClick={expandAll}
                    className="text-[10px] text-phuhung-blue font-medium hover:underline"
                 >
                    {expandedGroups.size === result.detailByGroup.length ? t('result.collapseAll') : t('result.expandAll')}
                 </button>
             </div>
             <div className="max-h-[500px] overflow-y-auto">
                 {result.detailByGroup.map(g => {
                     const isExpanded = expandedGroups.has(g.id);
                     const hasMinApplied = g.benefitDetails.some(b => b.isMinApplied);
                     
                     return (
                        <div key={g.id} className="border-b border-gray-100 last:border-0">
                            {/* Group Header Row */}
                            <div 
                                onClick={() => toggleGroup(g.id)}
                                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-blue-50 transition-colors ${isExpanded ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                                    <div className="truncate text-xs font-semibold text-gray-700" title={g.tenNhom}>
                                        {g.tenNhom || `(${t('common.unnamed')})`}
                                    </div>
                                    {g.percentCopay !== 0 && (
                                        <div className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded whitespace-nowrap hidden sm:block">
                                            {t('result.copay_short')}: {g.mucDongChiTra}
                                        </div>
                                    )}
                                    {hasMinApplied && (
                                        <div title={t('result.min_fee_applied')}>
                                            <Shield className="w-3 h-3 text-orange-500 fill-orange-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-phuhung-blue whitespace-nowrap pl-2">
                                    {formatMoney(g.tongPhiCuoi)}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="bg-gray-50/50 p-2 text-[10px] animate-in slide-in-from-top-1">
                                    <div className="mb-2 text-xs text-gray-500 flex gap-4 sm:hidden">
                                        <span>{t('result.copay_short')}: <b>{g.mucDongChiTra}</b></span>
                                    </div>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-gray-400 text-left border-b border-gray-200">
                                                <th className="py-2 font-medium">{t('result.colBenefit')}</th>
                                                <th className="py-2 font-medium w-10 text-center">{t('result.colGeo')}</th>
                                                <th className="py-2 font-medium text-right">{t('result.colDiscounted')}</th>
                                                <th className="py-2 font-medium text-right">{t('result.colMin')}</th>
                                                <th className="py-2 font-medium text-right">{t('result.colApply')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {g.benefitDetails.map((b, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 last:border-0 text-gray-600">
                                                    <td className="py-1.5 pr-2 truncate max-w-[150px]" title={b.label}>{b.label}</td>
                                                    <td className="py-1.5 text-center text-[9px] text-gray-400">{getGeoLabel(b.geo)}</td>
                                                    <td className="py-1.5 text-right font-mono">{formatMoney(b.discountedFee).replace('₫', '')}</td>
                                                    <td className="py-1.5 text-right font-mono text-gray-400">{formatMoney(b.minFee).replace('₫', '')}</td>
                                                    <td className={`py-1.5 text-right font-mono font-bold ${b.isMinApplied ? 'text-orange-600' : 'text-phuhung-blue'}`}>
                                                        {formatMoney(b.finalFee).replace('₫', '')}
                                                        {b.isMinApplied && <span className="ml-1 text-[8px] align-top text-orange-500">*</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                     );
                 })}
             </div>
         </div>
      )}
    </div>
  );
};

export default ResultsSummary;
