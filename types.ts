
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

// Config for Benefit B (Death/Illness)
export enum BenefitBMethod {
  THEO_LUONG = 'TheoLuong',
  THEO_SO_TIEN = 'TheoSoTien'
}

export enum BenefitASalaryOption {
  OP_3_5 = '3-5',
  OP_6_9 = '6-9',
  OP_10_12 = '10-12'
}

// NEW: A4 Programs
export enum BenefitA4Program {
  P1 = 'P1', // 20-40M
  P2 = 'P2', // 40-60M
  P3 = 'P3', // 60-100M
  P4 = 'P4'  // 100-1000M
}

// NEW: C Programs
export enum BenefitCProgram {
  P1 = 'P1', // 40-60M
  P2 = 'P2', // 60-100M
  P3 = 'P3', // 100-200M
  P4 = 'P4'  // 200-400M
}

// --- SYSTEM CONFIG INTERFACES ---
export interface RateTable {
    // --- BENEFIT A: REGION SPECIFIC ---
    // VIETNAM
    // SPLIT A1 and A2
    A1_VN: number[]; // Death / PTD
    A2_VN: number[]; // PPD
    
    A_ALLOWANCE_3_5_VN: number[];
    A_ALLOWANCE_6_9_VN: number[];
    A_ALLOWANCE_10_12_VN: number[];
    A_MEDICAL_LOW_VN: number[]; // <= 40M
    A_MEDICAL_MID1_VN: number[]; // 40-60M
    A_MEDICAL_MID2_VN: number[]; // 60-100M
    A_MEDICAL_HIGH_VN: number[]; // > 100M
    
    // ASIA
    A1_ASIA: number[];
    A2_ASIA: number[];

    A_ALLOWANCE_3_5_ASIA: number[];
    A_ALLOWANCE_6_9_ASIA: number[];
    A_ALLOWANCE_10_12_ASIA: number[];
    A_MEDICAL_LOW_ASIA: number[];
    A_MEDICAL_MID1_ASIA: number[];
    A_MEDICAL_MID2_ASIA: number[];
    A_MEDICAL_HIGH_ASIA: number[];
    
    // GLOBAL
    A1_GLOBAL: number[];
    A2_GLOBAL: number[];

    A_ALLOWANCE_3_5_GLOBAL: number[];
    A_ALLOWANCE_6_9_GLOBAL: number[];
    A_ALLOWANCE_10_12_GLOBAL: number[];
    A_MEDICAL_LOW_GLOBAL: number[];
    A_MEDICAL_MID1_GLOBAL: number[];
    A_MEDICAL_MID2_GLOBAL: number[];
    A_MEDICAL_HIGH_GLOBAL: number[];

    // --- BENEFIT B (Death/Illness) REGION SPECIFIC ---
    B_VN: number[];
    B_ASIA: number[];
    B_GLOBAL: number[];

    // --- BENEFIT C (Inpatient) REGION SPECIFIC + SI BANDS ---
    // Band 1: 40-60M, Band 2: 60-100M, Band 3: 100-200M, Band 4: 200-400M
    C_VN_BAND1: number[];
    C_VN_BAND2: number[];
    C_VN_BAND3: number[];
    C_VN_BAND4: number[];
    
    C_ASIA_BAND1: number[];
    C_ASIA_BAND2: number[];
    C_ASIA_BAND3: number[];
    C_ASIA_BAND4: number[];

    C_GLOBAL_BAND1: number[];
    C_GLOBAL_BAND2: number[];
    C_GLOBAL_BAND3: number[];
    C_GLOBAL_BAND4: number[];


    // --- BENEFIT D (Maternity) REGION SPECIFIC + SI BANDS ---
    D_VN_BAND1: number[];
    D_VN_BAND2: number[];
    D_VN_BAND3: number[];
    D_VN_BAND4: number[];
    
    D_ASIA_BAND1: number[];
    D_ASIA_BAND2: number[];
    D_ASIA_BAND3: number[];
    D_ASIA_BAND4: number[];

    D_GLOBAL_BAND1: number[];
    D_GLOBAL_BAND2: number[];
    D_GLOBAL_BAND3: number[];
    D_GLOBAL_BAND4: number[];

    // --- BENEFIT E (Outpatient) REGION SPECIFIC + SI BANDS ---
    // Band 1: 5-10M, Band 2: 10-20M, Band 3: >20M
    E_VN_BAND1: number[];
    E_VN_BAND2: number[];
    E_VN_BAND3: number[];

    E_ASIA_BAND1: number[];
    E_ASIA_BAND2: number[];
    E_ASIA_BAND3: number[];

    E_GLOBAL_BAND1: number[];
    E_GLOBAL_BAND2: number[];
    E_GLOBAL_BAND3: number[];

    // --- BENEFIT F (Dental) REGION SPECIFIC + SI BANDS ---
    // Band 1: 2-5M, Band 2: 5-10M, Band 3: 10-20M
    F_VN_BAND1: number[];
    F_VN_BAND2: number[];
    F_VN_BAND3: number[];
    
    F_ASIA_BAND1: number[];
    F_ASIA_BAND2: number[];
    F_ASIA_BAND3: number[];

    F_GLOBAL_BAND1: number[];
    F_GLOBAL_BAND2: number[];
    F_GLOBAL_BAND3: number[];

    // --- BENEFIT I (Poisoning) REGION SPECIFIC - SPLIT COMPONENTS ---
    // 1. Death / PTD / PPD
    I_MAIN_VN: number[];
    I_MAIN_ASIA: number[];
    I_MAIN_GLOBAL: number[];
    
    // 2. Allowance
    I_ALLOWANCE_VN: number[];
    I_ALLOWANCE_ASIA: number[];
    I_ALLOWANCE_GLOBAL: number[];

    // 3. Medical
    I_MEDICAL_VN: number[];
    I_MEDICAL_ASIA: number[];
    I_MEDICAL_GLOBAL: number[];

    // --- BENEFIT G (Overseas) REGION SPECIFIC - SPLIT COMPONENTS ---
    // G1. Medical Expenses
    G_MEDICAL_VN: number[];
    G_MEDICAL_ASIA: number[];
    G_MEDICAL_GLOBAL: number[];
    
    // G2. Emergency Transport
    G_TRANSPORT_VN: number[];
    G_TRANSPORT_ASIA: number[];
    G_TRANSPORT_GLOBAL: number[];

    // --- BENEFIT H (Income Support) REGION SPECIFIC - SPLIT COMPONENTS ---
    // H1. Hospitalization Allowance (Tro cap nam vien)
    H_HOSPITALIZATION_VN: number[];
    H_HOSPITALIZATION_ASIA: number[];
    H_HOSPITALIZATION_GLOBAL: number[];
    
    // H2. Surgical Allowance (Tro cap phau thuat)
    H_SURGICAL_VN: number[];
    H_SURGICAL_ASIA: number[];
    H_SURGICAL_GLOBAL: number[];
}

export interface SystemConfig {
  durationFactors: Record<string, number>;
  copayDiscounts: Record<string, number>;
  baseRates: RateTable;
  minRates: RateTable;
  geoFactors: Record<string, number>;
}

// Interfaces
export interface GeneralInfo {
  tenKhachHang: string;
  loaiHopDong: ContractType;
  // phamViDiaLy & mucDongChiTra REMOVED from GeneralInfo
  thoiHanBaoHiem: Duration;
  renewalStatus: RenewalStatus; 
  tyLeBoiThuongNamTruoc: number; 
}

export interface Benefits {
  // Moved from GeneralInfo to Benefits (Individual Level)
  // phamViDiaLy REMOVED - now per benefit
  mucDongChiTra: CoPay;
  
  luongCoBan: number; // Unified Salary Field for A and H

  // Quyen loi A - Tai nan (Updated)
  chonQuyenLoiA: boolean;
  geoA: Geography;
  methodA: BenefitAMethod;
  // luongA removed (use luongCoBan)
  soThangLuongA: number; // Max 30 for main benefit
  stbhA: number; // Main SI (Death/PTD)
  
  // A - Sub Components
  subA_A1: boolean; // Tu Vong / TTTBVV
  subA_A2: boolean; // Thuong tat bo phan vinh vien

  // A - Sub 1: Tro cap luong (A3)
  subA_TroCap: boolean;
  subA_TroCap_Option: BenefitASalaryOption;
  soThangLuongTroCap: number; // Số tháng cụ thể cho trợ cấp (3-12)

  // A - Sub 2: Y te (A4)
  subA_YTe: boolean;
  subA_YTe_Program: BenefitA4Program; // NEW: Selection by Program
  stbhA_YTe: number;

  // B
  chonQuyenLoiB: boolean;
  geoB: Geography;
  methodB: BenefitBMethod;
  soThangLuongB: number;
  stbhB: number;
  
  // C
  chonQuyenLoiC: boolean;
  geoC: Geography;
  programC: BenefitCProgram; // NEW: Program Selection for C
  stbhC: number;
  
  // D
  chonQuyenLoiD: boolean; // Thai san - Depends on C
  geoD: Geography;
  stbhD: number;
  
  // E
  chonQuyenLoiE: boolean; // Ngoai tru - Depends on C
  geoE: Geography;
  stbhE: number;
  
  // F
  chonQuyenLoiF: boolean; // Nha khoa - Depends on C
  geoF: Geography;
  stbhF: number;
  
  // G
  chonQuyenLoiG: boolean; // Nuoc ngoai - Depends on C
  geoG: Geography;
  stbhG: number;
  subG_YTe: boolean;        // G1 Selection
  subG_VanChuyen: boolean;  // G2 Selection
  
  // Quyen loi H - Tro cap mat giam thu nhap
  chonQuyenLoiH: boolean;
  geoH: Geography;
  methodH: BenefitHMethod;
  // luongTrungBinh removed (use luongCoBan)
  soThangLuong: number; // 3, 6, 9, 12
  stbhH: number; // Final SI for calc
  subH_NamVien: boolean;    // H1 Selection
  subH_PhauThuat: boolean;  // H2 Selection
  
  // I
  chonQuyenLoiI: boolean; // Ngo doc - Depends on A
  geoI: Geography;
  stbhI: number;
  subI_TuVong: boolean;     // NEW: I1 Selection
  subI_TroCap: boolean;     // NEW: I2 Selection
  subI_YTe: boolean;        // NEW: I3 Selection
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

// Detailed line item for a benefit calculation
export interface BenefitResultDetail {
  code: string;
  label: string;
  geo: string;            // Added Geo to result detail
  baseFee: number;        // Raw Base
  discountedFee: number;  // Base * Adj * Duration (The "Normal" Price)
  minFee: number;         // Min * Duration (The "Floor" Price)
  finalFee: number;       // Max(Discounted, Min)
  isMinApplied: boolean;  // True if Min > Discounted
}

export interface GroupResult {
  id: string;
  tenNhom: string;
  soNguoi: number;
  tuoiTrungBinh: number;
  tongPhiGoc: number;      // Base sum before discount
  tongPhiCuoi: number;     // Final sum after Granular Max(Adjusted, Min) check
  benefitDetails: BenefitResultDetail[]; // Detailed list of benefits for this group
  
  // Per group factors for display
  // phamViDiaLy: Geography; // REMOVED from GroupResult as it is now per-benefit
  mucDongChiTra: CoPay;
  percentCopay: number; 
}

export interface CalculationResult {
  detailByGroup: GroupResult[];
  tongSoNhom: number;
  tongSoNguoi: number;
  
  tongPhiGoc: number;      // Raw Base Sum
  tongPhiCuoi: number;     // The final payable amount (aggregated from granular checks)
  
  // Factors
  heSoThoiHan: number;
  
  // Additive Adjustment Components (Percentages as decimals, e.g., 0.1 for 10%)
  // percentCopay REMOVED from Global Result
  percentGroup: number;    // Usually negative
  percentLR: number;       // Positive or Negative
  
  // totalAdjPercent REMOVED (varies per group now)
  
  // Validation
  validationErrors: string[];
}
