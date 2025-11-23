"use client";

import { useTranslations } from "next-intl";
import { CashFlowMetrics } from "@/lib/types/cash-flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CashFlowChartProps {
  metrics: CashFlowMetrics;
}

interface CashFlowTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: { name: string; value: number; percentage: string };
  }>;
  colors?: string[];
  amountLabel?: string;
  percentageLabel?: string;
}

function CashFlowTooltip({
  active,
  payload,
  colors,
  amountLabel = "Amount",
  percentageLabel = "Percentage",
}: CashFlowTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as {
    name: string;
    value: number;
    percentage: string;
  };

  const defaultColors = [
    "oklch(0.646 0.222 41.116)",
    "oklch(0.6 0.118 184.704)",
    "oklch(0.398 0.07 227.392)",
    "oklch(0.828 0.189 84.429)",
  ];

  const colorArray = colors || defaultColors;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: colorArray[0] }}
          />
          <div className="font-semibold text-card-foreground">{data.name}</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{amountLabel}:</span>
            <span className="font-mono font-bold text-foreground">
              {data.value.toLocaleString()} ฿
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{percentageLabel}:</span>
            <span className="font-mono font-bold text-foreground">
              {data.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart colors that match globals.css
const CHART_COLORS = {
  light: [
    "oklch(0.646 0.222 41.116)",    // chart-1: orange/amber
    "oklch(0.6 0.118 184.704)",     // chart-2: blue
    "oklch(0.398 0.07 227.392)",    // chart-3: purple
    "oklch(0.828 0.189 84.429)",    // chart-4: green/yellow
  ],
  dark: [
    "oklch(0.488 0.243 264.376)",   // chart-1: purple
    "oklch(0.696 0.17 162.48)",     // chart-2: cyan
    "oklch(0.769 0.188 70.08)",     // chart-3: yellow
    "oklch(0.627 0.265 303.9)",     // chart-4: pink
  ],
};

export function CashFlowChart({ metrics }: CashFlowChartProps) {
  const t = useTranslations("CashFlow.chart");

  // Get colors based on current theme (defaults to light)
  const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  const chartData = [
    {
      name: t("expenses"),
      value: metrics.expenses,
      percentage: ((metrics.expenses / metrics.monthlyIncome) * 100).toFixed(1),
    },
    {
      name: t("debtPayments"),
      value: metrics.debt,
      percentage: ((metrics.debt / metrics.monthlyIncome) * 100).toFixed(1),
    },
    {
      name: t("investments"),
      value: metrics.investments,
      percentage: ((metrics.investments / metrics.monthlyIncome) * 100).toFixed(
        1
      ),
    },
    {
      name: t("remainingCash"),
      value: Math.max(0, metrics.remainingCash),
      percentage: (
        (Math.max(0, metrics.remainingCash) / metrics.monthlyIncome) *
        100
      ).toFixed(1),
    },
  ];

  const chartConfig = {
    expenses: {
      label: "Expenses",
      color: `hsl(var(--color-chart-1))`,
    },
    debt: {
      label: "Debt",
      color: `hsl(var(--color-chart-2))`,
    },
    investments: {
      label: "Investments",
      color: `hsl(var(--color-chart-3))`,
    },
    remaining: {
      label: "Remaining",
      color: `hsl(var(--color-chart-4))`,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-72 w-full sm:h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CashFlowTooltip colors={colors} amountLabel={t("amount")} percentageLabel={t("percentage")} />} cursor={false} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                label={({ percentage }) => `${percentage}%`}
                isAnimationActive={true}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend and Details Table */}
        <div className="space-y-4 border-t pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {chartData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                </div>
                <div className="space-y-1 pl-4">
                  <p className="text-lg font-bold">{item.percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {item.value.toLocaleString()} ฿
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("totalAllocated")}</p>
              <p className="text-xl font-bold">
                {(
                  metrics.expenses +
                  metrics.debt +
                  metrics.investments
                ).toLocaleString()}{" "}
                ฿
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("totalIncome")}</p>
              <p className="text-xl font-bold">
                {metrics.monthlyIncome.toLocaleString()} ฿
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
