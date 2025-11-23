"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useCashflowData } from "@/hooks/use-cashflow-data";
import { calculateCashFlowMetrics } from "@/lib/utils/cash-flow-calculator";
import { CashFlowFormModal } from "@/components/cash-flow/cash-flow-form-modal";
import { CashFlowMetricsCards } from "@/components/cash-flow/cash-flow-metrics";
import { CashFlowChart } from "@/components/cash-flow/cash-flow-chart";
import {
  CashFlowLoadingState,
  CashFlowErrorState,
  CashFlowEmptyState,
} from "@/components/cash-flow/cash-flow-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function CashFlowPage() {
  const t = useTranslations("CashFlow");
  const format = useFormatter();
  const { cashflows, isLoading, error } = useCashflowData();
  const [formOpen, setFormOpen] = useState(false);

  if (error) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CashFlowErrorState
          error={error?.message || t("error")}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CashFlowLoadingState />
      </div>
    );
  }

  if (!cashflows || cashflows.length === 0) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md text-center space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-muted-foreground">{t("description")}</p>
            </div>
            <CashFlowEmptyState onGetStarted={() => setFormOpen(true)} />
          </div>
        </div>
        <CashFlowFormModal open={formOpen} onOpenChange={setFormOpen} />
      </>
    );
  }

  // Get the most recent cash flow entry
  const latestCashFlow = cashflows[0];
  const metrics = calculateCashFlowMetrics(latestCashFlow);

  return (
    <>
      <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("edit")}
          </Button>
        </div>

        {/* Metrics Cards */}
        <CashFlowMetricsCards metrics={metrics} />

        {/* Chart */}
        <CashFlowChart metrics={metrics} />

        {/* Entry Info */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-base">{t("entryInfo.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {t("entryInfo.created")}
                </p>
                <p className="font-medium">
                  {format.dateTime(new Date(latestCashFlow.createdAt), "short")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("entryInfo.lastUpdated")}
                </p>
                <p className="font-medium">
                  {format.dateTime(new Date(latestCashFlow.updatedAt), "short")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  {t("entryInfo.monthlyIncome")}
                </p>
                <p className="font-medium">
                  {latestCashFlow.monthlyIncome.toLocaleString()} ฿
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Form */}
      <CashFlowFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={latestCashFlow}
      />
    </>
  );
}
