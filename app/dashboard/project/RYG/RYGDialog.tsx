import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RYGForm } from './RYGForm';

interface RYGDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RYGDialog({ open, onOpenChange }: RYGDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Project Status (RYG)</DialogTitle>
        </DialogHeader>
        <RYGForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}