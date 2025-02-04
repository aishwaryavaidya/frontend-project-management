// // RaidTable.tsx
// "use client";

// import { RAIDType } from "../lib/raidTypes";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { EyeIcon } from "lucide-react";
// import { formatDate } from "../lib/raidUtils";

// export function RaidTable({ raids, onEdit }: {
//   raids: RAIDType[];
//   onEdit: (raid: RAIDType) => void;
// }) {
//   const priorityColors = {
//     Extreme: "bg-red-600",
//     High: "bg-orange-500",
//     Medium: "bg-yellow-400",
//     Low: "bg-green-500"
//   };

//   const statusProgress = {
//     open: 30,
//     "in progress": 60,
//     closed: 100
//   };

//   return (
//     <div className="bg-card rounded-xl shadow overflow-hidden">
//       <table className="w-full">
//         <thead className="bg-muted">
//           <tr>
//             {["Milestone", "Category", "Priority", "Status", "Impact", "Actions"].map((header) => (
//               <th key={header} className="px-6 py-4 text-left">{header}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {raids.map((raid) => (
//             <tr key={raid.id} className="border-t hover:bg-muted/50">
//               <td className="px-6 py-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
//                     {raid.milestoneNo}
//                   </div>
//                   <div>
//                     <p className="font-medium">{raid.type}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {formatDate(raid.dateRaised)}
//                     </p>
//                   </div>
//                 </div>
//               </td>
//               <td className="px-6 py-4">
//                 <Badge variant="outline" className={
//                   raid.category === "Risk" ? "border-red-500 text-red-600" :
//                   raid.category === "Assumption" ? "border-green-500 text-green-600" :
//                   "border-blue-500 text-blue-600"
//                 }>
//                   {raid.category}
//                 </Badge>
//               </td>
//               <td className="px-6 py-4">
//                 <Badge className={`${priorityColors[raid.priority]} text-white`}>
//                   {raid.priority}
//                 </Badge>
//               </td>
//               <td className="px-6 py-4">
//                 <div className="flex items-center gap-2">
//                   <Progress value={statusProgress[raid.status]} className="w-24 h-2" />
//                   <Badge variant={raid.status === "closed" ? "default" : "secondary"}>
//                     {raid.status.toUpperCase()}
//                   </Badge>
//                 </div>
//               </td>
//               <td className="px-6 py-4">
//                 {raid.impact}
//               </td>
//               <td className="px-6 py-4">
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => onEdit(raid)}
//                 >
//                   <EyeIcon className="w-4 h-4 mr-2" />
//                   Details
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }