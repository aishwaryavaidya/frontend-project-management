"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteTaskModalProps, Predecessor } from "../lib/types";
import { toast } from "sonner";

export function DeleteTaskModal({
  tasks,
  tasksToDelete,
  dependentTasks,
  onClose,
  onConfirm,
  onUpdateDependency,
}: DeleteTaskModalProps) {
  const handleConfirm = () => {
    const hasUnresolvedDependencies = dependentTasks.some(
      ({ task }) => task.predecessors.some(pred => tasksToDelete.includes(pred.taskId))
    );

    if (hasUnresolvedDependencies) {
      toast.error("Please resolve all dependencies before deleting tasks");
      return;
    }

    onConfirm();
    onClose();
    toast.success(`${tasksToDelete.length} task(s) deleted successfully`);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Task{tasksToDelete.length > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            {dependentTasks.length > 0
              ? "The following tasks have dependencies on the task(s) you're trying to delete. Please update their predecessors before continuing."
              : "Are you sure you want to delete the selected task(s)?"}
          </DialogDescription>
        </DialogHeader>

        {dependentTasks.length > 0 && (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {dependentTasks.map(({ task, dependencies }) => (
              <div key={task.id} className="space-y-2 border-b pb-4">
                <Label>Task: {task.name}</Label>
                <div className="flex items-center space-x-2">
                  <Label className="w-32">Current Predecessors:</Label>
                  <Input
                    value={task.predecessors.map(p => p.siNo).join(", ")}
                    onChange={(e) => {
                      const newPredecessors: Predecessor[] = e.target.value
                        .split(",")
                        .map(p => p.trim())
                        .filter(p => p)
                        .map(p => {
                          const siNo = parseInt(p);
                          const predTask = tasks[siNo - 1];
                          if (predTask && !tasksToDelete.includes(predTask.id)) {
                            return {
                              taskId: predTask.id,
                              type: "FS" as const,
                              siNo,
                            };
                          }
                          return null;
                        })
                        .filter((p): p is Predecessor => p !== null);

                      onUpdateDependency(task.id, newPredecessors);
                    }}
                    placeholder="Enter new predecessor SI numbers"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Delete Task{tasksToDelete.length > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}