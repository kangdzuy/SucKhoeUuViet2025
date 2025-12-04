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

  // 0. Pre-calculation: Calculate Group Weighted Average Age (Only for GROUP Contract)
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

  // Iterate Groups to calculate Base Premiums
  groups.forEach(group => {
    // Determine effective count
    const count = Math.max(1, group.soNguoi);
    tongSoNguoi += count;

    // Determine effective Age for Rate Lookup
    let rateAge = 0;
    
    // Logic: 
    // If Individual Contract -> Use individual age
    // If Group Contract -> Use the calculated GROUP WEIGHTED AVERAGE AGE for everyone
    if (info.loaiHopDong === ContractType.NHOM) {
        rateAge = groupWeightedAvgAge;
    } else {
        // Individual logic
        rateAge = group.tuoiTrungBinh;
        if (group.ngaySinh) {
            const check = isValidAgeDate(group.ngaySinh);
            if (check.valid) rateAge = check.age;
        }
    }

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
             const rateA = getBaseRate('A_MAIN', rateAge, info.phamViDiaLy, siMainA);
             const rateAMin = getMinPureRate('A_MAIN', rateAge, info.phamViDiaLy, siMainA);
             addToTotal('A_Chinh', siMainA * rateA, siMainA * rateAMin);
        }

        // 2. Sub Benefit: Allowance (Tro Cap Luong) - DEPENDS ON A
        if (group.subA_TroCap && group.subA_TroCap_Option) {
            let months = group.soThangLuongTroCap;
            if (!months || months <= 0) {
                 if (group.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) months = 9;
                 else if (group.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) months = 12;
                 else months = 5;
            }
            
            const siAllowance = (group.luongA || 0) * months;
            
            if (siAllowance > 0) {
                const rateSub1 = getBaseRate('A_ALLOWANCE', rateAge, info.phamViDiaLy, siAllowance, { option: group.subA_TroCap_Option });
                const rateSub1Min = getMinPureRate('A_ALLOWANCE', rateAge, info.phamViDiaLy, siAllowance, { option: group.subA_TroCap_Option });
                addToTotal('A_TroCap', siAllowance * rateSub1, siAllowance * rateSub1Min);
            }
        }

        // 3. Sub Benefit: Medical (Y Te) - DEPENDS ON A
        if (group.subA_YTe && group.stbhA_YTe > 0) {
             const rateSub2 = getBaseRate('A_MEDICAL', rateAge, info.phamViDiaLy, group.stbhA_YTe);
             const rateSub2Min = getMinPureRate('A_MEDICAL', rateAge, info.phamViDiaLy, group.stbhA_YTe);
             addToTotal('A_YTe', group.stbhA_YTe * rateSub2, group.stbhA_YTe * rateSub2Min);
        }

        // 4. Benefit I (Poisoning) - DEPENDS ON A
        if (group.chonQuyenLoiI && group.stbhI > 0) {
             const rateI = getBaseRate('I', rateAge, info.phamViDiaLy, group.stbhI);
             const rateIMin = getMinPureRate('I', rateAge, info.phamViDiaLy, group.stbhI);
             addToTotal('I', group.stbhI * rateI, group.stbhI * rateIMin);
        }
    }

    // --- OTHER BENEFITS ---
    const processSimpleBenefit = (code: string, selected: boolean, si: number, method?: any, extra?: any, specificCount?: number) => {
        if (selected && si > 0) {
            const rate = getBaseRate(code, rateAge, info.phamViDiaLy, si, extra);
            const rateMin = getMinPureRate(code, rateAge, info.phamViDiaLy, si, extra);
            addToTotal(code, si * rate, si * rateMin, specificCount);
        }
    };

    // Independent Benefits (Or Main)
    processSimpleBenefit('B', group.chonQuyenLoiB, group.stbhB);
    
    // Main C (Inpatient)
    if (group.chonQuyenLoiC && group.stbhC > 0) {
        const rateC = getBaseRate('C', rateAge, info.phamViDiaLy, group.stbhC);
        const rateCMin = getMinPureRate('C', rateAge, info.phamViDiaLy, group.stbhC);
        addToTotal('C', group.stbhC * rateC, group.stbhC * rateCMin);

        // --- BENEFITS DEPENDENT ON C ---
        
        // D (Maternity) - SPECIAL LOGIC FOR FEMALE ONLY
        let maternityCount = 0;
        // Logic check: Even in Group mode, we are iterating rows.
        // If row is a single person, check gender.
        if (group.soNguoi === 1) {
            maternityCount = group.gioiTinh === Gender.NU ? 1 : 0;
        } else {
            // Fallback for summary rows (though UI now encourages single listing)
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
            } else {
                siH = 0;
            }
        }
        processSimpleBenefit('H', group.chonQuyenLoiH, siH);

        // E (Outpatient)
        processSimpleBenefit('E', group.chonQuyenLoiE, group.stbhE);

        // F (Dental)
        processSimpleBenefit('F', group.chonQuyenLoiF, group.stbhF);
    }

    // Accumulate Results
    tongPhiGoc += groupTotalPhiGoc;
    tongPhiThuanToiThieu += groupTotalPhiThuan;
    
    detailByGroup.push({
        id: group.id,
        tenNhom: group.tenNhom,
        soNguoi: count,
        tuoiTrungBinh: rateAge, // Display the rate age used (Group Avg or Individual)
        tongPhiGoc: groupTotalPhiGoc,
        tongPhiThuanToiThieu: groupTotalPhiThuan,
        details
    });
  });

  // --- ADJUSTMENT FACTORS CALCULATION (ADDITIVE MODEL) ---
  
  // 1. Co-pay Discount (Negative %)
  const percentCopay = -(COPAY_DISCOUNT[info.mucDongChiTra] || 0);

  // 2. Group Size Discount (Negative %)
  const percentGroup = -(getGroupSizeDiscount(tongSoNguoi) || 0);

  // 3. Loss Ratio Adjustment (Positive or Negative %)
  let percentLR = 0;
  // LR only applies to GROUP contracts. 
  // Allow 0 (Perfect history) to be valid. Check contract type explicitly.
  if (info.loaiHopDong === ContractType.NHOM && info.tyLeBoiThuongNamTruoc >= 0) {
      const lrFactors = getLRFactors(info.tyLeBoiThuongNamTruoc);
      
      // Increase Logic
      if (lrFactors.increase > 0) {
          percentLR += lrFactors.increase;
      }
      
      // Decrease Logic (Only if Continuous Renewal)
      if (lrFactors.decrease > 0) {
          if (info.renewalStatus === RenewalStatus.CONTINUOUS) {
              percentLR -= lrFactors.decrease;
          }
      }
  }

  // TOTAL ADJUSTMENT PERCENTAGE
  // Formula: [1 + %Increase + %Decrease]
  const totalAdjPercent = percentCopay + percentGroup + percentLR;
  const adjFactor = 1 + totalAdjPercent;

  // 4. Duration Factor
  const heSoThoiHan = DURATION_FACTORS[info.thoiHanBaoHiem] || 1;

  // --- FINAL CALCULATION ---
  
  // A. Calculate Intermediate Premium (After Discounts/Loadings, Before Duration)
  const tongPhiSauGiam = Math.round(tongPhiGoc * adjFactor);

  // B. Calculated Premium using Formula
  // Premium = (Base * (1 + Sum%)) * Duration
  const calculatedPremium = tongPhiSauGiam * heSoThoiHan;
  
  // C. Minimum Pure Premium Check (Floor)
  // Floor = PurePremium * Duration (Floor is usually not subject to commercial discounts like Group/Copay)
  // However, to be safe, we ensure we cover the risk.
  const floorPremium = tongPhiThuanToiThieu * heSoThoiHan;

  let phiCuoi = calculatedPremium;
  let isFloorApplied = false;

  if (phiCuoi < floorPremium) {
      phiCuoi = floorPremium;
      isFloorApplied = true;
  }

  // Rounding
  phiCuoi = Math.round(phiCuoi);
  const phiThuanSauHeSo = Math.round(floorPremium);

  // --- VALIDATION RULES ---
  const validationErrors: string[] = [];
  
  // Rule: Group Contract must have >= 5 people
  if (info.loaiHopDong === ContractType.NHOM && tongSoNguoi < 5) {
      validationErrors.push("Hợp đồng Nhóm yêu cầu tối thiểu 5 thành viên. Vui lòng thêm người hoặc chuyển sang loại hợp đồng 'Cá nhân' (nếu phù hợp).");
  }

  // Rule Suggestion: If Individual has >= 5 (though UI restricts input currently, keeping logic for robustness)
  if (info.loaiHopDong === ContractType.CAN_HAN && tongSoNguoi >= 5) {
      validationErrors.push("Số lượng 5 người trở lên được xem là Nhóm. Vui lòng chuyển loại hợp đồng sang 'Nhóm' để hưởng quyền lợi ưu đãi.");
  }

  return {
    detailByGroup,
    tongSoNhom: groups.length,
    tongSoNguoi,
    tongPhiGoc,
    tongPhiSauGiam,
    tongPhiThuanToiThieu,
    heSoThoiHan,
    percentCopay,
    percentGroup,
    percentLR,
    totalAdjPercent,
    adjFactor,
    phiCuoi,
    phiThuanSauHeSo,
    isFloorApplied,
    validationErrors
  };
};