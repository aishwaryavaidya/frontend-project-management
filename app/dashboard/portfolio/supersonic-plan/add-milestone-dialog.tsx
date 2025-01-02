import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { Phase, Milestone } from '@/types/types';

interface AddMilestoneDialogProps {
  phases: Phase[];
  onAdd: (phaseId: number, milestone: Partial<Milestone>) => void;
}

export function AddMilestoneDialog({ phases, onAdd }: AddMilestoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [milestoneName, setMilestoneName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhase || !milestoneName) return;

    onAdd(parseInt(selectedPhase), {
      name: milestoneName,
      startDate: new Date(),
      endDate: new Date(),
      progress: 0,
      clientSpoc: "",
      apSpoc: "",
    });

    // Reset form and close dialog
    setMilestoneName("");
    setSelectedPhase("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Phase</Label>
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map(phase => (
                  <SelectItem key={phase.id} value={phase.id.toString()}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Milestone Name</Label>
            <Input
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              placeholder="Enter milestone name"
            />
          </div>
          <Button type="submit">Add Milestone</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}