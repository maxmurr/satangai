import { CashFlow, CashFlowMetrics } from "@/lib/types/cash-flow";

export function calculateCashFlowMetrics(cashFlow: CashFlow): CashFlowMetrics {
  const { monthlyIncome, expenses, debt, investments } = cashFlow;

  // Validate inputs
  if (monthlyIncome <= 0) {
    return {
      ...cashFlow,
      remainingCash: -expenses - debt - investments,
      financialHealthScore: 0,
      debtToEquityRatio: 0,
      savingRatio: 0,
      healthCategory: "Poor",
    };
  }

  // Calculate remaining cash
  const remainingCash = monthlyIncome - (expenses + debt + investments);

  // Calculate Debt to Equity Ratio
  // Equity = monthlyIncome - debt (net income after debt)
  const equity = monthlyIncome - debt;
  const debtToEquityRatio =
    equity > 0 ? debt / equity : debt > 0 ? Infinity : 0;

  // Calculate Saving Ratio (investments as savings)
  const savingRatio = investments / monthlyIncome;

  // Calculate Financial Health Score (0-100)
  // Weighted factors:
  // - Saving Ratio: 40% (target >= 20% = 40 points)
  // - Remaining Cash Ratio: 35% (positive remaining is good)
  // - Debt to Equity Ratio: 25% (lower is better, target <= 0.5)
  const savingScore = Math.min((savingRatio / 0.2) * 40, 40);
  const remainingCashRatio = remainingCash / monthlyIncome;
  const cashScore = Math.max(
    Math.min(remainingCashRatio * 100 * 0.35, 35),
    -35
  ); // Can be negative if over-allocated
  const deRatio =
    debtToEquityRatio > 0 ? 1 / (1 + debtToEquityRatio) : 1;
  const deScore = Math.min(deRatio * 25, 25);

  const financialHealthScore = Math.max(
    0,
    Math.min(100, savingScore + cashScore + deScore)
  );

  // Determine health category
  let healthCategory: "Excellent" | "Good" | "Fair" | "Poor";
  if (financialHealthScore >= 80) {
    healthCategory = "Excellent";
  } else if (financialHealthScore >= 60) {
    healthCategory = "Good";
  } else if (financialHealthScore >= 40) {
    healthCategory = "Fair";
  } else {
    healthCategory = "Poor";
  }

  return {
    ...cashFlow,
    remainingCash,
    financialHealthScore: Math.round(financialHealthScore),
    debtToEquityRatio: Math.round(debtToEquityRatio * 100) / 100,
    savingRatio: Math.round(savingRatio * 100) / 100,
    healthCategory,
  };
}

export function getHealthCategoryColor(
  category: "Excellent" | "Good" | "Fair" | "Poor"
): string {
  switch (category) {
    case "Excellent":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "Good":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Fair":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "Poor":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}
