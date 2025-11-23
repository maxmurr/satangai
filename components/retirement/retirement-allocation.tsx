import { useTranslations } from "next-intl";
import type { RetirementProjection } from "@/lib/types/retirement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RetirementAllocationProps {
  projection: RetirementProjection;
}

export function RetirementAllocation({
  projection,
}: RetirementAllocationProps) {
  const t = useTranslations("Retirement.allocation");

  const allocations = [
    {
      name: t("stocksEquity"),
      amount: projection.stocks,
      percentage: projection.stockPercentage,
      color: "bg-chart-3",
    },
    {
      name: t("rmfSsfPvd"),
      amount: projection.funds,
      percentage: projection.fundPercentage,
      color: "bg-chart-4",
    },
    {
      name: t("cashEquivalents"),
      amount: projection.cash,
      percentage: projection.cashPercentage,
      color: "bg-chart-5",
    },
  ];

  const totalMonthlySavings = projection.monthlySavings;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allocations.map((allocation, index) => (
            <div key={allocation.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${allocation.color}`} />
                  <span className="font-medium">{allocation.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {allocation.amount.toLocaleString()}฿
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {allocation.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              {index < allocations.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}

          <Separator className="my-4" />

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span className="font-semibold">{t("total")}</span>
            <div className="text-right">
              <div className="text-lg font-bold">
                {totalMonthlySavings.toLocaleString()}฿
              </div>
              <div className="text-sm text-muted-foreground">100.0%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
