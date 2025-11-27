import { 
  GeneralInfo, 
  InsuranceGroup, 
  CalculationResult, 
  ContractType,
  GroupResult
} from '../types';
import { 
  DURATION_FACTORS, 
  COPAY_DISCOUNT, 
  getGroupSizeDiscount, 
  getLRFactors,
  getBaseRate,
  getMinPureRate
} from '../constants';

export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
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
    // Ensure data validity
    const count = Math.max(1, group.soNguoi);
    const avgAge = group.tuoiTrungBinh;
    tongSoNguoi += count;

    let groupPhiGocOnePerson = 0;
    let groupPhiThuanOnePerson = 0;
    const details: Record<string, number> = {};

    // Helper to process a specific benefit for ONE person in the group
    const processBenefit = (
      code: string, 
      selected: boolean, 
      si: number
    ) => {
      if (selected && si > 0) {
        const rate = getBaseRate(code, avgAge, info.phamViDiaLy, si);
        const rateMin = getMinPureRate(code, avgAge, info.phamViDiaLy, si);
        
        const premium = rate * si;
        const premiumMin = rateMin * si;

        groupPhiGocOnePerson += premium;
        groupPhiThuanOnePerson += premiumMin;
        
        // Store total for the whole group in details
        details[code] = premium * count;
      }
    };

    // Process all benefits A-I
    processBenefit('A', group.chonQuyenLoiA, group.stbhA);
    processBenefit('B', group.chonQuyenLoiB, group.stbhB);
    processBenefit('C', group.chonQuyenLoiC, group.stbhC);
    processBenefit('D', group.chonQuyenLoiD, group.stbhD);
    processBenefit('E', group.chonQuyenLoiE, group.stbhE);
    processBenefit('F', group.chonQuyenLoiF, group.stbhF);
    processBenefit('G', group.chonQuyenLoiG, group.stbhG);
    processBenefit('H', group.chonQuyenLoiH, group.stbhH);
    processBenefit('I', group.chonQuyenLoiI, group.stbhI);

    // Total for this group
    const groupTotalPhiGoc = groupPhiGocOnePerson * count;
    const groupTotalPhiThuan = groupPhiThuanOnePerson * count;

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

  // Layer 5: Group Size (Based on TOTAL people in contract)
  let heSoGiamNhom = 1;
  // If logic dictates "Nhom" contract type forces discount, check type.
  // Usually discount depends on total headcount regardless, but prompt implies logic link.
  // "giamPhiQuyMoNhom – mapping tổng số người"
  if (info.loaiHopDong === ContractType.NHOM) {
     const discountGroup = getGroupSizeDiscount(tongSoNguoi);
     heSoGiamNhom = 1 - discountGroup;
  }
  const phiSauNhom = phiSauDongChiTra * heSoGiamNhom;

  // Layer 6: Loss Ratio (Only for Group contract usually, or if LR provided)
  let heSoTangLR = 1;
  let heSoGiamLR = 1;
  
  if (info.loaiHopDong === ContractType.NHOM && info.tyLeBoiThuongNamTruoc > 0) {
      const lrFactors = getLRFactors(info.tyLeBoiThuongNamTruoc);
      heSoTangLR = 1 + lrFactors.increase;
      heSoGiamLR = 1 - lrFactors.decrease;
  }
  
  const phiSauLR = phiSauNhom * heSoTangLR * heSoGiamLR;

  // Layer 7: Floor Check (Min Pure Premium)
  // Apply factors to Pure Premium to get "Required Net Premium" to compare
  const phiThuanSauHeSo = tongPhiThuanToiThieu * heSoThoiHan * heSoDongChiTra * heSoGiamNhom * heSoTangLR * heSoGiamLR;

  const phiCuoi = Math.max(phiSauLR, phiThuanSauHeSo);
  const isFloorApplied = phiCuoi > phiSauLR; 

  return {
    detailByGroup,
    tongSoNhom: groups.length,
    tongSoNguoi,
    tongPhiGoc,
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