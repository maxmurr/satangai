import { z } from "zod";

export interface RetirementPlan {
  id: string;
  userId: string;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlySavings: number;
  expectedReturnRate: number;
  inflationAdjusted: boolean;
  monthlyExpenses: number;
  stocks: number;
  funds: number;
  cash: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetirementProjection extends RetirementPlan {
  yearsToRetirement: number;
  retirementYears: number;
  totalInvested: number;
  projectedWealth: number;
  targetWealth: number;
  gap: number;
  gapStatus: "surplus" | "shortfall";
  stockPercentage: number;
  fundPercentage: number;
  cashPercentage: number;
  wealthTimeline: WealthDataPoint[];
}

export interface WealthDataPoint {
  age: number;
  year: number;
  wealth: number;
  phase: "accumulation" | "withdrawal";
}

export const retirementSchema = z
  .object({
    id: z.uuid(),
    userId: z.string().default("default"),
    currentAge: z.number().int().min(18).max(100),
    retirementAge: z.number().int().max(100),
    lifeExpectancy: z.number().int().max(120),
    monthlySavings: z.number().nonnegative().max(1000000),
    expectedReturnRate: z.number().min(-10).max(20),
    inflationAdjusted: z.boolean().default(false),
    monthlyExpenses: z.number().nonnegative().max(1000000).default(80000),
    stocks: z.number().nonnegative(),
    funds: z.number().nonnegative(),
    cash: z.number().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.retirementAge > data.currentAge, {
    message:
      "อายุเกษียณต้องมากกว่าอายุปัจจุบัน (Retirement age must be greater than current age)",
    path: ["retirementAge"],
  })
  .refine((data) => data.lifeExpectancy > data.retirementAge, {
    message:
      "อายุขัยต้องมากกว่าอายุเกษียณ (Life expectancy must be greater than retirement age)",
    path: ["lifeExpectancy"],
  });

export type RetirementInput = z.infer<typeof retirementSchema>;
