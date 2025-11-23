import type {
  RetirementPlan,
  RetirementProjection,
  WealthDataPoint,
} from "@/lib/types/retirement";

// Thailand average inflation rate
const DEFAULT_INFLATION_RATE = 0.04;

/**
 * Calculates retirement projections including wealth accumulation,
 * gap analysis, and timeline data for visualization.
 */
export function calculateRetirementProjection(
  plan: RetirementPlan
): RetirementProjection {
  // Basic validation
  if (plan.currentAge >= plan.retirementAge) {
    throw new Error("Retirement age must be greater than current age");
  }
  if (plan.retirementAge >= plan.lifeExpectancy) {
    throw new Error("Life expectancy must be greater than retirement age");
  }

  // Calculate time periods
  const yearsToRetirement = plan.retirementAge - plan.currentAge;
  const retirementYears = plan.lifeExpectancy - plan.retirementAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const monthsInRetirement = retirementYears * 12;

  // Calculate total invested (without growth)
  const totalInvested = plan.monthlySavings * monthsToRetirement;

  // Calculate projected wealth at retirement using Future Value of Annuity formula
  // FV = PMT × [((1 + r)^n - 1) / r] × (1 + r)
  const monthlyRate = plan.expectedReturnRate / 100 / 12;
  let projectedWealth: number;

  if (monthlyRate === 0) {
    // If no return, just sum contributions
    projectedWealth = totalInvested;
  } else {
    const compoundFactor = Math.pow(1 + monthlyRate, monthsToRetirement);
    projectedWealth =
      plan.monthlySavings *
      ((compoundFactor - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  // Calculate target wealth needed for retirement
  // Annual expenses × retirement years
  const annualExpenses = plan.monthlyExpenses * 12;
  let targetWealth = annualExpenses * retirementYears;

  // Apply inflation adjustment if enabled
  if (plan.inflationAdjusted) {
    // Adjust for inflation over the retirement period
    // Using present value calculation: PV = FV / (1 + i)^n
    // But we want the total needed accounting for inflation during retirement
    // So we calculate the growing annuity
    const inflationFactor =
      (Math.pow(1 + DEFAULT_INFLATION_RATE, retirementYears) - 1) /
      DEFAULT_INFLATION_RATE;
    targetWealth = annualExpenses * inflationFactor;
  }

  // Calculate gap
  const gap = projectedWealth - targetWealth;
  const gapStatus = gap >= 0 ? "surplus" : "shortfall";

  // Calculate portfolio percentages
  const totalAllocation = plan.stocks + plan.funds + plan.cash;
  const stockPercentage =
    totalAllocation > 0 ? (plan.stocks / totalAllocation) * 100 : 0;
  const fundPercentage =
    totalAllocation > 0 ? (plan.funds / totalAllocation) * 100 : 0;
  const cashPercentage =
    totalAllocation > 0 ? (plan.cash / totalAllocation) * 100 : 0;

  // Generate wealth timeline for chart
  const wealthTimeline = generateWealthTimeline(
    plan.currentAge,
    plan.retirementAge,
    plan.lifeExpectancy,
    plan.monthlySavings,
    monthlyRate,
    plan.monthlyExpenses,
    plan.inflationAdjusted
  );

  return {
    ...plan,
    yearsToRetirement,
    retirementYears,
    totalInvested,
    projectedWealth,
    targetWealth,
    gap,
    gapStatus,
    stockPercentage,
    fundPercentage,
    cashPercentage,
    wealthTimeline,
  };
}

/**
 * Generates wealth timeline data points for chart visualization
 */
function generateWealthTimeline(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlySavings: number,
  monthlyRate: number,
  monthlyExpenses: number,
  inflationAdjusted: boolean
): WealthDataPoint[] {
  const timeline: WealthDataPoint[] = [];
  const currentYear = new Date().getFullYear();
  let wealth = 0;

  // Accumulation phase: current age to retirement age
  for (let age = currentAge; age <= retirementAge; age++) {
    const yearsElapsed = age - currentAge;
    const monthsElapsed = yearsElapsed * 12;

    // Calculate wealth at this age using FV formula
    if (monthsElapsed === 0) {
      wealth = 0;
    } else if (monthlyRate === 0) {
      wealth = monthlySavings * monthsElapsed;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, monthsElapsed);
      wealth =
        monthlySavings *
        ((compoundFactor - 1) / monthlyRate) *
        (1 + monthlyRate);
    }

    timeline.push({
      age,
      year: currentYear + yearsElapsed,
      wealth: Math.round(wealth),
      phase: "accumulation",
    });
  }

  // Withdrawal phase: retirement age to life expectancy
  // Start with the projected wealth at retirement
  let withdrawalWealth = wealth;
  const annualExpenses = monthlyExpenses * 12;

  for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
    const yearsIntoRetirement = age - retirementAge;

    // Calculate expenses for this year (with inflation if enabled)
    let yearlyExpenses = annualExpenses;
    if (inflationAdjusted) {
      yearlyExpenses =
        annualExpenses * Math.pow(1 + DEFAULT_INFLATION_RATE, yearsIntoRetirement);
    }

    // Remaining wealth continues to grow at expected rate
    // but we withdraw expenses each year
    const annualRate = monthlyRate * 12;
    withdrawalWealth = withdrawalWealth * (1 + annualRate) - yearlyExpenses;

    // Prevent negative wealth
    withdrawalWealth = Math.max(0, withdrawalWealth);

    timeline.push({
      age,
      year: currentYear + (age - currentAge),
      wealth: Math.round(withdrawalWealth),
      phase: "withdrawal",
    });
  }

  return timeline;
}

/**
 * Returns Tailwind CSS classes for gap status color coding
 */
export function getGapStatusColor(
  status: "surplus" | "shortfall"
): {
  bg: string;
  text: string;
  badge: "default" | "destructive" | "outline" | "secondary";
} {
  switch (status) {
    case "surplus":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "default",
      };
    case "shortfall":
      return {
        bg: "bg-red-50 dark:bg-red-950",
        text: "text-destructive",
        badge: "destructive",
      };
  }
}
