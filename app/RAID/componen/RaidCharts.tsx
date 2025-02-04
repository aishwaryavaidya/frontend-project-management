// "use client";

// import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
// import { RAIDType } from "../lib/raidTypes";
// import { categories, priorities } from "../lib/raidData";
// import { formatDate } from "../lib/raidUtils";

// export function RaidCharts({ raids }: { raids: RAIDType[] }) {
//   const categoryData = categories.map(cat => ({
//     name: cat,
//     value: raids.filter(r => r.category === cat).length
//   }));

//   const priorityData = priorities.map(p => ({
//     name: p,
//     value: raids.filter(r => r.priority === p).length
//   }));

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//       {/* Category Distribution */}
//       <div className="bg-card p-6 rounded-xl shadow">
//         <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" />
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Priority Analysis */}
//       <div className="bg-card p-6 rounded-xl shadow">
//         <h3 className="text-lg font-semibold mb-4">Priority Analysis</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={priorityData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="value" fill="#82ca9d" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Status Timeline */}
//       <div className="bg-card p-6 rounded-xl shadow">
//         <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={raids}>
//             <XAxis dataKey="dateRaised" tickFormatter={formatDate} />
//             <YAxis />
//             <Tooltip />
//             <Line type="monotone" dataKey="probability" stroke="#8884d8" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }