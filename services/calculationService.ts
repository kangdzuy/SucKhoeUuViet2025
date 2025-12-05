
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

  if (benefit === 'I') {
      // Composite Benefit I: Main + Allowance + Medical
      const { subI_TuVong, subI_TroCap, subI_YTe } = extraConfig || { subI_TuVong: true, subI_TroCap: true, subI_YTe: true };
      
      let totalRate = 0;
      let hasSelection = false;

      if (subI_TuVong) {
          const r1 = getRateFromConfig(config, 'I_MAIN', age, geo, si, extraConfig, useMinRates);
          if (r1 < 0) return -1;
          totalRate += r1;
          hasSelection = true;
      }
      if (subI_TroCap) {
          const r2 = getRateFromConfig(config, 'I_ALLOWANCE', age, geo, si, extraConfig, useMinRates);
          if (r2 < 0) return -1;
          totalRate += r2;
          hasSelection = true;
      }
      if (subI_YTe) {
          const r3 = getRateFromConfig(config, 'I_MEDICAL', age, geo, si, extraConfig, useMinRates);
          if (r3 < 0) return -1;
          totalRate += r3;
          hasSelection = true;
      }
      
      if (!hasSelection) return 0;
      return totalRate;
  }

  if (benefit === 'G') {
      const { subG_YTe, subG_VanChuyen } = extraConfig || { subG_YTe: true, subG_VanChuyen: true };
      
      let totalRate = 0;
      let hasSelection = false;

      if (subG_YTe) {
          const r1 = getRateFromConfig(config, 'G_MEDICAL', age, geo, si, extraConfig, useMinRates);
          if (r1 < 0) return -1;
          totalRate += r1;
          hasSelection = true;
      }
      if (subG_VanChuyen) {
          const r2 = getRateFromConfig(config, 'G_TRANSPORT', age, geo, si, extraConfig, useMinRates);
          if (r2 < 0) return -1;
          totalRate += r2;
          hasSelection = true;
      }
      
      if (!hasSelection) return 0;
      return totalRate;
  }

  if (benefit === 'H') {
      const { subH_NamVien, subH_PhauThuat } = extraConfig || { subH_NamVien: true, subH_PhauThuat: true };
      
      let totalRate = 0;
      let hasSelection = false;

      if (subH_NamVien) {
          const r1 = getRateFromConfig(config, 'H_HOSPITALIZATION', age, geo, si, extraConfig, useMinRates);
          if (r1 < 0) return -1;
          totalRate += r1;
          hasSelection = true;
      }
      if (subH_PhauThuat) {
          const r2 = getRateFromConfig(config, 'H_SURGICAL', age, geo, si, extraConfig, useMinRates);
          if (r2 < 0) return -1;
          totalRate += r2;
          hasSelection = true;
      }

      if (!hasSelection) return 0;
      return totalRate;
  }

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
            // Push distinct error only
            const errorMsg = `Quyền lợi "${label}" không áp dụng cho độ tuổi ${rateAge} hoặc khu vực ${geo} (Kiểm tra nhóm: ${group.tenNhom})`;
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

    // --- PROCESS BENEFIT A ---
    if (group.chonQuyenLoiA) {
        const geo = group.geoA;
        // Main
        let siMainA = group.stbhA;
        if (group.methodA === BenefitAMethod.THEO_LUONG) {
            siMainA = (group.luongCoBan || 0) * (group.soThangLuongA || 0);
        }
        
        if (siMainA > 0) {
             // A1 (Tu Vong/PTD)
             if (group.subA_A1) {
                 const rateA1 = getRateFromConfig(config, 'A1_MAIN', rateAge, geo, siMainA);
                 const rateA1Min = getMinPureRate(config, 'A1_MAIN', rateAge, geo, siMainA);
                 
                 const prem = rateA1 < 0 ? -1 : siMainA * rateA1;
                 const premMin = rateA1Min < 0 ? -1 : siMainA * rateA1Min;
                 
                 addToTotal('A_A1', 'A1. Tử vong/Thương tật toàn bộ vĩnh viễn', geo, prem, premMin);
             }

             // A2 (PPD)
             if (group.subA_A2) {
                 const rateA2 = getRateFromConfig(config, 'A2_MAIN', rateAge, geo, siMainA);
                 const rateA2Min = getMinPureRate(config, 'A2_MAIN', rateAge, geo, siMainA);
                 
                 const prem = rateA2 < 0 ? -1 : siMainA * rateA2;
                 const premMin = rateA2Min < 0 ? -1 : siMainA * rateA2Min;
                 
                 addToTotal('A_A2', 'A2. Thương tật bộ phận vĩnh viễn', geo, prem, premMin);
             }
        }

        // Sub 1: Allowance
        if (group.subA_TroCap && group.subA_TroCap_Option) {
            let months = group.soThangLuongTroCap;
            if (!months || months <= 0) {
                 if (group.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) months = 9;
                 else if (group.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) months = 12;
                 else months = 5;
            }
            const siAllowance = (group.luongCoBan || 0) * months;
            if (siAllowance > 0) {
                const rateSub1 = getRateFromConfig(config, 'A_ALLOWANCE', rateAge, geo, siAllowance, { option: group.subA_TroCap_Option });
                const rateSub1Min = getMinPureRate(config, 'A_ALLOWANCE', rateAge, geo, siAllowance, { option: group.subA_TroCap_Option });
                
                const prem = rateSub1 < 0 ? -1 : siAllowance * rateSub1;
                const premMin = rateSub1Min < 0 ? -1 : siAllowance * rateSub1Min;

                addToTotal('A_TroCap', 'A3. Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời', geo, prem, premMin);
            }
        }

        // Sub 2: Medical
        if (group.subA_YTe && group.stbhA_YTe > 0) {
             const rateSub2 = getRateFromConfig(config, 'A_MEDICAL', rateAge, geo, group.stbhA_YTe);
             const rateSub2Min = getMinPureRate(config, 'A_MEDICAL', rateAge, geo, group.stbhA_YTe);
             
             const prem = rateSub2 < 0 ? -1 : group.stbhA_YTe * rateSub2;
             const premMin = rateSub2Min < 0 ? -1 : group.stbhA_YTe * rateSub2Min;
             
             addToTotal('A_YTe', 'A4. Chi phí y tế, chi phí vận chuyển cấp cứu', geo, prem, premMin);
        }

        // I (Updated to pass flags)
        if (group.chonQuyenLoiI && group.stbhI > 0) {
             const geoI = group.geoI;
             const rateI = getRateFromConfig(config, 'I', rateAge, geoI, group.stbhI, {
                 subI_TuVong: group.subI_TuVong,
                 subI_TroCap: group.subI_TroCap,
                 subI_YTe: group.subI_YTe
             });
             const rateIMin = getMinPureRate(config, 'I', rateAge, geoI, group.stbhI, {
                 subI_TuVong: group.subI_TuVong,
                 subI_TroCap: group.subI_TroCap,
                 subI_YTe: group.subI_YTe
             });
             
             const prem = rateI < 0 ? -1 : group.stbhI * rateI;
             const premMin = rateIMin < 0 ? -1 : group.stbhI * rateIMin;

             addToTotal('I', 'I. Ngộ độc', geoI, prem, premMin);
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
    processSimpleBenefit('B', 'B. Sinh mạng', group.chonQuyenLoiB, group.geoB, siB);
    
    if (group.chonQuyenLoiC && group.stbhC > 0) {
        const geoC = group.geoC;
        const rateC = getRateFromConfig(config, 'C', rateAge, geoC, group.stbhC);
        const rateCMin = getMinPureRate(config, 'C', rateAge, geoC, group.stbhC);
        
        const prem = rateC < 0 ? -1 : group.stbhC * rateC;
        const premMin = rateCMin < 0 ? -1 : group.stbhC * rateCMin;

        addToTotal('C', 'C. Nội trú', geoC, prem, premMin);

        // D (Maternity)
        let maternityCount = 0;
        if (group.soNguoi === 1) {
            maternityCount = group.gioiTinh === Gender.NU ? 1 : 0;
        } else {
            maternityCount = group.soNu || 0;
        }
        if (maternityCount > 0) {
            processSimpleBenefit('D', 'D. Thai sản', group.chonQuyenLoiD, group.geoD, group.stbhD, undefined, undefined, maternityCount);
        }

        // G (Passed flags for G1/G2)
        processSimpleBenefit('G', 'G. Nước ngoài', group.chonQuyenLoiG, group.geoG, group.stbhG, undefined, { subG_YTe: group.subG_YTe, subG_VanChuyen: group.subG_VanChuyen });
        
        let siH = group.stbhH;
        if (group.methodH === BenefitHMethod.THEO_LUONG) {
            if (group.luongCoBan > 0 && group.soThangLuong > 0) {
                siH = group.luongCoBan * group.soThangLuong;
            } else {
                siH = 0;
            }
        }
        // H (Passed flags for H1/H2)
        processSimpleBenefit('H', 'H. Trợ cấp thu nhập', group.chonQuyenLoiH, group.geoH, siH, undefined, { subH_NamVien: group.subH_NamVien, subH_PhauThuat: group.subH_PhauThuat });
        
        processSimpleBenefit('E', 'E. Ngoại trú', group.chonQuyenLoiE, group.geoE, group.stbhE);
        processSimpleBenefit('F', 'F. Nha khoa', group.chonQuyenLoiF, group.geoF, group.stbhF);
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
        'G': 10,
        'H': 11,
        'I': 12
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
      validationErrors.push("Hợp đồng Nhóm yêu cầu tối thiểu 5 thành viên.");
  }
  if (info.loaiHopDong === ContractType.CAN_HAN && tongSoNguoi >= 5) {
      validationErrors.push("Số lượng 5 người trở lên được xem là Nhóm.");
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
