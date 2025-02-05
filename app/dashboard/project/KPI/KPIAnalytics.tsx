// "use client"

// import React from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   BarChart,
//   Bar
// } from 'recharts';

// interface KPI {
//   id: string;
//   parameter: string;
//   status: 'red' | 'yellow' | 'green';
//   actualDate: string;
//   remarks: { [key: string]: string };
// }

// interface KPIAnalyticsProps {
//   kpis: KPI[];
//   weeks: string[];
// }

// const STATUS_COLORS = {
//   red: '#EF4444',
//   yellow: '#F59E0B',
//   green: '#10B981'
// };

// const STATUS_VALUES = {
//   red: 1,
//   yellow: 2,
//   green: 3
// };

// export function KPIAnalytics({ kpis, weeks }: KPIAnalyticsProps) {
//   // Prepare data for status distribution pie chart
//   const getStatusDistribution = () => {
//     const distribution = { red: 0, yellow: 0, green: 0 };
//     kpis.forEach(kpi => {
//       distribution[kpi.status]++;
//     });
//     return Object.entries(distribution).map(([status, count]) => ({
//       status,
//       count
//     }));
//   };

//   // Prepare data for parameter status timeline
//   const getParameterTimeline = () => {
//     const timelineData = weeks.map(week => {
//       const weekData: any = { week };
//       kpis.forEach(kpi => {
//         weekData[kpi.parameter] = STATUS_VALUES[kpi.status];
//       });
//       return weekData;
//     });
//     return timelineData;
//   };

//   // Calculate completion rate over weeks
//   const getCompletionRate = () => {
//     return weeks.map(week => {
//       const totalKPIs = kpis.length;
//       const greenKPIs = kpis.filter(kpi => kpi.status === 'green').length;
//       return {
//         week,
//         rate: (greenKPIs / totalKPIs) * 100
//       };
//     });
//   };

//   return (
//     <div className="space-y-8 p-6">
//       <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
//         KPI Analytics
//       </h2>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Status Distribution */}
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
//           <h3 className="text-lg font-semibold mb-4">Current Status Distribution</h3>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={getStatusDistribution()}
//                   dataKey="count"
//                   nameKey="status"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {getStatusDistribution().map((entry, index) => (
//                     <Cell key={index} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Completion Rate Trend */}
//         {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
//           <h3 className="text-lg font-semibold mb-4">Completion Rate Trend</h3>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={getCompletionRate()}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="week" />
//                 <YAxis unit="%" />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="rate"
//                   name="Completion Rate"
//                   stroke="#8884d8"
//                   activeDot={{ r: 8 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div> */}

//         {/* Status Timeline */}
//         {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg lg:col-span-2">
//           <h3 className="text-lg font-semibold mb-4">Parameter Status Timeline</h3>
//           <div className="h-[400px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={getParameterTimeline()}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="week" />
//                 <YAxis domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(value) => {
//                   return { 1: 'Red', 2: 'Yellow', 3: 'Green' }[value] || '';
//                 }} />
//                 <Tooltip />
//                 <Legend />
//                 {kpis.map((kpi, index) => (
//                   <Bar
//                     key={kpi.id}
//                     dataKey={kpi.parameter}
//                     stackId="status"
//                     fill={`hsl(${index * (360 / kpis.length)}, 70%, 50%)`}
//                   />
//                 ))}
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// }