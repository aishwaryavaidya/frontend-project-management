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
import type { ActivityLog } from "@/types/raid";
import { cn } from "@/lib/utils";

interface ActivitiesModalProps {
  open: boolean;
  onClose: () => void;
  activities: ActivityLog[];
  onSave: (newActivities: ActivityLog[]) => void;
}

export function ActivitiesModal({
  open,
  onClose,
  activities,
  onSave,
}: ActivitiesModalProps) {
  const [localActivities, setLocalActivities] = useState<ActivityLog[]>([]);

  // Initialize localActivities when modal is opened or activities prop changes
  useEffect(() => {
    if (open) {
      setLocalActivities(
        activities.map((activity) => ({
          ...activity,
          date:
            activity.date instanceof Date
              ? activity.date
              : new Date(activity.date),
        }))
      );
    }
  }, [open, activities]);

  const formatDateForInput = (date: Date) => {
    try {
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Invalid date:", date);
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl animate-slide-in sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <div className="backdrop-blur-sm bg-background/95 p-6 shadow-lg">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              Activities Log
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-3">
              {localActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex gap-3 group p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Input
                    value={activity.activity}
                    onChange={(e) => {
                      const newActivities = [...localActivities];
                      newActivities[index].activity = e.target.value;
                      setLocalActivities(newActivities);
                    }}
                    placeholder="Activity description"
                    className={cn(
                      "flex-1 transition-all border-muted focus:ring-2 focus:ring-primary/20",
                      "bg-transparent hover:bg-background"
                    )}
                  />
                  <Input
                    type="date"
                    value={formatDateForInput(activity.date)}
                    onChange={(e) => {
                      const newActivities = [...localActivities];
                      newActivities[index].date = new Date(e.target.value);
                      setLocalActivities(newActivities);
                    }}
                    className="w-32 transition-colors border-muted hover:border-primary/50 bg-transparent"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLocalActivities(
                        localActivities.filter((_, i) => i !== index)
                      )
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
                setLocalActivities([
                  ...localActivities,
                  { activity: "", date: new Date() },
                ])
              }
              className="w-full hover:bg-primary/5 hover:text-primary transition-colors border-dashed"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add Activity
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
                onClick={() => {
                  onSave(localActivities);
                  onClose();
                }}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-sm hover:shadow-lg"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
