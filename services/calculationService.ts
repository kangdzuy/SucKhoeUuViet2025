import { 
  GeneralInfo, 
  InsuranceGroup, 
  CalculationResult, 
  ContractType,
  GroupResult,
  BenefitHMethod,
  BenefitAMethod,
  BenefitASalaryOption,
  Gender,
  RenewalStatus
} from '../types';
import { 
  DURATION_FACTORS, 
  COPAY_DISCOUNT, 
  getGroupSizeDiscount, 
  getLRFactors,
  getBaseRate,
  getMinPureRate
} from '../constants';

// Validate Age: 15 days to 70 years (PDF Page 5)
export const isValidAgeDate = (dobString: string): { valid: boolean; age: number; error?: string } => {
  if (!dobString) return { valid: false, age: 0, error: 'Vui lòng chọn ngày sinh' };
  
  const dob = new Date(dobString);
  const today = new Date();
  
  // Calculate difference in time
  const diffTime = today.getTime() - dob.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  
  // Exact age in years
  const age = Math.floor(diffDays / 365.25);

  // Rule: From 15 days old to 70 years old
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
  groups: InsuranceGroup[]
): CalculationResult => {
  
  let tongPhiGoc = 0;
  let tongPhiThuanToiThieu = 0;
  let tongSoNguoi = 0;
  const detailByGroup: GroupResult[] = [];

  // Iterate Groups
  groups.forEach(group => {
    // Determine effective count and age
    const count = Math.max(1, group.soNguoi);
    let avgAge = group.tuoiTrungBinh;
    
    // Recalculate avgAge for Individual to be sure
    if (info.loaiHopDong === ContractType.CAN_HAN && group.ngaySinh) {
        const check = isValidAgeDate(group.ngaySinh);
        if (check.valid) avgAge = check.age;
    }

    tongSoNguoi += count;

    let groupTotalPhiGoc = 0; // Absolute total for the group
    let groupTotalPhiThuan = 0;

    const details: Record<string, number> = {};

    // Helper: Add to totals. specificCount allows calculating fee for a subset (e.g. only Females)
    const addToTotal = (code: string, unitPremium: number, unitPremiumMin: number, specificCount?: number) => {
        const applyCount = specificCount !== undefined ? specificCount : count;
        
        const totalLinePremium = unitPremium * applyCount;
        const totalLineMin = unitPremiumMin * applyCount;

        groupTotalPhiGoc += totalLinePremium;
        groupTotalPhiThuan += totalLineMin;
        
        details[code] = (details[code] || 0) + totalLinePremium;
    }

    // --- PROCESS BENEFIT A (ACCIDENT) ---
    if (group.chonQuyenLoiA) {
        // 1. Main Benefit (Death/PTD)
        let siMainA = group.stbhA;
        if (group.methodA === BenefitAMethod.THEO_LUONG) {
            siMainA = (group.luongA || 0) * (group.soThangLuongA || 0);
        }
        
        if (siMainA > 0) {
             const rateA = getBaseRate('A_MAIN', avgAge, info.phamViDiaLy, siMainA);
             const rateAMin = getMinPureRate('A_MAIN', avgAge, info.phamViDiaLy, siMainA);
             addToTotal('A_Chinh', siMainA * rateA, siMainA * rateAMin);
        }

        // 2. Sub Benefit: Allowance (Tro Cap Luong) - DEPENDS ON A
        if (group.subA_TroCap && group.subA_TroCap_Option) {
            // Use user selected months, fallback to max of option if not set
            let months = group.soThangLuongTroCap;
            if (!months || months <= 0) {
                 if (group.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) months = 9;
                 else if (group.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) months = 12;
                 else months = 5;
            }
            
            const siAllowance = (group.luongA || 0) * months;
            
            if (siAllowance > 0) {
                const rateSub1 = getBaseRate('A_ALLOWANCE', avgAge, info.phamViDiaLy, siAllowance, { option: group.subA_TroCap_Option });
                const rateSub1Min = getMinPureRate('A_ALLOWANCE', avgAge, info.phamViDiaLy, siAllowance, { option: group.subA_TroCap_Option });
                addToTotal('A_TroCap', siAllowance * rateSub1, siAllowance * rateSub1Min);
            }
        }

        // 3. Sub Benefit: Medical (Y Te) - DEPENDS ON A
        if (group.subA_YTe && group.stbhA_YTe > 0) {
             const rateSub2 = getBaseRate('A_MEDICAL', avgAge, info.phamViDiaLy, group.stbhA_YTe);
             const rateSub2Min = getMinPureRate('A_MEDICAL', avgAge, info.phamViDiaLy, group.stbhA_YTe);
             addToTotal('A_YTe', group.stbhA_YTe * rateSub2, group.stbhA_YTe * rateSub2Min);
        }

        // 4. Benefit I (Poisoning) - DEPENDS ON A
        if (group.chonQuyenLoiI && group.stbhI > 0) {
             const rateI = getBaseRate('I', avgAge, info.phamViDiaLy, group.stbhI);
             const rateIMin = getMinPureRate('I', avgAge, info.phamViDiaLy, group.stbhI);
             addToTotal('I', group.stbhI * rateI, group.stbhI * rateIMin);
        }
    }

    // --- OTHER BENEFITS ---
    const processSimpleBenefit = (code: string, selected: boolean, si: number, method?: any, extra?: any, specificCount?: number) => {
        if (selected && si > 0) {
            const rate = getBaseRate(code, avgAge, info.phamViDiaLy, si, extra);
            const rateMin = getMinPureRate(code, avgAge, info.phamViDiaLy, si, extra);
            addToTotal(code, si * rate, si * rateMin, specificCount);
        }
    };

    // Independent Benefits (Or Main)
    processSimpleBenefit('B', group.chonQuyenLoiB, group.stbhB);
    
    // Main C (Inpatient)
    if (group.chonQuyenLoiC && group.stbhC > 0) {
        const rateC = getBaseRate('C', avgAge, info.phamViDiaLy, group.stbhC);
        const rateCMin = getMinPureRate('C', avgAge, info.phamViDiaLy, group.stbhC);
        addToTotal('C', group.stbhC * rateC, group.stbhC * rateCMin);

        // --- BENEFITS DEPENDENT ON C ---
        
        // D (Maternity) - SPECIAL LOGIC FOR FEMALE ONLY
        // Individual: Check Gender
        // Group: Use group.soNu
        
        let maternityCount = 0;
        if (info.loaiHopDong === ContractType.CAN_HAN) {
            maternityCount = group.gioiTinh === Gender.NU ? 1 : 0;
        } else {
            maternityCount = group.soNu || 0;
        }

        if (maternityCount > 0) {
            processSimpleBenefit('D', group.chonQuyenLoiD, group.stbhD, undefined, undefined, maternityCount);
        }

        // G (Overseas)
        processSimpleBenefit('G', group.chonQuyenLoiG, group.stbhG);

        // H (Income Support)
        let siH = group.stbhH;
        if (group.methodH === BenefitHMethod.THEO_LUONG) {
            if (group.luongTrungBinh > 0 && group.soThangLuong > 0) {
                siH = group.luongTrungBinh * group.soThangLuong;
            }
        }
        processSimpleBenefit('H', group.chonQuyenLoiH, siH);
    }

    // --- INDEPENDENT SUPPLEMENTARY BENEFITS (E, F) ---
    
    // E (Outpatient)
    processSimpleBenefit('E', group.chonQuyenLoiE, group.stbhE);

    // F (Dental)
    processSimpleBenefit('F', group.chonQuyenLoiF, group.stbhF);

    tongPhiGoc += groupTotalPhiGoc;
    tongPhiThuanToiThieu += groupTotalPhiThuan;

    detailByGroup.push({
      id: group.id,
      tenNhom: group.tenNhom,
      soNguoi: count,
      tuoiTrungBinh: avgAge,
      tongPhiGoc: groupTotalPhiGoc,
      tongPhiThuanToiThieu: groupTotalPhiThuan,
      details
    });
  });

  // Layer 3: Duration
  const heSoThoiHan = DURATION_FACTORS[info.thoiHanBaoHiem] || 1;
  const phiSauThoiHan = tongPhiGoc * heSoThoiHan;

  // Layer 4: Co-pay
  const discountCopay = COPAY_DISCOUNT[info.mucDongChiTra] || 0;
  const heSoDongChiTra = 1 - discountCopay;
  const phiSauDongChiTra = phiSauThoiHan * heSoDongChiTra;

  // Layer 5: Group Size
  const discountGroup = getGroupSizeDiscount(tongSoNguoi);
  const heSoGiamNhom = 1 - discountGroup;
  
  const phiSauNhom = phiSauDongChiTra * heSoGiamNhom;

  // Layer 6: Loss Ratio
  let heSoTangLR = 1;
  let heSoGiamLR = 1;
  
  // Logic: 
  // - If RenewalStatus is CONTINUOUS: Apply both Increase and Decrease.
  // - If RenewalStatus is NON_CONTINUOUS: Apply Increase only.
  
  // FIXED: Allow 0 to be processed so discount applies if RenewalStatus.CONTINUOUS
  if (info.tyLeBoiThuongNamTruoc >= 0) {
      const lrFactors = getLRFactors(info.tyLeBoiThuongNamTruoc);
      
      // Loading applies in both cases
      heSoTangLR = 1 + lrFactors.increase;
      
      // Discount only applies if Continuous
      if (info.renewalStatus === RenewalStatus.CONTINUOUS) {
          heSoGiamLR = 1 - lrFactors.decrease;
      }
  }
  
  const phiSauLR = phiSauNhom * heSoTangLR * heSoGiamLR;

  // Layer 7: Floor Check (Min Pure Premium)
  const phiThuanSauHeSo = tongPhiThuanToiThieu * heSoThoiHan * heSoDongChiTra * heSoGiamNhom * heSoTangLR * heSoGiamLR;

  const phiCuoi = Math.max(phiSauLR, phiThuanSauHeSo);
  const isFloorApplied = phiCuoi > phiSauLR; 

  return {
    detailByGroup,
    tongSoNhom: groups.length,
    tongSoNguoi,
    tongPhiGoc,
    tongPhiThuanToiThieu,
    heSoThoiHan,
    phiSauThoiHan,
    heSoDongChiTra,
    phiSauDongChiTra,
    heSoGiamNhom,
    phiSauNhom,
    heSoTangLR,
    heSoGiamLR,
    phiSauLR,
    phiThuanSauHeSo,
    phiCuoi,
    isFloorApplied
  };
};