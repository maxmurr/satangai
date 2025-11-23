import { z } from "zod";

export interface TaxCalculation {
  id: string;
  userId: string;
  year: number;
  annualIncome: number;
  personalDeduction: number;
  spouseCount: 0 | 1;
  childCount: number;
  lifeInsurance: number;
  healthInsurance: number;
  providentFund: number;
  socialSecurity: number;
  rmf: number;
  ssf: number;
  elderlyCare: number;
  mortgageInterest: number;
  donations: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxResult extends TaxCalculation {
  spouseDeduction: number;
  childDeduction: number;
  totalInsuranceDeduction: number;
  totalFundDeduction: number;
  donationDeduction: number;
  totalDeductions: number;
  netTaxableIncome: number;
  taxLiability: number;
  marginalRate: number;
  effectiveRate: number;
  optimizationTips: TaxTip[];
}

export interface TaxTip {
  category: string;
  suggestion: string;
  potentialSaving: number;
  requiredContribution: number;
  priority: "high" | "medium" | "low";
}

export interface TaxBracketDetail {
  bracket: number;
  min: number;
  max: number;
  rate: number;
  taxableInThisBracket: number;
  taxFromThisBracket: number;
}

export interface DeductionWarning {
  field: string;
  limit: number;
  input: number;
  message: string;
}

export interface DeductionResult {
  personal: number;
  spouse: number;
  child: number;
  insurance: number;
  funds: number;
  elderly: number;
  mortgage: number;
  donation: number;
  total: number;
  warnings: DeductionWarning[];
}

export const taxSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().default("default"),
    year: z.number().int().min(2025),
    annualIncome: z.number().positive().max(100000000),
    personalDeduction: z.number().default(60000),
    spouseCount: z.union([z.literal(0), z.literal(1)]),
    childCount: z.number().int().nonnegative().max(20),
    lifeInsurance: z.number().nonnegative().max(100000),
    healthInsurance: z.number().nonnegative(),
    providentFund: z.number().nonnegative(),
    rmf: z.number().nonnegative(),
    ssf: z.number().nonnegative(),
    socialSecurity: z.number().nonnegative(),
    elderlyCare: z.number().nonnegative().max(200000),
    mortgageInterest: z.number().nonnegative().max(100000),
    donations: z.number().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.providentFund + data.rmf + data.ssf <= 500000, {
    message:
      "รวมกองทุนเกิน 500,000฿ (Total fund contributions exceed 500K limit)",
    path: ["providentFund"],
  });

export type TaxInput = z.infer<typeof taxSchema>;
