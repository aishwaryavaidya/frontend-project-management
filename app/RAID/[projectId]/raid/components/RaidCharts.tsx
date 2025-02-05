// app/RAID/[projectId]/raid/components/RaidCharts.tsx
"use client"
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from "recharts"
import { useProject } from '@/context/ProjectContext'
import { formatDate } from '@/lib/utils/raid'
const COLORS = {
  Risk: '#F97316',
  Assumption: '#7E69AB',
  Issue: '#16adf9',
  Dependency: '#f9c016'
}
export function RaidCharts() {
  const { raidItems } = useProject()
  const categoryData = [
    { name: 'Risk', value: raidItems.filter(r => r.category === 'Risk').length },
    { name: 'Assumption', value: raidItems.filter(r => r.category === 'Assumption').length },
    { name: 'Issue', value: raidItems.filter(r => r.category === 'Issue').length },
    { name: 'Dependency', value: raidItems.filter(r => r.category === 'Dependency').length },
  ]
  const priorityData = ['Extreme', 'High', 'Medium', 'Low'].map(priority => {
    const itemsWithPriority = raidItems.filter(r => r.priority === priority)
    return {
      name: priority,
      Risk: itemsWithPriority.filter(item => item.category === 'Risk').length,
      Assumption: itemsWithPriority.filter(item => item.category === 'Assumption').length,
      Issue: itemsWithPriority.filter(item => item.category === 'Issue').length,
      Dependency: itemsWithPriority.filter(item => item.category === 'Dependency').length,
    }
  })
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Category Distribution */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-semibold mb-3">Category Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={categoryData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={60}
                fill="#8884d8"
              >
                {
                  categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))
                }
              </Pie>
              <Tooltip />
              <Legend layout="horizontal" align="center" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Priority Analysis */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-semibold mb-3">Priority Analysis</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Risk" stackId="a" fill={COLORS.Risk} />
              <Bar dataKey="Assumption" stackId="a" fill={COLORS.Assumption} />
              <Bar dataKey="Issue" stackId="a" fill={COLORS.Issue} />
              <Bar dataKey="Dependency" stackId="a" fill={COLORS.Dependency} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Status Timeline */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-semibold mb-3">Status Timeline</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={raidItems}>
              <XAxis 
                dataKey="dateRaised" 
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={40}
              />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="probability" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}