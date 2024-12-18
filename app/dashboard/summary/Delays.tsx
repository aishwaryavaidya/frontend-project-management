"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";

const taskData = [
  { plannedEnd: 5, actualEnd: 4, taskName: "Task 1", isCritical: false },
  { plannedEnd: 7, actualEnd: 8, taskName: "Task 2", isCritical: true },
  { plannedEnd: 6, actualEnd: 6, taskName: "Task 3", isCritical: false },
  { plannedEnd: 9, actualEnd: 7, taskName: "Task 4", isCritical: false },
  { plannedEnd: 4, actualEnd: 6, taskName: "Task 5", isCritical: true },
];

const Delays: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 dark:text-gray-200 shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Task Progress vs. Deadlines</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* X-Axis */}
          <XAxis
            type="number"
            dataKey="plannedEnd"
            name="Planned End Date"
            unit=" days"
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          {/* Y-Axis */}
          <YAxis
            type="number"
            dataKey="actualEnd"
            name="Actual Completion Date"
            unit=" days"
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          {/* Tooltip */}
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          {/* Legend */}
          <Legend verticalAlign="top" height={36} />
          {/* Reference Line for "on-schedule" tasks */}
          <ReferenceLine x1={0} y1={0} slope={1} stroke="#4CAF50" strokeWidth={2} />
          {/* Scatter Points */}
          <Scatter name="Tasks" data={taskData} fill="#8884d8">
            {taskData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.actualEnd <= entry.plannedEnd ? "green" : "red"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Delays;
