import { Duration, CoPay, BenefitASalaryOption } from './types';

// Mock Data for Table lookups based on prompt descriptions

// 1. Short term factors
export const DURATION_FACTORS: Record<Duration, number> = {
  [Duration.DEN_3_THANG]: 0.3,
  [Duration.DEN_6_THANG]: 0.5,
  [Duration.DEN_9_THANG]: 0.75,
  [Duration.TREN_9_THANG]: 1.0,
};

// 2. Co-pay discount mapping (III.1)
export const COPAY_DISCOUNT: Record<CoPay, number> = {
  [CoPay.MUC_0]: 0,
  [CoPay.MUC_10]: 0.05,
  [CoPay.MUC_20]: 0.10,
  [CoPay.MUC_30]: 0.20,
  [CoPay.MUC_40]: 0.35,
  [CoPay.MUC_50]: 0.50,
};

// 3. Group Size Discount (Mindmap: 5% - 40%)
export const getGroupSizeDiscount = (size: number): number => {
  if (size < 5) return 0;
  if (size < 20) return 0.05;   // 5 - 19
  if (size < 50) return 0.10;   // 20 - 49
  if (size < 100) return 0.15;  // 50 - 99
  if (size < 200) return 0.20;  // 100 - 199
  if (size < 300) return 0.25;  // 200 - 299
  if (size < 500) return 0.30;  // 300 - 499
  if (size < 1000) return 0.35; // 500 - 999
  return 0.40;                  // >= 1000
};

// 4. Loss Ratio Adjustments (Mindmap: Tang/Giam theo ty le boi thuong nam truoc)
// Rules based on common underwriting practices:
// LR < 30% -> High Discount
// 30 <= LR < 40 -> Mod Discount
// ...
// LR > 100 -> High Loading
export const getLRFactors = (lr: number) => {
  let increase = 0; // Loading
  let decrease = 0; // Discount

  // Loading Rules (Tang Phi)
  if (lr >= 200) increase = 0.70;
  else if (lr >= 150) increase = 0.50;
  else if (lr >= 120) increase = 0.35;
  else if (lr >= 100) increase = 0.20;
  else if (lr >= 85) increase = 0.10;
  else if (lr >= 70) increase = 0; // Neutral zone

  // Discount Rules (Giam Phi)
  if (lr < 20) decrease = 0.30;
  else if (lr < 30) decrease = 0.20;
  else if (lr < 40) decrease = 0.15;
  else if (lr < 50) decrease = 0.10;
  else if (lr < 60) decrease = 0.05;

  return { increase, decrease };
};

// 5. Valid SI Bands for Validation UI
export const SI_BANDS_C = [40000000, 60000000, 100000000, 200000000, 400000000];
export const SI_BANDS_E = [5000000, 10000000, 20000000];
export const SI_BANDS_F = [2000000, 5000000, 10000000, 20000000];

// --- BENEFIT A DATA TABLES ---

// Age Buckets: 0: 0-10, 1: 11-17, 2: 18-50, 3: 51-65, 4: 66-70
export const getAgeBucketIndex = (age: number): number => {
  if (age <= 10) return 0;
  if (age <= 17) return 1;
  if (age <= 50) return 2;
  if (age <= 65) return 3;
  if (age <= 70) return 4;
  return 2; // Default fallback
};

// Main A Rate (Death/PTD/PPD)
const RATE_A_MAIN = [0.17, 0.11, 0.12, 0.13, 0.17];

// Sub A1: Allowance (Tro Cap Luong)
const RATE_A_ALLOWANCE: Record<BenefitASalaryOption, number[]> = {
  [BenefitASalaryOption.OP_3_5]: [0.80, 0.49, 0.55, 0.61, 0.80],
  [BenefitASalaryOption.OP_6_9]: [0.68, 0.42, 0.47, 0.52, 0.68],
  [BenefitASalaryOption.OP_10_12]: [0.62, 0.38, 0.43, 0.47, 0.62]
};

// Sub A2: Medical (Y Te)
// Bands: 0: <=40M, 1: <=60M, 2: <=100M, 3: >100M
const getMedicalBandIndex = (si: number): number => {
  if (si <= 40000000) return 0;
  if (si <= 60000000) return 1;
  if (si <= 100000000) return 2;
  return 3;
};

const RATE_A_MEDICAL = [
  [1.56, 0.96, 1.08, 1.20, 1.56], // <= 40M
  [1.22, 0.75, 0.84, 0.94, 1.22], // > 40M - 60M
  [1.01, 0.62, 0.70, 0.78, 1.01], // > 60M - 100M
  [0.86, 0.53, 0.60, 0.66, 0.86], // > 100M
];

// 6. Base Rate Lookup Function
export const getBaseRate = (
  benefit: string,
  age: number,
  geo: string,
  si: number,
  extraConfig?: any // to pass sub-options like salary option
): number => {
  
  const ageIdx = getAgeBucketIndex(age);

  let ageFactor = 1.0; // Fallback factor for other benefits
  if (age < 10) ageFactor = 1.2;
  else if (age > 40) ageFactor = 1.0 + (age - 40) * 0.02;
  else if (age > 60) ageFactor = 1.5 + (age - 60) * 0.05;

  let geoFactor = 1.0;
  if (geo === 'ChauA') geoFactor = 1.5;
  if (geo === 'ToanCau') geoFactor = 2.5;

  switch (benefit) {
    case 'A_MAIN': 
      return (RATE_A_MAIN[ageIdx] || 0.12) / 100; // Value in %, convert to rate
    
    case 'A_ALLOWANCE':
      const op = extraConfig?.option as BenefitASalaryOption;
      if (!op || !RATE_A_ALLOWANCE[op]) return 0;
      return (RATE_A_ALLOWANCE[op][ageIdx] || 0) / 100;

    case 'A_MEDICAL':
      const bandIdx = getMedicalBandIndex(si);
      return (RATE_A_MEDICAL[bandIdx][ageIdx] || 0) / 100;

    // Legacy/Other benefits (Simplified for now)
    case 'B': return 0.0015 * ageFactor; 
    case 'C': return 0.012 * ageFactor * geoFactor;
    case 'D': return 0.008 * ageFactor; 
    case 'E': return 0.015 * ageFactor * geoFactor; 
    case 'F': return 0.02 * ageFactor; 
    case 'G': return 0.005 * ageFactor; 
    case 'H': return 0.003; 
    case 'I': return 0.001; 
    default: return 0;
  }
};

export const getMinPureRate = (
  benefit: string,
  age: number,
  geo: string,
  si: number,
  extraConfig?: any
): number => {
  // Usually around 60-70% of base rate
  return getBaseRate(benefit, age, geo, si, extraConfig) * 0.7;
};