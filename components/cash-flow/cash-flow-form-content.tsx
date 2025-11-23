"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CashFlow } from "@/lib/types/cash-flow";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

type FormValues = {
  monthlyIncome: number;
  expenses: number;
  debt: number;
  investments: number;
};

interface CashFlowFormContentProps {
  initialData?: CashFlow;
  onSuccess?: () => void;
}

export function CashFlowFormContent({
  initialData,
  onSuccess,
}: CashFlowFormContentProps) {
  const t = useTranslations("CashFlow.formContent");
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z
    .object({
      monthlyIncome: z.number().positive(t("validations.monthlyIncomePositive")),
      expenses: z.number().nonnegative(t("validations.expensesNonNegative")),
      debt: z.number().nonnegative(t("validations.debtNonNegative")),
      investments: z.number().nonnegative(t("validations.investmentsNonNegative")),
    })
    .refine(
      (data) =>
        data.expenses + data.debt + data.investments <= data.monthlyIncome,
      {
        message: t("validations.allocationExceedsIncome"),
        path: ["expenses"],
      }
    );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: initialData?.monthlyIncome || 75000,
      expenses: initialData?.expenses || 20000,
      debt: initialData?.debt || 25000,
      investments: initialData?.investments || 30000,
    },
  });

  const monthlyIncome = form.watch("monthlyIncome");
  const expenses = form.watch("expenses");
  const debt = form.watch("debt");
  const investments = form.watch("investments");

  const totalAllocated = expenses + debt + investments;
  const remainingCash = monthlyIncome - totalAllocated;

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);

      if (initialData?.id) {
        // Update existing
        await db.cashFlows.update(initialData.id, {
          monthlyIncome: values.monthlyIncome,
          expenses: values.expenses,
          debt: values.debt,
          investments: values.investments,
          updatedAt: new Date(),
        });
        toast.success(t("toastMessages.successUpdate"));
      } else {
        // Create new
        await db.cashFlows.add({
          id: crypto.randomUUID(),
          monthlyIncome: values.monthlyIncome,
          expenses: values.expenses,
          debt: values.debt,
          investments: values.investments,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(t("toastMessages.successCreate"));
        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      toast.error(t("toastMessages.error"));
      console.error("Error saving cash flow:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Monthly Income Input */}
        <FormField
          control={form.control}
          name="monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("monthlyIncomeLabel")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t("monthlyIncomePlaceholder")}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Expense Slider */}
        <FormField
          control={form.control}
          name="expenses"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("expensesLabel")}</FormLabel>
                <span className="text-sm font-semibold text-chart-1">
                  {expenses.toLocaleString()}
                </span>
              </div>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={monthlyIncome}
                  step={100}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Debt Slider */}
        <FormField
          control={form.control}
          name="debt"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("debtLabel")}</FormLabel>
                <span className="text-sm font-semibold text-chart-2">
                  {debt.toLocaleString()}
                </span>
              </div>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={monthlyIncome}
                  step={100}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Investment Slider */}
        <FormField
          control={form.control}
          name="investments"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("investmentsLabel")}</FormLabel>
                <span className="text-sm font-semibold text-chart-3">
                  {investments.toLocaleString()}
                </span>
              </div>
              <FormControl>
                <Slider
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={monthlyIncome}
                  step={100}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary Information */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("totalAllocated")}</span>
            <span
              className={`font-semibold ${
                totalAllocated > monthlyIncome
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {totalAllocated.toLocaleString()} ฿
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("remainingCash")}</span>
            <span
              className={`font-semibold ${
                remainingCash >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {remainingCash.toLocaleString()} ฿
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {((totalAllocated / monthlyIncome) * 100).toFixed(0)}{t("allocated")}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("savingButton") : initialData ? t("updateButton") : t("saveButton")}
        </Button>
      </form>
    </Form>
  );
}
