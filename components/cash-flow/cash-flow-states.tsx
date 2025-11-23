"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CashFlowLoadingState() {
  return (
    <div className="space-y-8">
      {/* Metrics skeleton grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pie chart placeholder */}
          <div className="mx-auto flex h-72 w-full justify-center sm:h-80">
            <Skeleton className="h-64 w-64 rounded-full sm:h-80 sm:w-80" />
          </div>

          {/* Legend and details grid */}
          <div className="space-y-4 border-t pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary section */}
            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-28" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entry Info skeleton */}
      <Card className="border-muted">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CashFlowErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function CashFlowErrorState({
  error,
  onRetry,
}: CashFlowErrorStateProps) {
  const t = useTranslations("CashFlow.states");

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("errorTitle")}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          {error || t("errorDescription")}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            {t("tryAgain")}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface CashFlowEmptyStateProps {
  onGetStarted?: () => void;
}

export function CashFlowEmptyState({ onGetStarted }: CashFlowEmptyStateProps) {
  const t = useTranslations("CashFlow.states");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus className="h-8 w-8" />
        </EmptyMedia>
        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
        <EmptyDescription>
          {t("emptyDescription")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onGetStarted && (
          <Button onClick={onGetStarted} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t("createFirstEntry")}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
