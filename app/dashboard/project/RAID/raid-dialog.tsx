// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { RaidTable } from './raid-table';

// interface RaidDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// export function RaidDialog({ open, onOpenChange }: RaidDialogProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-bold">RAID Log</DialogTitle>
//         </DialogHeader>
//         <RaidTable />
//       </DialogContent>
//     </Dialog>
//   );
// }