"use client";

import { useTranslations } from "next-intl";
import type { WealthDataPoint } from "@/lib/types/retirement";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface RetirementChartProps {
  timeline: WealthDataPoint[];
  retirementAge: number;
}

export function RetirementChart({
  timeline,
  retirementAge,
}: RetirementChartProps) {
  const t = useTranslations("Retirement.chart");

  // Split data into accumulation and withdrawal phases for different colors
  const accumulationData = timeline.filter(
    (point) => point.phase === "accumulation"
  );
  const withdrawalData = timeline.filter(
    (point) => point.phase === "withdrawal"
  );

  // Combine data with phase-specific wealth values
  const chartData = timeline.map((point) => ({
    age: point.age,
    year: point.year,
    accumulationWealth: point.phase === "accumulation" ? point.wealth : null,
    withdrawalWealth: point.phase === "withdrawal" ? point.wealth : null,
    phase: point.phase,
  }));

  // Add retirement age point to both datasets for continuity
  if (accumulationData.length > 0 && withdrawalData.length > 0) {
    const retirementPoint = accumulationData[accumulationData.length - 1];
    chartData.forEach((point) => {
      if (point.age === retirementAge) {
        point.accumulationWealth = retirementPoint.wealth;
        point.withdrawalWealth = retirementPoint.wealth;
      }
    });
  }

  const chartConfig = {
    accumulation: {
      label: t("accumulation"),
      color: "hsl(221 83% 53%)", // blue-500 - growth and prosperity
    },
    withdrawal: {
      label: t("withdrawal"),
      color: "hsl(262 83% 58%)", // purple-500 - maturity and wisdom
    },
  } satisfies ChartConfig;

  // Format currency for tooltip and axis
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M฿`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K฿`;
    }
    return `${value.toFixed(0)}฿`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient
                  id="accumulationGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(221 83% 53%)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(221 83% 53%)"
                    stopOpacity={0.08}
                  />
                </linearGradient>
                <linearGradient
                  id="withdrawalGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(262 83% 58%)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(262 83% 58%)"
                    stopOpacity={0.08}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

              <XAxis
                dataKey="age"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: t("age"),
                  position: "insideBottom",
                  offset: -5,
                  style: { fontSize: 12 },
                }}
              />

              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: t("wealth"),
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;

                  const data = payload[0].payload;
                  const wealth =
                    data.accumulationWealth ?? data.withdrawalWealth ?? 0;
                  const phase =
                    data.accumulationWealth !== null
                      ? t("accumulation")
                      : t("withdrawal");

                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {t("age")}:
                          </span>
                          <span className="text-sm">{data.age}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {t("year")}:
                          </span>
                          <span className="text-sm">{data.year}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {t("wealth")}:
                          </span>
                          <span className="text-sm font-bold">
                            {wealth.toLocaleString()}฿
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium">
                            {t("phase")}:
                          </span>
                          <span className="text-sm">{phase}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Accumulation Phase Area */}
              <Area
                type="monotone"
                dataKey="accumulationWealth"
                stroke="hsl(221 83% 53%)"
                fill="url(#accumulationGradient)"
                strokeWidth={2.5}
                connectNulls={false}
              />

              {/* Withdrawal Phase Area */}
              <Area
                type="monotone"
                dataKey="withdrawalWealth"
                stroke="hsl(262 83% 58%)"
                fill="url(#withdrawalGradient)"
                strokeWidth={2.5}
                connectNulls={false}
              />

              {/* Retirement Age Reference Line */}
              <ReferenceLine
                x={retirementAge}
                stroke="hsl(0 84% 60%)"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: t("retirementAge"),
                  position: "top",
                  fill: "hsl(0 84% 60%)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "hsl(221 83% 53%)" }}
            />
            <span className="font-medium">{t("accumulation")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: "hsl(262 83% 58%)" }}
            />
            <span className="font-medium">{t("withdrawal")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
