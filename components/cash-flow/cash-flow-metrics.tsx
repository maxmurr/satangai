"use client";

import { useTranslations } from "next-intl";
import { CashFlowMetrics } from "@/lib/types/cash-flow";
import { getHealthCategoryColor } from "@/lib/utils/cash-flow-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CashFlowMetricsProps {
  metrics: CashFlowMetrics;
}

export function CashFlowMetricsCards({ metrics }: CashFlowMetricsProps) {
  const t = useTranslations("CashFlow.metrics");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Financial Health Score */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("financialHealthScore")}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("financialHealthDescription")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.financialHealthScore}
          </div>
          <p className="text-xs text-muted-foreground">{t("outOf")}</p>
          <Badge
            className={`mt-2 ${getHealthCategoryColor(metrics.healthCategory)}`}
          >
            {t(metrics.healthCategory === "Excellent" ? "excellent" :
               metrics.healthCategory === "Good" ? "good" : "needsImprovement")}
          </Badge>
        </CardContent>
      </Card>

      {/* Debt to Equity Ratio */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("debtToEquityRatio")}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("debtToEquityDescription")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {metrics.debtToEquityRatio === Infinity
              ? "∞"
              : metrics.debtToEquityRatio.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.debtToEquityRatio <= 0.5
              ? t("excellent")
              : metrics.debtToEquityRatio <= 1
              ? t("good")
              : t("needsImprovement")}
          </p>
        </CardContent>
      </Card>

      {/* Saving Ratio */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{t("savingRatio")}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("savingRatioDescription")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(metrics.savingRatio * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.savingRatio >= 0.2 ? t("onTarget") : t("belowTarget")}
          </p>
        </CardContent>
      </Card>

      {/* Remaining Cash */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {t("remainingCash")}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  {t("remainingCashDescription")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              metrics.remainingCash >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {metrics.remainingCash.toLocaleString()} ฿
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.remainingCash >= 0 ? t("available") : t("overAllocated")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
