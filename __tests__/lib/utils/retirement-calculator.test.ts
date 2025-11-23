import { describe, it, expect } from "vitest";
import {
  calculateRetirementProjection,
  getGapStatusColor,
} from "@/lib/utils/retirement-calculator";
import type { RetirementPlan } from "@/lib/types/retirement";

// Thailand average inflation rate used in calculator
const DEFAULT_INFLATION_RATE = 0.04;

/**
 * Helper function to create mock RetirementPlan objects with sensible defaults
 */
const createMockRetirementPlan = (
  overrides?: Partial<RetirementPlan>
): RetirementPlan => {
  const now = new Date();
  return {
    id: "test-id",
    userId: "test-user",
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    monthlySavings: 10000,
    monthlyExpenses: 30000,
    expectedReturnRate: 7,
    inflationAdjusted: false,
    stocks: 5000,
    funds: 3000,
    cash: 2000,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

describe("calculateRetirementProjection", () => {
  describe("validation and error handling", () => {
    it("should throw error when current age >= retirement age", () => {
      const plan = createMockRetirementPlan({
        currentAge: 60,
        retirementAge: 60,
      });

      expect(() => calculateRetirementProjection(plan)).toThrow(
        "Retirement age must be greater than current age"
      );
    });

    it("should throw error when current age > retirement age", () => {
      const plan = createMockRetirementPlan({
        currentAge: 65,
        retirementAge: 60,
      });

      expect(() => calculateRetirementProjection(plan)).toThrow(
        "Retirement age must be greater than current age"
      );
    });

    it("should throw error when retirement age >= life expectancy", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 85,
        lifeExpectancy: 85,
      });

      expect(() => calculateRetirementProjection(plan)).toThrow(
        "Life expectancy must be greater than retirement age"
      );
    });

    it("should throw error when retirement age > life expectancy", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 90,
        lifeExpectancy: 85,
      });

      expect(() => calculateRetirementProjection(plan)).toThrow(
        "Life expectancy must be greater than retirement age"
      );
    });

    it("should accept valid age ranges", () => {
      const plan = createMockRetirementPlan({
        currentAge: 25,
        retirementAge: 60,
        lifeExpectancy: 85,
      });

      expect(() => calculateRetirementProjection(plan)).not.toThrow();
    });
  });

  describe("time period calculations", () => {
    it("should calculate years to retirement correctly", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.yearsToRetirement).toBe(30);
    });

    it("should calculate retirement years correctly", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.retirementYears).toBe(25);
    });

    it("should handle short time to retirement", () => {
      const plan = createMockRetirementPlan({
        currentAge: 59,
        retirementAge: 60,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.yearsToRetirement).toBe(1);
    });

    it("should handle long retirement period", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 50,
        lifeExpectancy: 100,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.retirementYears).toBe(50);
    });
  });

  describe("total invested calculation", () => {
    it("should calculate total invested correctly", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
      });

      const result = calculateRetirementProjection(plan);
      // 30 years * 12 months * 10000 = 3,600,000
      expect(result.totalInvested).toBe(3600000);
    });

    it("should calculate total invested for short period", () => {
      const plan = createMockRetirementPlan({
        currentAge: 59,
        retirementAge: 60,
        monthlySavings: 5000,
      });

      const result = calculateRetirementProjection(plan);
      // 1 year * 12 months * 5000 = 60,000
      expect(result.totalInvested).toBe(60000);
    });

    it("should handle zero monthly savings", () => {
      const plan = createMockRetirementPlan({
        monthlySavings: 0,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.totalInvested).toBe(0);
    });

    it("should handle high monthly savings", () => {
      const plan = createMockRetirementPlan({
        currentAge: 25,
        retirementAge: 65,
        monthlySavings: 50000,
      });

      const result = calculateRetirementProjection(plan);
      // 40 years * 12 months * 50000 = 24,000,000
      expect(result.totalInvested).toBe(24000000);
    });
  });

  describe("projected wealth calculation (FV of Annuity)", () => {
    it("should calculate projected wealth with zero return rate", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 0,
      });

      const result = calculateRetirementProjection(plan);
      // With 0% return, FV = total invested
      expect(result.projectedWealth).toBe(3600000);
    });

    it("should calculate projected wealth with positive return rate", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 7, // 7% annual
      });

      const result = calculateRetirementProjection(plan);

      // Manual calculation:
      // monthlyRate = 0.07 / 12 ≈ 0.00583333
      // months = 30 * 12 = 360
      // FV = 10000 × [((1.00583333^360 - 1) / 0.00583333)] × 1.00583333
      // FV ≈ 12,204,477

      expect(result.projectedWealth).toBeGreaterThan(3600000); // More than total invested
      // Verify within reasonable range (actual calculation may vary slightly from manual calc)
      expect(result.projectedWealth).toBeGreaterThan(12000000);
      expect(result.projectedWealth).toBeLessThan(13000000);
    });

    it("should calculate projected wealth with high return rate", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 15, // 15% annual (aggressive)
      });

      const result = calculateRetirementProjection(plan);

      // With 15% annual return over 30 years, wealth should be significantly higher
      expect(result.projectedWealth).toBeGreaterThan(20000000);
    });

    it("should calculate projected wealth with low return rate", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 2, // 2% annual (conservative)
      });

      const result = calculateRetirementProjection(plan);

      // With 2% annual return, should be slightly more than total invested
      expect(result.projectedWealth).toBeGreaterThan(3600000);
      expect(result.projectedWealth).toBeLessThan(6000000);
    });

    it("should handle short accumulation period with returns", () => {
      const plan = createMockRetirementPlan({
        currentAge: 59,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 7,
      });

      const result = calculateRetirementProjection(plan);

      // 1 year with 7% return
      // FV should be slightly more than 12 * 10000 = 120,000
      expect(result.projectedWealth).toBeGreaterThan(120000);
      expect(result.projectedWealth).toBeLessThan(130000);
    });

    it("should verify FV formula accuracy with known values", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 40, // 10 years
        monthlySavings: 1000,
        expectedReturnRate: 6, // 6% annual
      });

      const result = calculateRetirementProjection(plan);

      // Known result for FV of annuity:
      // monthlyRate = 0.06 / 12 = 0.005
      // months = 10 * 12 = 120
      // FV = 1000 × [((1.005^120 - 1) / 0.005)] × 1.005
      // FV ≈ 164,699

      expect(result.projectedWealth).toBeCloseTo(164699, -2);
    });
  });

  describe("target wealth calculation", () => {
    it("should calculate target wealth without inflation adjustment", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlyExpenses: 30000,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      // Simple calculation: 25 years * 12 months * 30,000
      const expected = 25 * 12 * 30000;
      expect(result.targetWealth).toBe(expected);
      expect(result.targetWealth).toBe(9000000);
    });

    it("should calculate target wealth with inflation adjustment", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlyExpenses: 30000,
        inflationAdjusted: true,
      });

      const result = calculateRetirementProjection(plan);

      // With inflation, target wealth should be higher
      // Using growing annuity formula
      const annualExpenses = 30000 * 12;
      const retirementYears = 25;
      const inflationFactor =
        (Math.pow(1 + DEFAULT_INFLATION_RATE, retirementYears) - 1) /
        DEFAULT_INFLATION_RATE;
      const expected = annualExpenses * inflationFactor;

      expect(result.targetWealth).toBeCloseTo(expected, 0);
      expect(result.targetWealth).toBeGreaterThan(9000000); // More than non-inflation
    });

    it("should handle zero monthly expenses", () => {
      const plan = createMockRetirementPlan({
        monthlyExpenses: 0,
      });

      const result = calculateRetirementProjection(plan);
      expect(result.targetWealth).toBe(0);
    });

    it("should handle high monthly expenses", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlyExpenses: 100000,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      // 25 years * 12 months * 100,000 = 30,000,000
      expect(result.targetWealth).toBe(30000000);
    });

    it("should calculate inflation-adjusted target for short retirement", () => {
      const plan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 65, // Only 5 years
        monthlyExpenses: 30000,
        inflationAdjusted: true,
      });

      const result = calculateRetirementProjection(plan);

      // Shorter period = less inflation impact
      const annualExpenses = 30000 * 12;
      const inflationFactor =
        (Math.pow(1 + DEFAULT_INFLATION_RATE, 5) - 1) /
        DEFAULT_INFLATION_RATE;
      const expected = annualExpenses * inflationFactor;

      expect(result.targetWealth).toBeCloseTo(expected, 0);
    });
  });

  describe("gap analysis", () => {
    it("should calculate surplus when projected > target", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySavings: 50000, // High savings
        monthlyExpenses: 20000, // Lower expenses
        expectedReturnRate: 7,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.gap).toBeGreaterThan(0);
      expect(result.gapStatus).toBe("surplus");
      expect(result.projectedWealth).toBeGreaterThan(result.targetWealth);
    });

    it("should calculate shortfall when projected < target", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySavings: 5000, // Low savings
        monthlyExpenses: 100000, // High expenses
        expectedReturnRate: 3,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.gap).toBeLessThan(0);
      expect(result.gapStatus).toBe("shortfall");
      expect(result.projectedWealth).toBeLessThan(result.targetWealth);
    });

    it("should handle zero gap (exact match)", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySavings: 10000,
        monthlyExpenses: 30000,
        expectedReturnRate: 0,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      // With 0% return:
      // Projected = 10000 * 30 * 12 = 3,600,000
      // Target = 30000 * 25 * 12 = 9,000,000
      // Gap = -5,400,000 (shortfall)

      expect(result.gap).toBe(result.projectedWealth - result.targetWealth);
    });

    it("should calculate large surplus", () => {
      const plan = createMockRetirementPlan({
        currentAge: 25,
        retirementAge: 65,
        lifeExpectancy: 85,
        monthlySavings: 100000,
        monthlyExpenses: 50000,
        expectedReturnRate: 10,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.gap).toBeGreaterThan(50000000);
      expect(result.gapStatus).toBe("surplus");
    });

    it("should calculate large shortfall", () => {
      const plan = createMockRetirementPlan({
        currentAge: 55,
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlySavings: 5000,
        monthlyExpenses: 100000,
        expectedReturnRate: 2,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.gap).toBeLessThan(-20000000);
      expect(result.gapStatus).toBe("shortfall");
    });
  });

  describe("portfolio allocation percentages", () => {
    it("should calculate portfolio percentages correctly", () => {
      const plan = createMockRetirementPlan({
        stocks: 5000,
        funds: 3000,
        cash: 2000,
      });

      const result = calculateRetirementProjection(plan);

      // Total = 10,000
      expect(result.stockPercentage).toBe(50); // 5000/10000 * 100
      expect(result.fundPercentage).toBe(30); // 3000/10000 * 100
      expect(result.cashPercentage).toBe(20); // 2000/10000 * 100

      // Percentages should sum to 100
      const total = result.stockPercentage + result.fundPercentage + result.cashPercentage;
      expect(total).toBeCloseTo(100, 1);
    });

    it("should handle equal allocation", () => {
      const plan = createMockRetirementPlan({
        stocks: 3333,
        funds: 3333,
        cash: 3334,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.stockPercentage).toBeCloseTo(33.33, 1);
      expect(result.fundPercentage).toBeCloseTo(33.33, 1);
      expect(result.cashPercentage).toBeCloseTo(33.34, 1);
    });

    it("should handle 100% stock allocation", () => {
      const plan = createMockRetirementPlan({
        stocks: 10000,
        funds: 0,
        cash: 0,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.stockPercentage).toBe(100);
      expect(result.fundPercentage).toBe(0);
      expect(result.cashPercentage).toBe(0);
    });

    it("should handle 100% cash allocation", () => {
      const plan = createMockRetirementPlan({
        stocks: 0,
        funds: 0,
        cash: 10000,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.stockPercentage).toBe(0);
      expect(result.fundPercentage).toBe(0);
      expect(result.cashPercentage).toBe(100);
    });

    it("should handle zero total allocation", () => {
      const plan = createMockRetirementPlan({
        stocks: 0,
        funds: 0,
        cash: 0,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.stockPercentage).toBe(0);
      expect(result.fundPercentage).toBe(0);
      expect(result.cashPercentage).toBe(0);
    });

    it("should handle fractional allocations", () => {
      const plan = createMockRetirementPlan({
        stocks: 1234.56,
        funds: 2345.67,
        cash: 3456.78,
      });

      const result = calculateRetirementProjection(plan);

      const total = 1234.56 + 2345.67 + 3456.78;
      expect(result.stockPercentage).toBeCloseTo((1234.56 / total) * 100, 1);
      expect(result.fundPercentage).toBeCloseTo((2345.67 / total) * 100, 1);
      expect(result.cashPercentage).toBeCloseTo((3456.78 / total) * 100, 1);
    });
  });

  describe("wealth timeline generation", () => {
    it("should generate timeline with correct number of data points", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 85,
      });

      const result = calculateRetirementProjection(plan);

      // Timeline should include:
      // - Accumulation: ages 30-60 (31 points including start)
      // - Withdrawal: ages 61-85 (25 points)
      // Total: 56 points
      expect(result.wealthTimeline).toHaveLength(56);
    });

    it("should have accumulation phase data points", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 40,
      });

      const result = calculateRetirementProjection(plan);

      const accumulationPoints = result.wealthTimeline.filter(
        (p) => p.phase === "accumulation"
      );

      // Ages 30-35 (6 points)
      expect(accumulationPoints).toHaveLength(6);
      expect(accumulationPoints[0].age).toBe(30);
      expect(accumulationPoints[accumulationPoints.length - 1].age).toBe(35);
    });

    it("should have withdrawal phase data points", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 40,
      });

      const result = calculateRetirementProjection(plan);

      const withdrawalPoints = result.wealthTimeline.filter(
        (p) => p.phase === "withdrawal"
      );

      // Ages 36-40 (5 points)
      expect(withdrawalPoints).toHaveLength(5);
      expect(withdrawalPoints[0].age).toBe(36);
      expect(withdrawalPoints[withdrawalPoints.length - 1].age).toBe(40);
    });

    it("should start accumulation phase with zero wealth", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
      });

      const result = calculateRetirementProjection(plan);

      const firstPoint = result.wealthTimeline[0];
      expect(firstPoint.age).toBe(30);
      expect(firstPoint.wealth).toBe(0);
      expect(firstPoint.phase).toBe("accumulation");
    });

    it("should have increasing wealth during accumulation phase", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        monthlySavings: 10000,
        expectedReturnRate: 5,
      });

      const result = calculateRetirementProjection(plan);

      const accumulationPoints = result.wealthTimeline.filter(
        (p) => p.phase === "accumulation"
      );

      // Each point should have wealth >= previous (monotonically increasing)
      for (let i = 1; i < accumulationPoints.length; i++) {
        expect(accumulationPoints[i].wealth).toBeGreaterThanOrEqual(
          accumulationPoints[i - 1].wealth
        );
      }
    });

    it("should have decreasing wealth during withdrawal phase with expenses", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 40,
        monthlySavings: 50000,
        monthlyExpenses: 100000, // High expenses
        expectedReturnRate: 3,
        inflationAdjusted: false,
      });

      const result = calculateRetirementProjection(plan);

      const withdrawalPoints = result.wealthTimeline.filter(
        (p) => p.phase === "withdrawal"
      );

      // When expenses > returns, wealth should generally decrease
      // Check first few years show decline
      expect(withdrawalPoints[1].wealth).toBeLessThan(withdrawalPoints[0].wealth);
    });

    it("should never have negative wealth in timeline", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 70, // Long retirement
        monthlySavings: 5000, // Low savings
        monthlyExpenses: 50000, // High expenses
        expectedReturnRate: 2,
      });

      const result = calculateRetirementProjection(plan);

      // All wealth values should be >= 0
      result.wealthTimeline.forEach((point) => {
        expect(point.wealth).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have correct year values in timeline", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 40,
      });

      const result = calculateRetirementProjection(plan);
      const currentYear = new Date().getFullYear();

      // First point should be current year
      expect(result.wealthTimeline[0].year).toBe(currentYear);

      // Last point should be current year + (life expectancy - current age)
      const lastPoint = result.wealthTimeline[result.wealthTimeline.length - 1];
      expect(lastPoint.year).toBe(currentYear + (40 - 30));
    });

    it("should transition from accumulation to withdrawal at retirement age", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        lifeExpectancy: 40,
      });

      const result = calculateRetirementProjection(plan);

      // Find the transition points
      const retirementPoint = result.wealthTimeline.find(
        (p) => p.age === 35 && p.phase === "accumulation"
      );
      const firstWithdrawalPoint = result.wealthTimeline.find(
        (p) => p.age === 36 && p.phase === "withdrawal"
      );

      expect(retirementPoint).toBeDefined();
      expect(firstWithdrawalPoint).toBeDefined();
    });
  });

  describe("return value integrity", () => {
    it("should spread all original plan properties", () => {
      const plan = createMockRetirementPlan({
        id: "custom-id",
        userId: "custom-user",
        currentAge: 35,
        monthlySavings: 15000,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.id).toBe("custom-id");
      expect(result.userId).toBe("custom-user");
      expect(result.currentAge).toBe(35);
      expect(result.monthlySavings).toBe(15000);
      expect(result.createdAt).toBe(plan.createdAt);
      expect(result.updatedAt).toBe(plan.updatedAt);
    });

    it("should return all required RetirementProjection properties", () => {
      const plan = createMockRetirementPlan();
      const result = calculateRetirementProjection(plan);

      // Core RetirementPlan properties
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("currentAge");
      expect(result).toHaveProperty("retirementAge");
      expect(result).toHaveProperty("lifeExpectancy");

      // Calculated RetirementProjection properties
      expect(result).toHaveProperty("yearsToRetirement");
      expect(result).toHaveProperty("retirementYears");
      expect(result).toHaveProperty("totalInvested");
      expect(result).toHaveProperty("projectedWealth");
      expect(result).toHaveProperty("targetWealth");
      expect(result).toHaveProperty("gap");
      expect(result).toHaveProperty("gapStatus");
      expect(result).toHaveProperty("stockPercentage");
      expect(result).toHaveProperty("fundPercentage");
      expect(result).toHaveProperty("cashPercentage");
      expect(result).toHaveProperty("wealthTimeline");
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle very young starting age", () => {
      const plan = createMockRetirementPlan({
        currentAge: 18,
        retirementAge: 65,
        lifeExpectancy: 90,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(47);
      expect(result.wealthTimeline).toHaveLength(73); // 18-90
    });

    it("should handle late retirement age", () => {
      const plan = createMockRetirementPlan({
        currentAge: 60,
        retirementAge: 70,
        lifeExpectancy: 85,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(10);
      expect(result.retirementYears).toBe(15);
    });

    it("should handle very long life expectancy", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 110,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.retirementYears).toBe(50);
    });

    it("should handle minimum 1 year to retirement", () => {
      const plan = createMockRetirementPlan({
        currentAge: 64,
        retirementAge: 65,
        lifeExpectancy: 85,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(1);
      expect(() => calculateRetirementProjection(plan)).not.toThrow();
    });

    it("should handle minimum 1 year retirement", () => {
      const plan = createMockRetirementPlan({
        currentAge: 60,
        retirementAge: 65,
        lifeExpectancy: 66,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.retirementYears).toBe(1);
      expect(() => calculateRetirementProjection(plan)).not.toThrow();
    });

    it("should handle very high return rates", () => {
      const plan = createMockRetirementPlan({
        expectedReturnRate: 20, // 20% annual
      });

      const result = calculateRetirementProjection(plan);

      expect(result.projectedWealth).toBeGreaterThan(result.totalInvested);
      expect(Number.isFinite(result.projectedWealth)).toBe(true);
    });

    it("should handle very low return rates", () => {
      const plan = createMockRetirementPlan({
        expectedReturnRate: 0.1, // 0.1% annual
      });

      const result = calculateRetirementProjection(plan);

      expect(result.projectedWealth).toBeGreaterThan(result.totalInvested);
      // With very low return, should be close to total invested (within 2% difference)
      const difference = result.projectedWealth - result.totalInvested;
      expect(difference).toBeLessThan(result.totalInvested * 0.02);
    });

    it("should handle negative return rates", () => {
      const plan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 35,
        monthlySavings: 10000,
        expectedReturnRate: -5, // -5% annual (economic crisis)
      });

      const result = calculateRetirementProjection(plan);

      // With negative returns, projected should be less than total invested
      expect(result.projectedWealth).toBeLessThan(result.totalInvested);
      expect(Number.isFinite(result.projectedWealth)).toBe(true);
    });

    it("should handle very large numbers", () => {
      const plan = createMockRetirementPlan({
        currentAge: 25,
        retirementAge: 65,
        monthlySavings: 500000,
        monthlyExpenses: 1000000,
        expectedReturnRate: 12,
      });

      const result = calculateRetirementProjection(plan);

      expect(Number.isFinite(result.projectedWealth)).toBe(true);
      expect(Number.isFinite(result.targetWealth)).toBe(true);
      expect(Number.isFinite(result.gap)).toBe(true);
    });

    it("should handle fractional values", () => {
      const plan = createMockRetirementPlan({
        monthlySavings: 12345.67,
        monthlyExpenses: 23456.78,
        expectedReturnRate: 6.75,
      });

      const result = calculateRetirementProjection(plan);

      expect(Number.isFinite(result.projectedWealth)).toBe(true);
      expect(Number.isFinite(result.targetWealth)).toBe(true);
    });
  });

  describe("inflation adjustment scenarios", () => {
    it("should calculate higher target wealth with inflation enabled", () => {
      const basePlan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlyExpenses: 30000,
        inflationAdjusted: false,
      });

      const inflationPlan = createMockRetirementPlan({
        retirementAge: 60,
        lifeExpectancy: 85,
        monthlyExpenses: 30000,
        inflationAdjusted: true,
      });

      const baseResult = calculateRetirementProjection(basePlan);
      const inflationResult = calculateRetirementProjection(inflationPlan);

      expect(inflationResult.targetWealth).toBeGreaterThan(baseResult.targetWealth);
    });

    it("should not affect projected wealth calculation", () => {
      const basePlan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 7,
        inflationAdjusted: false,
      });

      const inflationPlan = createMockRetirementPlan({
        currentAge: 30,
        retirementAge: 60,
        monthlySavings: 10000,
        expectedReturnRate: 7,
        inflationAdjusted: true,
      });

      const baseResult = calculateRetirementProjection(basePlan);
      const inflationResult = calculateRetirementProjection(inflationPlan);

      // Projected wealth should be the same
      expect(inflationResult.projectedWealth).toBe(baseResult.projectedWealth);
    });

    it("should affect gap status due to higher target", () => {
      // This scenario might have surplus without inflation, shortfall with inflation
      const basePlan = createMockRetirementPlan({
        currentAge: 50,
        retirementAge: 60,
        lifeExpectancy: 75,
        monthlySavings: 50000,
        monthlyExpenses: 60000,
        expectedReturnRate: 5,
        inflationAdjusted: false,
      });

      const inflationPlan = { ...basePlan, inflationAdjusted: true };

      const baseResult = calculateRetirementProjection(basePlan);
      const inflationResult = calculateRetirementProjection(inflationPlan);

      // Gap should be smaller (or more negative) with inflation
      expect(inflationResult.gap).toBeLessThan(baseResult.gap);
    });
  });

  describe("realistic retirement scenarios", () => {
    it("should handle typical Thai early-career scenario", () => {
      const plan = createMockRetirementPlan({
        currentAge: 25,
        retirementAge: 60,
        lifeExpectancy: 80,
        monthlySavings: 5000,
        monthlyExpenses: 15000,
        expectedReturnRate: 6,
        inflationAdjusted: true,
        stocks: 3000,
        funds: 1500,
        cash: 500,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(35);
      expect(result.retirementYears).toBe(20);
      expect(result.projectedWealth).toBeGreaterThan(0);
      expect(result.gapStatus).toMatch(/surplus|shortfall/);
    });

    it("should handle mid-career aggressive saver scenario", () => {
      const plan = createMockRetirementPlan({
        currentAge: 40,
        retirementAge: 55,
        lifeExpectancy: 85,
        monthlySavings: 80000,
        monthlyExpenses: 100000,
        expectedReturnRate: 8,
        inflationAdjusted: true,
        stocks: 50000,
        funds: 20000,
        cash: 10000,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(15);
      expect(result.projectedWealth).toBeGreaterThan(10000000);
    });

    it("should handle late-career conservative scenario", () => {
      const plan = createMockRetirementPlan({
        currentAge: 55,
        retirementAge: 65,
        lifeExpectancy: 85,
        monthlySavings: 30000,
        monthlyExpenses: 40000,
        expectedReturnRate: 3,
        inflationAdjusted: true,
        stocks: 5000,
        funds: 15000,
        cash: 10000,
      });

      const result = calculateRetirementProjection(plan);

      expect(result.yearsToRetirement).toBe(10);
      expect(result.retirementYears).toBe(20);
    });
  });
});

describe("getGapStatusColor", () => {
  it("should return correct colors for surplus status", () => {
    const colors = getGapStatusColor("surplus");

    expect(colors).toHaveProperty("bg");
    expect(colors).toHaveProperty("text");
    expect(colors).toHaveProperty("badge");

    expect(colors.bg).toBe("bg-emerald-50 dark:bg-emerald-950");
    expect(colors.text).toBe("text-emerald-600 dark:text-emerald-400");
    expect(colors.badge).toBe("default");
  });

  it("should return correct colors for shortfall status", () => {
    const colors = getGapStatusColor("shortfall");

    expect(colors).toHaveProperty("bg");
    expect(colors).toHaveProperty("text");
    expect(colors).toHaveProperty("badge");

    expect(colors.bg).toBe("bg-red-50 dark:bg-red-950");
    expect(colors.text).toBe("text-destructive");
    expect(colors.badge).toBe("destructive");
  });

  it("should return object with all required properties", () => {
    const surplusColors = getGapStatusColor("surplus");
    const shortfallColors = getGapStatusColor("shortfall");

    // Check all properties exist and are strings
    expect(typeof surplusColors.bg).toBe("string");
    expect(typeof surplusColors.text).toBe("string");
    expect(typeof surplusColors.badge).toBe("string");

    expect(typeof shortfallColors.bg).toBe("string");
    expect(typeof shortfallColors.text).toBe("string");
    expect(typeof shortfallColors.badge).toBe("string");

    // Check strings are not empty
    expect(surplusColors.bg.length).toBeGreaterThan(0);
    expect(surplusColors.text.length).toBeGreaterThan(0);
    expect(surplusColors.badge.length).toBeGreaterThan(0);

    expect(shortfallColors.bg.length).toBeGreaterThan(0);
    expect(shortfallColors.text.length).toBeGreaterThan(0);
    expect(shortfallColors.badge.length).toBeGreaterThan(0);
  });

  it("should return different colors for different statuses", () => {
    const surplusColors = getGapStatusColor("surplus");
    const shortfallColors = getGapStatusColor("shortfall");

    // Ensure surplus and shortfall have different styling
    expect(surplusColors.bg).not.toBe(shortfallColors.bg);
    expect(surplusColors.text).not.toBe(shortfallColors.text);
    expect(surplusColors.badge).not.toBe(shortfallColors.badge);
  });
});
