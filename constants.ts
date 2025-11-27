import { Duration, CoPay } from './types';

// Mock Data for Table lookups based on prompt descriptions

// 1. Short term factors
export const DURATION_FACTORS: Record<Duration, number> = {
  [Duration.DEN_3_THANG]: 0.3,
  [Duration.DEN_6_THANG]: 0.5,
  [Duration.DEN_9_THANG]: 0.75,
  [Duration.TREN_9_THANG]: 1.0,
};

// 2. Co-pay discount mapping (III.1) - Logic: Higher copay = lower premium (discount)
// Mapping co-pay % to discount factor (e.g. 10% copay -> 5% discount -> factor 0.95)
// NOTE: These are assumptions as specific table III.1 is not provided.
export const COPAY_DISCOUNT: Record<CoPay, number> = {
  [CoPay.MUC_0]: 0,
  [CoPay.MUC_10]: 0.05,
  [CoPay.MUC_20]: 0.10,
  [CoPay.MUC_30]: 0.20,
  [CoPay.MUC_40]: 0.35,
  [CoPay.MUC_50]: 0.50,
};

// 3. Group Size Discount (III.2.1)
export const getGroupSizeDiscount = (size: number): number => {
  if (size < 5) return 0;
  if (size < 20) return 0.05;
  if (size < 50) return 0.10;
  if (size < 100) return 0.15;
  return 0.20;
};

// 4. Loss Ratio Adjustments (III.2.2 & III.2.3)
export const getLRFactors = (lr: number) => {
  let increase = 0;
  let decrease = 0;

  // Table III.2.2 (Increase) - Assumption
  if (lr >= 140) increase = 0.50;
  else if (lr >= 100) increase = 0.30;
  else if (lr >= 70) increase = 0.15;
  else if (lr >= 40) increase = 0; // Neutral zone

  // Table III.2.3 (Decrease) - Assumption
  if (lr < 20) decrease = 0.20;
  else if (lr < 30) decrease = 0.10;
  else if (lr < 40) decrease = 0.05;

  return { increase, decrease };
};

// 5. Valid SI Bands for Validation UI
export const SI_BANDS_C = [40000000, 60000000, 100000000, 200000000, 400000000];
export const SI_BANDS_E = [5000000, 10000000, 20000000];
export const SI_BANDS_F = [2000000, 5000000, 10000000, 20000000];

// 6. Mock Base Rates (Ty Le Phi Goc)
// In a real app, this would be a large JSON or DB query.
// Structure: Function(benefit, age, geography, siBand) -> rate %
export const getBaseRate = (
  benefit: string,
  age: number,
  geo: string,
  si: number
): number => {
  // Simplified logic for demo purposes
  // Base rates usually increase with age
  let ageFactor = 1.0;
  if (age < 10) ageFactor = 1.2;
  else if (age > 40) ageFactor = 1.0 + (age - 40) * 0.02;
  else if (age > 60) ageFactor = 1.5 + (age - 60) * 0.05;

  let geoFactor = 1.0;
  if (geo === 'ChauA') geoFactor = 1.5;
  if (geo === 'ToanCau') geoFactor = 2.5;

  // Base percentages per benefit
  switch (benefit) {
    case 'A': return 0.001 * ageFactor; // 0.1%
    case 'B': return 0.0015 * ageFactor; // 0.15%
    case 'C': // Inpatient - expensive, depends on SI band usually inverse or tiered
       // Mock: ~1.2% of SI
       return 0.012 * ageFactor * geoFactor;
    case 'D': return 0.008 * ageFactor; // Maternity
    case 'E': return 0.015 * ageFactor * geoFactor; // Outpatient
    case 'F': return 0.02 * ageFactor; // Dental
    case 'G': return 0.005 * ageFactor; // Overseas
    case 'H': return 0.003; // Income support
    case 'I': return 0.001; // Food poisoning
    default: return 0;
  }
};

export const getMinPureRate = (
  benefit: string,
  age: number,
  geo: string,
  si: number
): number => {
  // Usually around 60-70% of base rate
  return getBaseRate(benefit, age, geo, si) * 0.7;
};
