"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusIcon, TrashIcon } from "lucide-react";
import type { MitigationPlan } from "@/types/raid";
import { cn } from "@/lib/utils";

interface MitigationPlanModalProps {
  plan: MitigationPlan[];
  onSave: (newPlan: MitigationPlan[]) => Promise<void> | void;
  open: boolean;
  onClose: () => void;
}

export function MitigationPlanModal({
  plan,
  onSave,
  open,
  onClose,
}: MitigationPlanModalProps) {
  // Local state for editing the plan steps
  const [localPlan, setLocalPlan] = useState<MitigationPlan[]>([]);

  // Reset localPlan when modal opens
  useEffect(() => {
    if (open) {
      setLocalPlan(
        plan.map((step) => ({
          ...step,
          // Ensure the date is a Date object even if it comes as a string
          date: step.date ? new Date(step.date) : new Date(),
        }))
      );
    }
  }, [open, plan]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert dates to ISO strings for server compatibility
      const sanitizedPlan = localPlan.map((step) => ({
        ...step,
        date: step.date.toISOString(),
      }));
      await onSave(sanitizedPlan);
      // Close the modal on successful save
      onClose();
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl animate-slide-in sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <div className="backdrop-blur-sm bg-background/95 p-6 shadow-lg">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Mitigation Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              {localPlan.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-3 group p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Input
                    value={step.item}
                    onChange={(e) => {
                      const newPlan = [...localPlan];
                      newPlan[index].item = e.target.value;
                      setLocalPlan(newPlan);
                    }}
                    placeholder="Step description"
                    className={cn(
                      "flex-1 transition-all border-muted focus:ring-2 focus:ring-primary/20",
                      "bg-transparent hover:bg-background"
                    )}
                  />
                  <Input
                    type="date"
                    value={step.date.toISOString().split("T")[0]}
                    onChange={(e) => {
                      const newPlan = [...localPlan];
                      newPlan[index].date = new Date(e.target.value);
                      setLocalPlan(newPlan);
                    }}
                    className="w-32 transition-colors border-muted hover:border-primary/50 bg-transparent"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLocalPlan(localPlan.filter((_, i) => i !== index))
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setLocalPlan([
                  ...localPlan,
                  { item: "", date: new Date() },
                ])
              }
              className="w-full hover:bg-primary/5 hover:text-primary transition-colors border-dashed"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add Step
            </Button>

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="hover:bg-muted/50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow-lg"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
