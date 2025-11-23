import { z } from "zod";

export interface CashFlow {
  id: string;
  monthlyIncome: number;
  expenses: number;
  debt: number;
  investments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashFlowMetrics extends CashFlow {
  remainingCash: number;
  financialHealthScore: number;
  debtToEquityRatio: number;
  savingRatio: number;
  healthCategory: "Excellent" | "Good" | "Fair" | "Poor";
}

export const cashFlowSchema = z
  .object({
    id: z.uuid(),
    monthlyIncome: z.number().positive().max(10000000),
    expenses: z.number().nonnegative(),
    debt: z.number().nonnegative(),
    investments: z.number().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(
    (data) =>
      data.expenses + data.debt + data.investments <= data.monthlyIncome,
    {
      message: "รวมค่าใช้จ่ายเกินรายได้ (Total allocations exceed income)",
      path: ["expenses"],
    }
  );

export type CashFlowInput = z.infer<typeof cashFlowSchema>;
