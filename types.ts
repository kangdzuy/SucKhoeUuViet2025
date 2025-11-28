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

// Interfaces
export interface GeneralInfo {
  // soHopDong removed
  tenKhachHang: string;
  loaiHopDong: ContractType;
  phamViDiaLy: Geography;
  thoiHanBaoHiem: Duration;
  mucDongChiTra: CoPay;
  tyLeBoiThuongNamTruoc: number; // Percentage 0-100+
}

export interface Benefits {
  chonQuyenLoiA: boolean;
  stbhA: number;
  chonQuyenLoiB: boolean;
  stbhB: number;
  chonQuyenLoiC: boolean;
  stbhC: number;
  chonQuyenLoiD: boolean;
  stbhD: number;
  chonQuyenLoiE: boolean;
  stbhE: number;
  chonQuyenLoiF: boolean;
  stbhF: number;
  chonQuyenLoiG: boolean;
  stbhG: number;
  chonQuyenLoiH: boolean;
  stbhH: number;
  chonQuyenLoiI: boolean;
  stbhI: number;
}

// Renamed from InsuredPerson to InsuranceGroup to handle both Individuals (size=1) and Groups
export interface InsuranceGroup extends Benefits {
  id: string;
  tenNhom: string; // Group Name or Individual Name
  soNguoi: number; // >= 1
  tuoiTrungBinh: number; // Used for calculation
  
  // Optional for UI convenience in "Individual" mode to auto-calc average age
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
  details: Record<string, number>; // Breakdown per benefit (total for the group)
}

export interface CalculationResult {
  detailByGroup: GroupResult[];
  tongSoNhom: number;
  tongSoNguoi: number;
  
  tongPhiGoc: number; // Sum of all groups base premium
  tongPhiThuanToiThieu: number; // Added to interface
  
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