"use client";

import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { RetirementPlan } from "@/lib/types/retirement";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RetirementFormContent } from "./retirement-form-content";

interface RetirementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RetirementPlan;
}

export function RetirementFormModal({
  open,
  onOpenChange,
  initialData,
}: RetirementFormModalProps) {
  const t = useTranslations("Retirement.formModal");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = initialData ? t("updateTitle") : t("createTitle");
  const description = initialData
    ? t("updateDescription")
    : t("createDescription");

  const handleSuccess = () => {
    onOpenChange(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <RetirementFormContent
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <RetirementFormContent
            initialData={initialData}
            onSuccess={handleSuccess}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
