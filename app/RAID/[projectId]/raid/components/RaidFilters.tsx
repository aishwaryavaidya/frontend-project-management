// // app/RAID/[projectId]/raid/components/RaidFilters.tsx
// "use client"

// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { statuses, types, categories } from "../lib/raidData"

// export function RaidFilters({ filters, setFilters }: {
//   filters: { category?: string[]; status?: string[]; type?: string[] },
//   setFilters: (filters: any) => void
// }) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//       <Select
//         onValueChange={(value) => 
//           setFilters({ ...filters, category: value ? [value] : undefined })
//         }
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Category" />
//         </SelectTrigger>
//         <SelectContent>
//           {categories.map((cat: string) => (
//             <SelectItem key={cat} value={cat}>{cat}</SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Select
//         onValueChange={(value) => 
//           setFilters({ ...filters, status: value ? [value] : undefined })
//         }
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Status" />
//         </SelectTrigger>
//         <SelectContent>
//           {statuses.map((status: string) => (
//             <SelectItem key={status} value={status}>{status}</SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Select
//         onValueChange={(value) => 
//           setFilters({ ...filters, type: value ? [value] : undefined })
//         }
//       >
//         <SelectTrigger>
//           <SelectValue placeholder="Type" />
//         </SelectTrigger>
//         <SelectContent>
//           {types.map((type: string) => (
//             <SelectItem key={type} value={type}>{type}</SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Input
//         placeholder="Search..."
//         onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//       />
//     </div>
//   )
// }