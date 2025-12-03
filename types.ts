
// Enums
export enum ContractType {
  CAN_HAN = 'CaNhan',
  NHOM = 'Nhom'
}

export enum Geography {
  VIETNAM = 'VietNam',
  CHAU_A = 'ChauA',
  TOAN_CAU = 'ToanCau'
}

export enum Duration {
  DEN_3_THANG = 'Den3Thang',
  DEN_6_THANG = 'Den6Thang',
  DEN_9_THANG = 'Den9Thang',
  TREN_9_THANG = 'Tren9Thang'
}

export enum CoPay {
  MUC_0 = '0%',
  MUC_10 = '10%',
  MUC_20 = '20%',
  MUC_30 = '30%',
  MUC_40 = '40%',
  MUC_50 = '50%'
}

export enum Gender {
  NAM = 'Nam',
  NU = 'Nu'
}

export enum RenewalStatus {
  CONTINUOUS = 'CoTaiTucLienTuc',
  NON_CONTINUOUS = 'Khong'
}

// Config for Benefit H (Income Support)
export enum BenefitHMethod {
  THEO_LUONG = 'TheoLuong',
  THEO_SO_TIEN = 'TheoSoTien'
}

// Config for Benefit A (Accident)
export enum BenefitAMethod {
  THEO_LUONG = 'TheoLuong',
  THEO_SO_TIEN = 'TheoSoTien'
}

export enum BenefitASalaryOption {
  OP_3_5 = '3-5',
  OP_6_9 = '6-9',
  OP_10_12 = '10-12'
}

// Interfaces
export interface GeneralInfo {
  tenKhachHang: string;
  loaiHopDong: ContractType;
  phamViDiaLy: Geography;
  thoiHanBaoHiem: Duration;
  mucDongChiTra: CoPay;
  renewalStatus: RenewalStatus; // Updated from boolean isTaiTuc
  tyLeBoiThuongNamTruoc: number; // Percentage 0-100+
}

export interface Benefits {
  // Quyen loi A - Tai nan (Updated)
  chonQuyenLoiA: boolean;
  methodA: BenefitAMethod;
  luongA: number; // Salary for A calculation
  soThangLuongA: number; // Max 30 for main benefit
  stbhA: number; // Main SI (Death/PTD)
  
  // A - Sub 1: Tro cap luong
  subA_TroCap: boolean;
  subA_TroCap_Option: BenefitASalaryOption;
  soThangLuongTroCap: number; // Số tháng cụ thể cho trợ cấp (3-12)

  // A - Sub 2: Y te
  subA_YTe: boolean;
  stbhA_YTe: number;

  chonQuyenLoiB: boolean;
  stbhB: number;
  
  chonQuyenLoiC: boolean;
  stbhC: number;
  
  chonQuyenLoiD: boolean; // Thai san - Depends on C
  stbhD: number;
  
  chonQuyenLoiE: boolean; // Ngoai tru - Depends on C
  stbhE: number;
  
  chonQuyenLoiF: boolean; // Nha khoa - Depends on C
  stbhF: number;
  
  chonQuyenLoiG: boolean; // Nuoc ngoai - Depends on C
  stbhG: number;
  
  // Quyen loi H - Tro cap mat giam thu nhap
  chonQuyenLoiH: boolean;
  methodH: BenefitHMethod;
  luongTrungBinh: number; // For Method Salary
  soThangLuong: number; // 3, 6, 9, 12
  stbhH: number; // Final SI for calc
  
  chonQuyenLoiI: boolean; // Ngo doc - Depends on A
  stbhI: number;
}

export interface InsuranceGroup extends Benefits {
  id: string;
  tenNhom: string; 
  
  // Group specific fields (PDF Page 6)
  soNguoi: number; 
  soNam: number;
  soNu: number;
  tongSoTuoi: number;
  tuoiTrungBinh: number; 
  
  // Individual specific fields
  ngaySinh?: string; 
  gioiTinh?: Gender;
}

export interface GroupResult {
  id: string;
  tenNhom: string;
  soNguoi: number;
  tuoiTrungBinh: number;
  tongPhiGoc: number;
  tongPhiThuanToiThieu: number;
  details: Record<string, number>; 
}

export interface CalculationResult {
  detailByGroup: GroupResult[];
  tongSoNhom: number;
  tongSoNguoi: number;
  
  tongPhiGoc: number;
  tongPhiThuanToiThieu: number;
  
  heSoThoiHan: number;
  phiSauThoiHan: number;
  
  heSoDongChiTra: number;
  phiSauDongChiTra: number;
  
  heSoGiamNhom: number;
  phiSauNhom: number;
  
  heSoTangLR: number;
  heSoGiamLR: number;
  phiSauLR: number;
  
  phiThuanSauHeSo: number;
  phiCuoi: number;
  isFloorApplied: boolean;
}
