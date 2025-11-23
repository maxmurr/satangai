"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { db } from "@/lib/db";
import type { RetirementPlan } from "@/lib/types/retirement";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface RetirementFormContentProps {
  initialData?: RetirementPlan;
  onSuccess?: () => void;
}

export function RetirementFormContent({
  initialData,
  onSuccess,
}: RetirementFormContentProps) {
  const t = useTranslations("Retirement.formContent");
  const [isLoading, setIsLoading] = useState(false);

  // Define validation schema with translations
  const formSchema = z
    .object({
      currentAge: z
        .number()
        .min(18, { message: t("validations.currentAgeMin") })
        .max(100, { message: t("validations.currentAgeMax") }),
      retirementAge: z
        .number()
        .min(18, { message: t("validations.currentAgeMin") })
        .max(100, { message: t("validations.retirementAgeMax") }),
      lifeExpectancy: z
        .number()
        .min(18, { message: t("validations.currentAgeMin") })
        .max(120, { message: t("validations.lifeExpectancyMax") }),
      monthlySavings: z
        .number()
        .min(0, { message: t("validations.monthlySavingsNonNegative") })
        .max(1000000, { message: t("validations.monthlySavingsMax") }),
      monthlyExpenses: z
        .number()
        .min(1, { message: t("validations.monthlyExpensesPositive") })
        .max(1000000, { message: t("validations.monthlyExpensesMax") }),
      expectedReturnRate: z
        .number()
        .min(-10, { message: t("validations.returnRateMin") })
        .max(20, { message: t("validations.returnRateMax") }),
      inflationAdjusted: z.boolean(),
      stocks: z.number().min(0),
      funds: z.number().min(0),
      cash: z.number().min(0),
    })
    .refine((data) => data.retirementAge > data.currentAge, {
      message: t("validations.retirementAgeGreater"),
      path: ["retirementAge"],
    })
    .refine((data) => data.lifeExpectancy > data.retirementAge, {
      message: t("validations.lifeExpectancyGreater"),
      path: ["lifeExpectancy"],
    })
    .refine(
      (data) => {
        const total = data.stocks + data.funds + data.cash;
        const savingsTotal = data.monthlySavings;
        return Math.abs(total - savingsTotal) < 0.01; // Allow small floating point errors
      },
      {
        message: t("validations.allocationMustEqual100", { percent: "XXX" }),
        path: ["stocks"],
      }
    );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: initialData?.currentAge ?? 30,
      retirementAge: initialData?.retirementAge ?? 60,
      lifeExpectancy: initialData?.lifeExpectancy ?? 85,
      monthlySavings: initialData?.monthlySavings ?? 50000,
      monthlyExpenses: initialData?.monthlyExpenses ?? 80000,
      expectedReturnRate: initialData?.expectedReturnRate ?? 3,
      inflationAdjusted: initialData?.inflationAdjusted ?? false,
      stocks: initialData?.stocks ?? 25000,
      funds: initialData?.funds ?? 15000,
      cash: initialData?.cash ?? 10000,
    },
  });

  const watchedValues = form.watch();
  const totalAllocation =
    watchedValues.stocks + watchedValues.funds + watchedValues.cash;
  const monthlySavings = watchedValues.monthlySavings;
  const allocationPercent =
    monthlySavings > 0 ? (totalAllocation / monthlySavings) * 100 : 0;

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (initialData?.id) {
        // Update existing plan
        await db.retirements.update(initialData.id, {
          ...values,
          updatedAt: new Date(),
        });
        toast.success(t("toastMessages.successUpdate"));
      } else {
        // Create new plan
        await db.retirements.add({
          id: crypto.randomUUID(),
          userId: "default-user", // TODO: Replace with actual user ID when auth is implemented
          ...values,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success(t("toastMessages.successCreate"));
      }
      onSuccess?.();
    } catch (error) {
      toast.error(t("toastMessages.error"));
      console.error("Failed to save retirement plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-adjust allocation when monthly savings changes
  useEffect(() => {
    const savingsValue = form.getValues("monthlySavings");
    const currentTotal = form.getValues("stocks") + form.getValues("funds") + form.getValues("cash");

    // If allocations were previously set, maintain the proportions
    if (currentTotal > 0 && savingsValue !== currentTotal) {
      const stockRatio = form.getValues("stocks") / currentTotal;
      const fundRatio = form.getValues("funds") / currentTotal;
      const cashRatio = form.getValues("cash") / currentTotal;

      form.setValue("stocks", Math.round(savingsValue * stockRatio));
      form.setValue("funds", Math.round(savingsValue * fundRatio));
      form.setValue("cash", Math.round(savingsValue * cashRatio));
    }
  }, [watchedValues.monthlySavings, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("personalInfo")}</h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="currentAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currentAgeLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("currentAgePlaceholder")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retirementAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("retirementAgeLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("retirementAgePlaceholder")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lifeExpectancy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("lifeExpectancyLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("lifeExpectancyPlaceholder")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Financial Goals Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t("financialGoals")}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="monthlySavings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("monthlySavingsLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("monthlySavingsPlaceholder")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("monthlyExpensesLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("monthlyExpensesPlaceholder")}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expectedReturnRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {t("expectedReturnRateLabel")}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("expectedReturnRateHelp")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inflationAdjusted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("inflationAdjustedLabel")}
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    {t("inflationAdjustedHelp")}
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Portfolio Allocation Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{t("portfolioAllocation")}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("portfolioAllocationHelp")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <FormField
            control={form.control}
            name="stocks"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    {t("stocksLabel")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("stocksHelp")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <span className="text-sm font-medium">
                    {field.value.toLocaleString()}฿ (
                    {monthlySavings > 0
                      ? ((field.value / monthlySavings) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={monthlySavings}
                    step={100}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isLoading}
                    className="[&_[role=slider]]:bg-chart-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="funds"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    {t("fundsLabel")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("fundsHelp")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <span className="text-sm font-medium">
                    {field.value.toLocaleString()}฿ (
                    {monthlySavings > 0
                      ? ((field.value / monthlySavings) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={monthlySavings}
                    step={100}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isLoading}
                    className="[&_[role=slider]]:bg-chart-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cash"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    {t("cashLabel")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("cashHelp")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <span className="text-sm font-medium">
                    {field.value.toLocaleString()}฿ (
                    {monthlySavings > 0
                      ? ((field.value / monthlySavings) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={monthlySavings}
                    step={100}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isLoading}
                    className="[&_[role=slider]]:bg-chart-5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Allocation Summary */}
          <Card className={allocationPercent === 100 ? "border-emerald-500" : "border-destructive"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("totalAllocation")}</span>
                <span
                  className={`text-lg font-bold ${
                    allocationPercent === 100
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {totalAllocation.toLocaleString()}฿ ({allocationPercent.toFixed(1)}%{" "}
                  {t("allocationStatus")})
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? t("savingButton")
            : initialData
              ? t("updateButton")
              : t("saveButton")}
        </Button>
      </form>
    </Form>
  );
}
