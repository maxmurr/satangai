"use client";

import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CashFlow } from "@/lib/types/cash-flow";
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
import { CashFlowFormContent } from "@/components/cash-flow/cash-flow-form-content";

interface CashFlowFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CashFlow;
}

export function CashFlowFormModal({
  open,
  onOpenChange,
  initialData,
}: CashFlowFormModalProps) {
  const t = useTranslations("CashFlow.formModal");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formContent = (
    <CashFlowFormContent
      initialData={initialData}
      onSuccess={() => onOpenChange(false)}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? t("updateTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>
              {initialData ? t("updateDescription") : t("createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">{formContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {initialData ? t("updateTitle") : t("createTitle")}
          </DrawerTitle>
          <DrawerDescription>
            {initialData ? t("updateDescription") : t("createDescription")}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 py-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
