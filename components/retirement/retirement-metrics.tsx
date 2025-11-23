import { useTranslations } from "next-intl";
import type { RetirementProjection } from "@/lib/types/retirement";
import { getGapStatusColor } from "@/lib/utils/retirement-calculator";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface RetirementMetricsProps {
  projection: RetirementProjection;
}

export function RetirementMetrics({ projection }: RetirementMetricsProps) {
  const t = useTranslations("Retirement.metrics");

  const gapColors = getGapStatusColor(projection.gapStatus);
  const gapValue = Math.abs(projection.gap);
  const gapLabel =
    projection.gapStatus === "surplus" ? t("surplus") : t("shortfall");

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Gap Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("gapStatus")}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t("gapStatusDescription")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${gapColors.text}`}>
              {projection.gapStatus === "surplus" ? "+" : "-"}
              {(gapValue / 1000000).toFixed(2)}M
            </div>
            <Badge variant={gapColors.badge} className="text-xs">
              {gapLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Target Wealth Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("targetWealth")}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t("targetWealthDescription")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(projection.targetWealth / 1000000).toFixed(2)}M
          </div>
          <p className="text-xs text-muted-foreground">
            {projection.targetWealth.toLocaleString()}฿
          </p>
        </CardContent>
      </Card>

      {/* Projected Wealth Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("projectedWealth")}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t("projectedWealthDescription")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {(projection.projectedWealth / 1000000).toFixed(2)}M
          </div>
          <p className="text-xs text-muted-foreground">
            {projection.projectedWealth.toLocaleString()}฿
          </p>
        </CardContent>
      </Card>

      {/* Years to Retirement Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("yearsToRetirement")}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{t("yearsToRetirementDescription")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {projection.yearsToRetirement}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("years")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
