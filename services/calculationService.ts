
import { 
  GeneralInfo, 
  InsuranceGroup, 
  CalculationResult, 
  ContractType,
  GroupResult,
  BenefitHMethod,
  BenefitAMethod,
  BenefitBMethod,
  BenefitASalaryOption,
  Gender,
  RenewalStatus,
  SystemConfig,
  Geography,
  BenefitResultDetail
} from '../types';
import { 
  getGroupSizeDiscount, 
  getLRFactors,
  getAgeBucketIndex
} from '../constants';

// --- INTERNAL HELPERS ---

// Helper to get Rate Table Key
const getRateKey = (benefit: string, geo: string, si: number, extraConfig?: any): string | null => {
    let geoSuffix = '_VN';
    if (geo === Geography.CHAU_A) geoSuffix = '_ASIA';
    if (geo === Geography.TOAN_CAU) geoSuffix = '_GLOBAL';

    switch (benefit) {
        case 'A1_MAIN': return `A1${geoSuffix}`; // Death/PTD
        case 'A2_MAIN': return `A2${geoSuffix}`; // PPD
        case 'A_ALLOWANCE':
            const op = extraConfig?.option as BenefitASalaryOption;
            let key = `A_ALLOWANCE_3_5${geoSuffix}`;
            if (op === BenefitASalaryOption.OP_6_9) key = `A_ALLOWANCE_6_9${geoSuffix}`;
            if (op === BenefitASalaryOption.OP_10_12) key = `A_ALLOWANCE_10_12${geoSuffix}`;
            return key;
        case 'A_MEDICAL':
            let medKey = `A_MEDICAL_LOW${geoSuffix}`;
            if (si > 100000000) medKey = `A_MEDICAL_HIGH${geoSuffix}`;
            else if (si > 60000000) medKey = `A_MEDICAL_MID2${geoSuffix}`;
            else if (si > 40000000) medKey = `A_MEDICAL_MID1${geoSuffix}`;
            return medKey;
        case 'B': return `B${geoSuffix}`;
        case 'C':
            let bandSuffixC = '_BAND1';
            if (si > 200000000) bandSuffixC = '_BAND4';
            else if (si > 100000000) bandSuffixC = '_BAND3';
            else if (si > 60000000) bandSuffixC = '_BAND2';
            return `C${geoSuffix}${bandSuffixC}`;
        case 'D':
            let bandSuffixD = '_BAND1';
            if (si > 200000000) bandSuffixD = '_BAND4';
            else if (si > 100000000) bandSuffixD = '_BAND3';
            else if (si > 60000000) bandSuffixD = '_BAND2';
            return `D${geoSuffix}${bandSuffixD}`;
        case 'E':
            let bandSuffixE = '_BAND1'; 
            if (si > 20000000) bandSuffixE = '_BAND3';
            else if (si > 10000000) bandSuffixE = '_BAND2';
            return `E${geoSuffix}${bandSuffixE}`;
        case 'F':
            let bandSuffixF = '_BAND1'; 
            if (si > 10000000) bandSuffixF = '_BAND3'; 
            else if (si > 5000000) bandSuffixF = '_BAND2';
            return `F${geoSuffix}${bandSuffixF}`;
        
        // --- SPLIT BENEFITS KEYS ---
        case 'I_MAIN': return `I_MAIN${geoSuffix}`;
        case 'I_ALLOWANCE': return `I_ALLOWANCE${geoSuffix}`;
        case 'I_MEDICAL': return `I_MEDICAL${geoSuffix}`;
        
        case 'G_MEDICAL': return `G_MEDICAL${geoSuffix}`;
        case 'G_TRANSPORT': return `G_TRANSPORT${geoSuffix}`;
        
        case 'H_HOSPITALIZATION': return `H_HOSPITALIZATION${geoSuffix}`;
        case 'H_SURGICAL': return `H_SURGICAL${geoSuffix}`;
        
        default: return null;
    }
}

const getRateFromConfig = (
  config: SystemConfig,
  benefit: string,
  age: number,
  geo: string,
  si: number,
  extraConfig?: any,
  useMinRates: boolean = false // Toggle between baseRates and minRates
): number => {
  const ageIdx = getAgeBucketIndex(age);

  // Use the correct source based on flag
  const ratesSource = useMinRates ? config.minRates : config.baseRates;

  // Handle All Matrix Benefits
  const key = getRateKey(benefit, geo, si, extraConfig);
  if (key) {
      const val = (ratesSource as any)[key]?.[ageIdx];
      if (val === undefined || val === null) return 0;
      if (val === -1) return -1;
      return val / 100;
  }

  return 0;
};

const getMinPureRate = (
  config: SystemConfig,
  benefit: string,
  age: number,
  geo: string,
  si: number,
  extraConfig?: any
): number => {
  return getRateFromConfig(config, benefit, age, geo, si, extraConfig, true);
};


// Validate Age: 15 days to 70 years
export const isValidAgeDate = (dobString: string): { valid: boolean; age: number; error?: string } => {
  if (!dobString) return { valid: false, age: 0, error: 'Vui lòng chọn ngày sinh' };
  
  const dob = new Date(dobString);
  const today = new Date();
  
  const diffTime = today.getTime() - dob.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  const age = Math.floor(diffDays / 365.25);

  if (diffDays < 15) {
    return { valid: false, age, error: 'Người được bảo hiểm phải đủ 15 ngày tuổi' };
  }
  if (age > 70) {
    return { valid: false, age, error: 'Người được bảo hiểm không được quá 70 tuổi' };
  }
  if (diffDays < 0) {
     return { valid: false, age, error: 'Ngày sinh không hợp lệ' };
  }

  return { valid: true, age };
};

export const calculatePremium = (
  info: GeneralInfo,
  groups: InsuranceGroup[],
  config: SystemConfig // Added Config Argument
): CalculationResult => {
  
  let tongPhiGoc = 0;
  let tongPhiCuoi = 0;
  let tongSoNguoi = 0;
  const detailByGroup: GroupResult[] = [];
  const validationErrors: string[] = [];

  // --- PRE-CALCULATE ADJUSTMENT FACTORS GLOBALLY ---
  
  // 1. Group Size Discount (Hardcoded logic in constants based on Total People)
  // We need total people first
  groups.forEach(g => { tongSoNguoi += Math.max(1, g.soNguoi); });

  const percentGroup = -(getGroupSizeDiscount(tongSoNguoi) || 0);

  // 3. Loss Ratio (Hardcoded logic in constants)
  let percentLR = 0;
  if (info.loaiHopDong === ContractType.NHOM && info.tyLeBoiThuongNamTruoc >= 0) {
      const lrFactors = getLRFactors(info.tyLeBoiThuongNamTruoc);
      if (lrFactors.increase > 0) percentLR += lrFactors.increase;
      if (lrFactors.decrease > 0 && info.renewalStatus === RenewalStatus.CONTINUOUS) percentLR -= lrFactors.decrease;
  }

  // 4. Duration from Config
  const heSoThoiHan = config.durationFactors[info.thoiHanBaoHiem] || 1;


  // 0. Pre-calculation: Group Weighted Average Age
  let groupWeightedAvgAge = 0;
  if (info.loaiHopDong === ContractType.NHOM) {
      let totalAgeMass = 0;
      let validPeopleCount = 0;
      
      groups.forEach(g => {
          const count = Math.max(1, g.soNguoi);
          let age = g.tuoiTrungBinh;
          if (g.ngaySinh) {
              const check = isValidAgeDate(g.ngaySinh);
              if (check.valid) age = check.age;
          }
          if (age > 0) {
              totalAgeMass += age * count;
              validPeopleCount += count;
          }
      });
      
      if (validPeopleCount > 0) {
          groupWeightedAvgAge = Math.round(totalAgeMass / validPeopleCount);
      }
  }

  // Iterate Groups
  groups.forEach(group => {
    const count = Math.max(1, group.soNguoi);

    let rateAge = 0;
    if (info.loaiHopDong === ContractType.NHOM) {
        rateAge = groupWeightedAvgAge;
    } else {
        rateAge = group.tuoiTrungBinh;
        if (group.ngaySinh) {
            const check = isValidAgeDate(group.ngaySinh);
            if (check.valid) rateAge = check.age;
        }
    }

    // Get Per-Group Factors
    const percentCopay = -(config.copayDiscounts[group.mucDongChiTra] || 0);
    // REMOVED: const geo = group.phamViDiaLy; -- Geo is now per benefit

    // Aggregate Adjustments for this group (excluding Geo which is implicit in Rate lookup)
    const adjFactor = 1 + percentGroup + percentLR + percentCopay;

    let groupTotalPhiGoc = 0; 
    let groupTotalPhiCuoi = 0;
    const benefitDetails: BenefitResultDetail[] = [];

    // Helper: Add Logic with GRANULAR COMPARISON (Min Check)
    const addToTotal = (code: string, label: string, geo: string, unitPremiumBase: number, unitPremiumMin: number, specificCount?: number) => {
        // Validation Check: If rate is negative, it means N/A from config
        if (unitPremiumBase < 0 || unitPremiumMin < 0) {
            // Push distinct error KEY
            // Note: This is simplified. For full dynamic translation, we'd return a struct {key, params}.
            // For now, returning a static key for generic N/A.
            const errorMsg = 'validation.benefitNA'; 
            if (!validationErrors.includes(errorMsg)) {
                validationErrors.push(errorMsg);
            }
            return; // Don't add to total
        }

        const applyCount = specificCount !== undefined ? specificCount : count;
        
        // 1. Calculate Total Base for this line
        const totalLineBase = unitPremiumBase * applyCount;
        
        // 2. Calculate Total Min for this line
        const totalLineMin = unitPremiumMin * applyCount;

        // 3. Apply Adjustment to Base
        const adjustedBase = totalLineBase * adjFactor;

        // 4. GRANULAR CHECK: Take MAX(AdjustedBase, TotalMin)
        // This ensures every single benefit meets the minimum requirement individually
        let finalLinePremium = Math.max(adjustedBase, totalLineMin);
        
        const isMinApplied = totalLineMin > adjustedBase;

        // 5. Apply Duration Factor to the Final result AND intermediate values for display consistency
        // (Short term rates apply to the final agreed premium)
        const finalAfterDuration = finalLinePremium * heSoThoiHan;
        const discountedAfterDuration = adjustedBase * heSoThoiHan;
        const minAfterDuration = totalLineMin * heSoThoiHan;

        // Accumulate
        groupTotalPhiGoc += totalLineBase; // Track raw base for reference
        groupTotalPhiCuoi += finalAfterDuration;
        
        // Store Detail
        benefitDetails.push({
            code,
            label,
            geo, // Store Geo for report
            baseFee: totalLineBase,
            discountedFee: discountedAfterDuration,
            minFee: minAfterDuration,
            finalFee: finalAfterDuration,
            isMinApplied
        });
    }

    // A Main and Allowance SI Calculation - reused for Benefit I
    let siMainA = group.stbhA;
    if (group.methodA === BenefitAMethod.THEO_LUONG) {
        siMainA = (group.luongCoBan || 0) * (group.soThangLuongA || 0);
    }

    let siAllowanceA = 0;
    if (group.subA_TroCap && group.subA_TroCap_Option) {
        let months = group.soThangLuongTroCap;
        if (!months || months <= 0) {
             if (group.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) months = 9;
             else if (group.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) months = 12;
             else months = 5;
        }
        siAllowanceA = (group.luongCoBan || 0) * months;
    }

    // --- PROCESS BENEFIT A ---
    if (group.chonQuyenLoiA) {
        const geo = group.geoA;
        
        if (siMainA > 0) {
             // A1 (Tu Vong/PTD)
             if (group.subA_A1) {
                 const rateA1 = getRateFromConfig(config, 'A1_MAIN', rateAge, geo, siMainA);
                 const rateA1Min = getMinPureRate(config, 'A1_MAIN', rateAge, geo, siMainA);
                 
                 const prem = rateA1 < 0 ? -1 : siMainA * rateA1;
                 const premMin = rateA1Min < 0 ? -1 : siMainA * rateA1Min;
                 
                 addToTotal('A_A1', 'benefits.sub_A1', geo, prem, premMin);
             }

             // A2 (PPD)
             if (group.subA_A2) {
                 const rateA2 = getRateFromConfig(config, 'A2_MAIN', rateAge, geo, siMainA);
                 const rateA2Min = getMinPureRate(config, 'A2_MAIN', rateAge, geo, siMainA);
                 
                 const prem = rateA2 < 0 ? -1 : siMainA * rateA2;
                 const premMin = rateA2Min < 0 ? -1 : siMainA * rateA2Min;
                 
                 addToTotal('A_A2', 'benefits.sub_A2', geo, prem, premMin);
             }
        }

        // Sub 1: Allowance
        if (group.subA_TroCap && siAllowanceA > 0) {
            const rateSub1 = getRateFromConfig(config, 'A_ALLOWANCE', rateAge, geo, siAllowanceA, { option: group.subA_TroCap_Option });
            const rateSub1Min = getMinPureRate(config, 'A_ALLOWANCE', rateAge, geo, siAllowanceA, { option: group.subA_TroCap_Option });
            
            const prem = rateSub1 < 0 ? -1 : siAllowanceA * rateSub1;
            const premMin = rateSub1Min < 0 ? -1 : siAllowanceA * rateSub1Min;

            addToTotal('A_TroCap', 'benefits.sub_A3', geo, prem, premMin);
        }

        // Sub 2: Medical
        if (group.subA_YTe && group.stbhA_YTe > 0) {
             const rateSub2 = getRateFromConfig(config, 'A_MEDICAL', rateAge, geo, group.stbhA_YTe);
             const rateSub2Min = getMinPureRate(config, 'A_MEDICAL', rateAge, geo, group.stbhA_YTe);
             
             const prem = rateSub2 < 0 ? -1 : group.stbhA_YTe * rateSub2;
             const premMin = rateSub2Min < 0 ? -1 : group.stbhA_YTe * rateSub2Min;
             
             addToTotal('A_YTe', 'benefits.sub_A4', geo, prem, premMin);
        }

        // --- I (Poisoning) - SPLIT CALCULATION ---
        if (group.chonQuyenLoiI) {
             const geoI = group.geoI;
             
             // I1: Inherits A1 (SI Main)
             if (group.subI_I1 && group.subA_A1 && siMainA > 0) {
                 const rateI1 = getRateFromConfig(config, 'I_MAIN', rateAge, geoI, siMainA);
                 const rateI1Min = getMinPureRate(config, 'I_MAIN', rateAge, geoI, siMainA);
                 const prem = rateI1 < 0 ? -1 : siMainA * rateI1;
                 const premMin = rateI1Min < 0 ? -1 : siMainA * rateI1Min;
                 addToTotal('I_I1', 'I.1 Tử vong/TTTBVV do Ngộ độc', geoI, prem, premMin);
             }

             // I2: Inherits A2 (SI Main)
             if (group.subI_I2 && group.subA_A2 && siMainA > 0) {
                 const rateI2 = getRateFromConfig(config, 'I_MAIN', rateAge, geoI, siMainA);
                 const rateI2Min = getMinPureRate(config, 'I_MAIN', rateAge, geoI, siMainA);
                 const prem = rateI2 < 0 ? -1 : siMainA * rateI2;
                 const premMin = rateI2Min < 0 ? -1 : siMainA * rateI2Min;
                 addToTotal('I_I2', 'I.2 TTB PVV do Ngộ độc', geoI, prem, premMin);
             }

             // I3: Inherits A3 (SI Allowance)
             if (group.subI_I3 && group.subA_TroCap && siAllowanceA > 0) {
                 const rateI3 = getRateFromConfig(config, 'I_ALLOWANCE', rateAge, geoI, siAllowanceA);
                 const rateI3Min = getMinPureRate(config, 'I_ALLOWANCE', rateAge, geoI, siAllowanceA);
                 const prem = rateI3 < 0 ? -1 : siAllowanceA * rateI3;
                 const premMin = rateI3Min < 0 ? -1 : siAllowanceA * rateI3Min;
                 addToTotal('I_I3', 'I.3 Trợ cấp lương ngày do Ngộ độc', geoI, prem, premMin);
             }

             // I4: Inherits A4 (SI Medical)
             if (group.subI_I4 && group.subA_YTe && group.stbhA_YTe > 0) {
                 const rateI4 = getRateFromConfig(config, 'I_MEDICAL', rateAge, geoI, group.stbhA_YTe);
                 const rateI4Min = getMinPureRate(config, 'I_MEDICAL', rateAge, geoI, group.stbhA_YTe);
                 const prem = rateI4 < 0 ? -1 : group.stbhA_YTe * rateI4;
                 const premMin = rateI4Min < 0 ? -1 : group.stbhA_YTe * rateI4Min;
                 addToTotal('I_I4', 'I.4 Chi phí y tế do Ngộ độc', geoI, prem, premMin);
             }
        }
    }

    // --- OTHER BENEFITS ---
    const processSimpleBenefit = (code: string, label: string, selected: boolean, geo: string, si: number, method?: any, extra?: any, specificCount?: number) => {
        if (selected && si > 0) {
            const rate = getRateFromConfig(config, code, rateAge, geo, si, extra);
            const rateMin = getMinPureRate(config, code, rateAge, geo, si, extra);
            
            const prem = rate < 0 ? -1 : si * rate;
            const premMin = rateMin < 0 ? -1 : si * rateMin;

            addToTotal(code, label, geo, prem, premMin, specificCount);
        }
    };

    // Calculate SI for B
    let siB = group.stbhB;
    if (group.methodB === BenefitBMethod.THEO_LUONG) {
         siB = (group.luongCoBan || 0) * (group.soThangLuongB || 0);
    }
    processSimpleBenefit('B', 'benefits.B_title', group.chonQuyenLoiB, group.geoB, siB);
    
    if (group.chonQuyenLoiC && group.stbhC > 0) {
        const geoC = group.geoC;
        const rateC = getRateFromConfig(config, 'C', rateAge, geoC, group.stbhC);
        const rateCMin = getMinPureRate(config, 'C', rateAge, geoC, group.stbhC);
        
        const prem = rateC < 0 ? -1 : group.stbhC * rateC;
        const premMin = rateCMin < 0 ? -1 : group.stbhC * rateCMin;

        addToTotal('C', 'benefits.C_title', geoC, prem, premMin);

        // D (Maternity)
        let maternityCount = 0;
        if (group.soNguoi === 1) {
            maternityCount = group.gioiTinh === Gender.NU ? 1 : 0;
        } else {
            maternityCount = group.soNu || 0;
        }
        if (maternityCount > 0) {
            processSimpleBenefit('D', 'benefits.D_title', group.chonQuyenLoiD, group.geoD, group.stbhD, undefined, undefined, maternityCount);
        }

        // G (Passed flags for G1/G2 with SEPARATE SI)
        if (group.chonQuyenLoiG) {
            // G1: Transport (Van chuyen)
            if (group.subG_VanChuyen && group.stbhG_VanChuyen > 0) {
                const rateG1 = getRateFromConfig(config, 'G_TRANSPORT', rateAge, group.geoG, group.stbhG_VanChuyen);
                const rateG1Min = getMinPureRate(config, 'G_TRANSPORT', rateAge, group.geoG, group.stbhG_VanChuyen);
                
                const prem = rateG1 < 0 ? -1 : group.stbhG_VanChuyen * rateG1;
                const premMin = rateG1Min < 0 ? -1 : group.stbhG_VanChuyen * rateG1Min;
                addToTotal('G_VanChuyen', 'benefits.sub_G1', group.geoG, prem, premMin);
            }
            
            // G2: Medical (Y Te)
            if (group.subG_YTe && group.stbhG_YTe > 0) {
                const rateG2 = getRateFromConfig(config, 'G_MEDICAL', rateAge, group.geoG, group.stbhG_YTe);
                const rateG2Min = getMinPureRate(config, 'G_MEDICAL', rateAge, group.geoG, group.stbhG_YTe);
                
                const prem = rateG2 < 0 ? -1 : group.stbhG_YTe * rateG2;
                const premMin = rateG2Min < 0 ? -1 : group.stbhG_YTe * rateG2Min;
                addToTotal('G_YTe', 'benefits.sub_G2', group.geoG, prem, premMin);
            }
        }
        
        let siH = group.stbhH;
        if (group.methodH === BenefitHMethod.THEO_LUONG) {
            if (group.luongCoBan > 0 && group.soThangLuong > 0) {
                siH = group.luongCoBan * group.soThangLuong;
            } else {
                siH = 0;
            }
        }
        // H (Single component calculation - H_HOSPITALIZATION)
        if (group.chonQuyenLoiH && siH > 0) {
             const rateH = getRateFromConfig(config, 'H_HOSPITALIZATION', rateAge, group.geoH, siH);
             const rateHMin = getMinPureRate(config, 'H_HOSPITALIZATION', rateAge, group.geoH, siH);
             
             const prem = rateH < 0 ? -1 : siH * rateH;
             const premMin = rateHMin < 0 ? -1 : siH * rateHMin;
             
             addToTotal('H', 'benefits.H_title', group.geoH, prem, premMin);
        }
        
        processSimpleBenefit('E', 'benefits.E_title', group.chonQuyenLoiE, group.geoE, group.stbhE);
        processSimpleBenefit('F', 'benefits.F_title', group.chonQuyenLoiF, group.geoF, group.stbhF);
    }

    tongPhiGoc += groupTotalPhiGoc;
    tongPhiCuoi += groupTotalPhiCuoi;
    
    // Sort benefits alphabetically: A -> B -> C ... -> I
    const SORT_PRIORITY: Record<string, number> = {
        'A_A1': 1,
        'A_A2': 2,
        'A_TroCap': 3,
        'A_YTe': 4,
        'B': 5,
        'C': 6,
        'D': 7,
        'E': 8,
        'F': 9,
        'G_VanChuyen': 10,
        'G_YTe': 11,
        'H': 12,
        'I_I1': 13,
        'I_I2': 14,
        'I_I3': 15,
        'I_I4': 16
    };

    benefitDetails.sort((a, b) => {
        const pA = SORT_PRIORITY[a.code] ?? 99;
        const pB = SORT_PRIORITY[b.code] ?? 99;
        return pA - pB;
    });

    detailByGroup.push({
        id: group.id,
        tenNhom: group.tenNhom,
        soNguoi: count,
        tuoiTrungBinh: rateAge,
        tongPhiGoc: groupTotalPhiGoc,
        tongPhiCuoi: groupTotalPhiCuoi,
        benefitDetails: benefitDetails,
        // phamViDiaLy: geo, REMOVED
        mucDongChiTra: group.mucDongChiTra,
        percentCopay
    });
  });

  // General Validations
  if (info.loaiHopDong === ContractType.NHOM && tongSoNguoi < 5) {
      validationErrors.push('validation.groupMin5');
  }
  if (info.loaiHopDong === ContractType.CAN_HAN && tongSoNguoi >= 5) {
      validationErrors.push('validation.individualMax4');
  }

  return {
    detailByGroup,
    tongSoNhom: groups.length,
    tongSoNguoi,
    tongPhiGoc: tongPhiGoc,
    tongPhiCuoi: Math.round(tongPhiCuoi),
    heSoThoiHan,
    percentGroup,
    percentLR,
    validationErrors
  };
};

// Export helper for use in Excel Export (needs config too)
export { getRateFromConfig };
