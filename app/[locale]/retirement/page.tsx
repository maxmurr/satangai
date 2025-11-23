"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRetirementData } from "@/hooks/use-retirement-data";
import { calculateRetirementProjection } from "@/lib/utils/retirement-calculator";

import { Button } from "@/components/ui/button";
import {
  RetirementLoadingState,
  RetirementErrorState,
  RetirementEmptyState,
} from "@/components/retirement/retirement-states";
import { RetirementMetrics } from "@/components/retirement/retirement-metrics";
import { RetirementChart } from "@/components/retirement/retirement-chart";
import { RetirementAllocation } from "@/components/retirement/retirement-allocation";
import { RetirementFormModal } from "@/components/retirement/retirement-form-modal";
import { Plus } from "lucide-react";

export default function RetirementPage() {
  const t = useTranslations("Retirement");
  const [formOpen, setFormOpen] = useState(false);
  const { retirements, isLoading, error } = useRetirementData();

  // Error state
  if (error) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <RetirementErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <RetirementLoadingState />
      </div>
    );
  }

  // Empty state
  if (retirements.length === 0) {
    return (
      <>
        <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <div className="flex min-h-[calc(100vh-18rem)] items-center justify-center">
            <RetirementEmptyState onCreateFirst={() => setFormOpen(true)} />
          </div>
        </div>
        <RetirementFormModal open={formOpen} onOpenChange={setFormOpen} />
      </>
    );
  }

  // Get the most recent retirement plan
  const latestPlan = retirements[0];

  // Calculate projections
  const projection = calculateRetirementProjection(latestPlan);

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
            {t("formModal.updateTitle")}
          </Button>
        </div>

        {/* Metrics Cards */}
        <RetirementMetrics projection={projection} />

        {/* Wealth Timeline Chart */}
        <RetirementChart
          timeline={projection.wealthTimeline}
          retirementAge={projection.retirementAge}
        />

        {/* Portfolio Allocation */}
        <RetirementAllocation projection={projection} />
      </div>

      {/* Form Modal */}
      <RetirementFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={latestPlan}
      />
    </>
  );
}
