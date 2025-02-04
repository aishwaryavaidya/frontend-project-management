// app/RAID/[projectId]/raid/components/RaidCharts.tsx
"use client"

import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { useProject } from '@/context/ProjectContext'
import { formatDate } from '@/lib/utils/raid'

export function RaidCharts() {
  const { raidItems } = useProject()

  const categoryData = [
    { name: 'Risk', value: raidItems.filter(r => r.category === 'Risk').length },
    { name: 'Assumption', value: raidItems.filter(r => r.category === 'Assumption').length },
    { name: 'Dependency', value: raidItems.filter(r => r.category === 'Dependency').length },
  ]

  const priorityData = [
    { name: 'Extreme', value: raidItems.filter(r => r.priority === 'Extreme').length },
    { name: 'High', value: raidItems.filter(r => r.priority === 'High').length },
    { name: 'Medium', value: raidItems.filter(r => r.priority === 'Medium').length },
    { name: 'Low', value: raidItems.filter(r => r.priority === 'Low').length },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Category Distribution */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-sm font-semibold mb-3">Category Distribution</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} />
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
              <Bar dataKey="value" fill="#82ca9d" />
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