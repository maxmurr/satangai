"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z
  .object({
    monthlyIncome: z.number().positive("Monthly income must be positive"),
    expenses: z.number().nonnegative("Expenses cannot be negative"),
    debt: z.number().nonnegative("Debt cannot be negative"),
    investments: z.number().nonnegative("Investments cannot be negative"),
  })
  .refine(
    (data) =>
      data.expenses + data.debt + data.investments <= data.monthlyIncome,
    {
      message: "Total allocations cannot exceed income",
      path: ["expenses"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface CashFlowFormProps {
  initialData?: CashFlow;
  onSuccess?: () => void;
}

export function CashFlowForm({ initialData, onSuccess }: CashFlowFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
        toast.success("Cash flow updated successfully");
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
        toast.success("Cash flow saved successfully");
        form.reset();
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save cash flow data");
      console.error("Error saving cash flow:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Configuration</CardTitle>
        <CardDescription>
          Set your monthly income and allocation amounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Monthly Income Input */}
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (฿)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter monthly income"
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
                    <FormLabel>Expenses (฿)</FormLabel>
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
                    <FormLabel>Debt Payments (฿)</FormLabel>
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
                    <FormLabel>Investments (฿)</FormLabel>
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
                <span className="text-muted-foreground">Total Allocated</span>
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
                <span className="text-muted-foreground">Remaining Cash</span>
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
                  {((totalAllocated / monthlyIncome) * 100).toFixed(0)}%
                  allocated
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                ? "Update"
                : "Save Cash Flow"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
