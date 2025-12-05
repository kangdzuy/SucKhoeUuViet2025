
import { SystemConfig, Duration, CoPay, Geography, RateTable } from '../types';

const STORAGE_KEY = 'PAC_CALC_CONFIG_V5'; // Version bumped for A1/A2 split

// Helper to clone base rates and apply 0.7 factor for default Min Rates
const generateDefaultMinRates = (base: RateTable): RateTable => {
    const minRates: any = {};
    for (const key in base) {
        if (typeof (base as any)[key] === 'number') {
            minRates[key] = (base as any)[key] * 0.7;
        } else if (Array.isArray((base as any)[key])) {
            minRates[key] = (base as any)[key].map((v: number) => Number((v * 0.7).toFixed(4)));
        }
    }
    return minRates as RateTable;
};

const DEFAULT_BASE_RATES: RateTable = {
    // --- BENEFIT A - VIETNAM ---
    // Split into A1 (Death/PTD) and A2 (PPD) - Initialized with same base for now
    A1_VN: [0.17, 0.11, 0.12, 0.13, 0.17], 
    A2_VN: [0.17, 0.11, 0.12, 0.13, 0.17],

    A_ALLOWANCE_3_5_VN: [0.80, 0.49, 0.55, 0.61, 0.80],
    A_ALLOWANCE_6_9_VN: [0.68, 0.42, 0.47, 0.52, 0.68],
    A_ALLOWANCE_10_12_VN: [0.62, 0.38, 0.43, 0.47, 0.62],
    A_MEDICAL_LOW_VN: [1.56, 0.96, 1.08, 1.20, 1.56], // <= 40M
    A_MEDICAL_MID1_VN: [1.22, 0.75, 0.84, 0.94, 1.22], // 40-60M
    A_MEDICAL_MID2_VN: [1.01, 0.62, 0.70, 0.78, 1.01], // 60-100M
    A_MEDICAL_HIGH_VN: [0.86, 0.53, 0.60, 0.66, 0.86], // > 100M

    // --- BENEFIT A - ASIA ---
    A1_ASIA: [0.22, 0.13, 0.15, 0.17, 0.22],
    A2_ASIA: [0.22, 0.13, 0.15, 0.17, 0.22],

    A_ALLOWANCE_3_5_ASIA: [1.00, 0.61, 0.69, 0.77, 1.00],
    A_ALLOWANCE_6_9_ASIA: [0.85, 0.52, 0.59, 0.66, 0.85],
    A_ALLOWANCE_10_12_ASIA: [0.77, 0.47, 0.53, 0.59, 0.77],
    A_MEDICAL_LOW_ASIA: [1.96, 1.20, 1.35, 1.50, 1.96],
    A_MEDICAL_MID1_ASIA: [1.52, 0.94, 1.05, 1.17, 1.52],
    A_MEDICAL_MID2_ASIA: [1.26, 0.78, 0.87, 0.97, 1.26],
    A_MEDICAL_HIGH_ASIA: [1.08, 0.66, 0.75, 0.83, 1.08],

    // --- BENEFIT A - GLOBAL ---
    A1_GLOBAL: [0.24, 0.15, 0.17, 0.19, 0.24],
    A2_GLOBAL: [0.24, 0.15, 0.17, 0.19, 0.24],

    A_ALLOWANCE_3_5_GLOBAL: [1.12, 0.69, 0.77, 0.86, 1.12],
    A_ALLOWANCE_6_9_GLOBAL: [0.95, 0.59, 0.66, 0.73, 0.95],
    A_ALLOWANCE_10_12_GLOBAL: [0.86, 0.53, 0.60, 0.66, 0.86],
    A_MEDICAL_LOW_GLOBAL: [2.19, 1.35, 1.52, 1.68, 2.19],
    A_MEDICAL_MID1_GLOBAL: [1.70, 1.05, 1.18, 1.31, 1.70],
    A_MEDICAL_MID2_GLOBAL: [1.41, 0.87, 0.98, 1.09, 1.41],
    A_MEDICAL_HIGH_GLOBAL: [1.21, 0.74, 0.84, 0.93, 1.21],

    // --- BENEFIT B (Death/Illness) ---
    B_VN: [0.18, 0.15, 0.15, 0.18, 0.25], 
    B_ASIA: [0.27, 0.22, 0.22, 0.27, 0.37],
    B_GLOBAL: [0.45, 0.37, 0.37, 0.45, 0.62],

    // --- BENEFIT C (Inpatient) ---
    C_VN_BAND1: [3.50, 3.23, 2.15, 2.69, 3.50], // 40-60M
    C_VN_BAND2: [3.24, 2.99, 1.99, 2.49, 3.24], // 60-100M
    C_VN_BAND3: [2.85, 2.63, 1.76, 2.19, 2.85], // 100-200M
    C_VN_BAND4: [2.46, 2.27, 1.51, 1.89, 2.46], // 200-400M
    
    C_ASIA_BAND1: [4.38, 4.04, 2.69, 3.37, 4.38],
    C_ASIA_BAND2: [4.05, 3.74, 2.49, 3.12, 4.05],
    C_ASIA_BAND3: [3.57, 3.29, 2.19, 2.74, 3.57],
    C_ASIA_BAND4: [3.07, 2.84, 1.89, 2.36, 3.07],
    
    C_GLOBAL_BAND1: [4.90, 4.52, 3.02, 3.77, 4.90],
    C_GLOBAL_BAND2: [4.54, 4.19, 2.79, 3.49, 4.54],
    C_GLOBAL_BAND3: [3.99, 3.69, 2.46, 3.07, 3.99],
    C_GLOBAL_BAND4: [3.44, 3.18, 2.12, 2.65, 3.44],

    // --- BENEFIT D (Maternity) ---
    D_VN_BAND1: [0, 0, 0.84, 0.67, 0], // 40-60M
    D_VN_BAND2: [0, 0, 0.54, 0.43, 0], // 60-100M
    D_VN_BAND3: [0, 0, 0.30, 0.24, 0], // 100-200M
    D_VN_BAND4: [0, 0, 0.16, 0.13, 0], // 200-400M
    
    D_ASIA_BAND1: [0, 0, 1.05, 0.84, 0],
    D_ASIA_BAND2: [0, 0, 0.67, 0.54, 0],
    D_ASIA_BAND3: [0, 0, 0.37, 0.30, 0],
    D_ASIA_BAND4: [0, 0, 0.20, 0.16, 0],
    
    D_GLOBAL_BAND1: [0, 0, 1.18, 0.94, 0],
    D_GLOBAL_BAND2: [0, 0, 0.75, 0.60, 0],
    D_GLOBAL_BAND3: [0, 0, 0.41, 0.33, 0],
    D_GLOBAL_BAND4: [0, 0, 0.22, 0.18, 0],

    // --- BENEFIT E (Outpatient) - NEW BANDS ---
    // VIETNAM
    E_VN_BAND1: [31.68, 19.50, 29.25, 24.37, 31.68], // 5-10M
    E_VN_BAND2: [26.03, 16.02, 24.03, 20.02, 26.03], // 10-20M
    E_VN_BAND3: [25.49, 15.69, 23.53, 19.61, 25.49], // >20M
    // ASIA
    E_ASIA_BAND1: [39.60, 24.37, 36.56, 30.46, 39.60],
    E_ASIA_BAND2: [32.54, 20.02, 30.04, 25.03, 32.54],
    E_ASIA_BAND3: [31.86, 19.61, 29.41, 24.51, 31.86],
    // GLOBAL
    E_GLOBAL_BAND1: [44.36, 27.30, 40.94, 34.12, 44.36],
    E_GLOBAL_BAND2: [36.44, 22.43, 33.64, 28.03, 36.44],
    E_GLOBAL_BAND3: [35.68, 21.96, 32.94, 27.45, 35.68],

    // --- BENEFIT F (Dental) - NEW BANDS ---
    // VIETNAM
    F_VN_BAND1: [58.48, 35.99, 44.98, 53.98, 58.48], // 2-5M
    F_VN_BAND2: [39.06, 24.03, 30.04, 36.05, 39.06], // 5-10M
    F_VN_BAND3: [35.52, 21.86, 27.32, 32.79, 35.52], // 10-20M
    // ASIA
    F_ASIA_BAND1: [73.09, 44.98, 56.23, 67.47, 73.09],
    F_ASIA_BAND2: [48.82, 30.04, 37.55, 45.07, 48.82],
    F_ASIA_BAND3: [44.40, 27.32, 34.15, 40.98, 44.40],
    // GLOBAL
    F_GLOBAL_BAND1: [81.87, 50.38, 62.97, 75.57, 81.87],
    F_GLOBAL_BAND2: [54.68, 33.65, 42.06, 50.47, 54.68],
    F_GLOBAL_BAND3: [49.73, 30.60, 38.25, 45.90, 49.73],

    // --- BENEFIT I (Poisoning) ---
    // VIETNAM
    I_MAIN_VN: [0.0020, 0.0012, 0.0014, 0.0015, 0.0020],
    I_ALLOWANCE_VN: [0.0050, 0.0031, 0.0035, 0.0038, 0.0050],
    I_MEDICAL_VN: [0.0499, 0.0307, 0.0345, 0.0384, 0.0499],
    
    // ASIA
    I_MAIN_ASIA: [0.0025, 0.0015, 0.0017, 0.0019, 0.0025],
    I_ALLOWANCE_ASIA: [0.0062, 0.0038, 0.0043, 0.0048, 0.0062],
    I_MEDICAL_ASIA: [0.0624, 0.0384, 0.0432, 0.0480, 0.0624],

    // GLOBAL
    I_MAIN_GLOBAL: [0.0028, 0.0017, 0.0019, 0.0021, 0.0028],
    I_ALLOWANCE_GLOBAL: [0.0070, 0.0043, 0.0048, 0.0054, 0.0070],
    I_MEDICAL_GLOBAL: [0.0698, 0.0430, 0.0483, 0.0537, 0.0698],

    // --- BENEFIT G (Overseas) SPLIT ---
    // G1. Medical Expenses (~0.0057 in VN)
    G_MEDICAL_VN: [0.0057, 0.0057, 0.0057, 0.0057, 0.0057],
    G_MEDICAL_ASIA: [0.00855, 0.00855, 0.00855, 0.00855, 0.00855],
    G_MEDICAL_GLOBAL: [0.01425, 0.01425, 0.01425, 0.01425, 0.01425],
    
    // G2. Emergency Transport (~0.0012 in VN)
    G_TRANSPORT_VN: [0.0012, 0.0012, 0.0012, 0.0012, 0.0012],
    G_TRANSPORT_ASIA: [0.0018, 0.0018, 0.0018, 0.0018, 0.0018],
    G_TRANSPORT_GLOBAL: [0.0030, 0.0030, 0.0030, 0.0030, 0.0030],

    // --- BENEFIT H (Income Support) SPLIT ---
    // H1. Hospitalization (~0.003 in VN)
    H_HOSPITALIZATION_VN: [0.003, 0.003, 0.003, 0.003, 0.003],
    H_HOSPITALIZATION_ASIA: [0.0045, 0.0045, 0.0045, 0.0045, 0.0045],
    H_HOSPITALIZATION_GLOBAL: [0.0075, 0.0075, 0.0075, 0.0075, 0.0075],
    
    // H2. Surgical (Placeholder 0)
    H_SURGICAL_VN: [0, 0, 0, 0, 0],
    H_SURGICAL_ASIA: [0, 0, 0, 0, 0],
    H_SURGICAL_GLOBAL: [0, 0, 0, 0, 0],
};

// Default Configuration
export const DEFAULT_CONFIG: SystemConfig = {
  durationFactors: {
    [Duration.DEN_3_THANG]: 0.3,
    [Duration.DEN_6_THANG]: 0.5,
    [Duration.DEN_9_THANG]: 0.75,
    [Duration.TREN_9_THANG]: 1.0,
  },
  copayDiscounts: {
    [CoPay.MUC_0]: 0,
    [CoPay.MUC_10]: 0.10, // Updated to 10%
    [CoPay.MUC_20]: 0.20, // Updated to 20%
    [CoPay.MUC_30]: 0.30, // Updated to 30%
    [CoPay.MUC_40]: 0.40, // Updated to 40%
    [CoPay.MUC_50]: 0.50, // 50%
  },
  geoFactors: {
    [Geography.VIETNAM]: 1.0,
    [Geography.CHAU_A]: 1.5,
    [Geography.TOAN_CAU]: 2.5
  },
  baseRates: DEFAULT_BASE_RATES,
  minRates: generateDefaultMinRates(DEFAULT_BASE_RATES)
};

export const configService = {
  getConfig: (): SystemConfig => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as SystemConfig;
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig: (config: SystemConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error("Failed to save config", e);
    }
  },

  resetConfig: () => {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_CONFIG;
  }
};
